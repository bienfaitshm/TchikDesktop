import { eq, sql } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  feeAssignments,
  studentPayments,
  User,
  wallets,
  type InsertFeeAssignment,
  type FeeAssignment,
} from "@/packages/@core/data-access/db/schemas";
import {
  FEE_SCHEDULES_ENUM,
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import {
  DatabaseError,
  RecordNotFoundError,
  TransactionError,
} from "@/packages/drizzle-queries";
import {
  FeeAssignmentRepository,
  FeeConfigurationRepository,
  StudentPaymentRepository,
  DailyExchangeRateRepository,
  WalletRepository,
  feeAssignmentRepository,
  feeConfigurationRepository,
  studentPaymentRepository,
  dailyExchangeRateRepository,
  walletRepository,
} from "./repository";
import { enrollmentRepository, EnrollmentRepository } from "../enrollments";
import { classroomRepository, ClassroomRepository } from "../classrooms";
import { getLogger, CustomLogger } from "@/packages/logger";

const EXCHANGE_RATE_SCALE = 1_000_000;

export type AssignmentTableOfClassroom = {
  enrollmentId: string;
  student: User;
  payments: { [scheduleId: string]: FeeAssignment | null };
};

export type TableClassroomPaymentAssignment = {
  feeTypeId: string;
  name: string;
  table: {
    head: { id: string; name: string }[];
    body: AssignmentTableOfClassroom[];
  };
};

export class BusinessRuleError extends Error {
  constructor(
    message: string,
    public readonly code = "BUSINESS_RULE_VIOLATION",
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ExchangeRateNotFoundError extends BusinessRuleError {
  constructor(from: string, to: string, date: string) {
    super(
      `Aucun taux de change défini le ${date} pour convertir le ${from} en ${to}.`,
      "EXCHANGE_RATE_MISSING",
    );
  }
}

export class OverpaymentError extends BusinessRuleError {
  constructor(remaining: number, currency: string) {
    super(
      `Le montant versé dépasse le reste à payer de cet élève (${remaining / 100} ${currency}).`,
      "OVERPAYMENT_FORBIDDEN",
    );
  }
}

export class PaymentService {
  logger: CustomLogger;

  constructor(
    private readonly feeConfigRepo: FeeConfigurationRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly studentPaymentRepo: StudentPaymentRepository,
    private readonly rateRepo: DailyExchangeRateRepository,
    private readonly walletRepo: WalletRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly classroomRepo: ClassroomRepository,
    private readonly clientDb: TDataBase = db,
  ) {
    this.logger = getLogger("PaymentService");
  }

  private validateContext(
    schoolId?: string,
    yearId?: string,
  ): asserts schoolId is string {
    if (!schoolId || !yearId) {
      throw new BusinessRuleError(
        "Missing Context: schoolId and yearId are required.",
        "INVALID_CONTEXT",
      );
    }
  }

  private getLocalDateString(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  }

  private buildAssignmentKey(
    enrollmentId: string,
    feeConfigId: string,
    scheduleId: string,
  ): string {
    return `${enrollmentId}-${feeConfigId}-${scheduleId}`;
  }

  private extractRequiredAssignments(configs: any[]) {
    return configs.flatMap((config) => {
      const schedules = config.feeType?.schedules || [];
      return schedules.map((schedule: any) => ({
        feeConfigId: config.feeConfigId,
        scheduleId: schedule.scheduleId,
      }));
    });
  }

  async syncClassroomFeeAssignments(ctx: {
    schoolId: string;
    yearId: string;
    classId: string;
  }) {
    const { schoolId, yearId, classId } = ctx;

    try {
      this.logger.info(
        `[Sync Background] Starting fee assignment sync for classroom: ${classId}`,
      );

      const classroom = await this.classroomRepo.findById(
        classId,
        this.clientDb,
      );
      if (!classroom) {
        this.logger.warn(
          `[Sync Background] Classroom ${classId} not found. Aborting sync.`,
        );
        return { configs: [], enrollments: [] };
      }

      const [activeEnrollments, applicableConfigs] = await Promise.all([
        this.enrollmentRepo.getActiveEnrollments(
          { where: { schoolId, yearId, classroomId: classId } },
          this.clientDb,
        ),
        this.feeConfigRepo.findApplicableConfigurations(
          {
            classroomId: classroom.classId,
            optionId: classroom.optionId,
            section: classroom.section,
            schoolId,
            yearId,
          },
          this.clientDb,
        ),
      ]);

      if (!activeEnrollments.length || !applicableConfigs.length) {
        this.logger.info(
          `[Sync Background] No active enrollments or configs for classroom ${classId}.`,
        );
        return { configs: applicableConfigs, enrollments: activeEnrollments };
      }

      const requiredAssignments =
        this.extractRequiredAssignments(applicableConfigs);
      if (!requiredAssignments.length) {
        return { configs: applicableConfigs, enrollments: activeEnrollments };
      }

      const enrollmentIds = activeEnrollments.map((e) => e.enrollmentId);
      const existingAssignments = await this.feeAssignmentRepo.findMany({
        whereIn: { enrollmentId: enrollmentIds },
      });

      const existingKeysMap = new Set<string>(
        existingAssignments.map((existing) =>
          this.buildAssignmentKey(
            existing.enrollmentId as string,
            existing.feeConfigId as string,
            existing.scheduleId as string,
          ),
        ),
      );

      const assignmentsToCreate: InsertFeeAssignment[] = [];

      for (const enrollment of activeEnrollments) {
        for (const assignment of requiredAssignments) {
          const key = this.buildAssignmentKey(
            enrollment.enrollmentId,
            assignment.feeConfigId,
            assignment.scheduleId,
          );

          if (!existingKeysMap.has(key)) {
            assignmentsToCreate.push({
              amountPaid: 0,
              status: FEE_SCHEDULES_ENUM.UNPAID,
              enrollmentId: enrollment.enrollmentId,
              feeConfigId: assignment.feeConfigId,
              scheduleId: assignment.scheduleId,
            });
            existingKeysMap.add(key);
          }
        }
      }

      if (assignmentsToCreate.length > 0) {
        this.logger.info(
          `[Sync Background] Creating ${assignmentsToCreate.length} new assignments.`,
        );
        await this.feeAssignmentRepo.bulkCreate(assignmentsToCreate);
      } else {
        this.logger.info(
          `[Sync Background] All enrollments are up to date. No insertions needed.`,
        );
      }

      return {
        configs: applicableConfigs,
        enrollments: activeEnrollments,
      };
    } catch (error) {
      this.logger.error(
        `[Sync Background] Sync failed for classroom ${classId}:`,
        error,
      );
      throw DatabaseError.from(
        error,
        "Failed to synchronize student fee assignments.",
      );
    }
  }

  async getAssignmentTableOfClassroom(filters: {
    schoolId: string;
    yearId: string;
    classId: string;
  }): Promise<TableClassroomPaymentAssignment[]> {
    this.logger.info(
      `[Payment Table] Fetching assignment table for classroom ${filters.classId}`,
    );

    const { configs, enrollments } =
      await this.syncClassroomFeeAssignments(filters);

    if (!enrollments.length || !configs.length) return [];

    const enrollmentIds = enrollments.map((e) => e.enrollmentId);
    const assignments = await this.feeAssignmentRepo.findMany({
      whereIn: { enrollmentId: enrollmentIds },
    });

    const assignmentGrouped = assignments.reduce(
      (acc, current) => {
        const key = this.buildAssignmentKey(
          current.enrollmentId as string,
          current.feeConfigId as string,
          current.scheduleId as string,
        );
        acc[key] = current as FeeAssignment;
        return acc;
      },
      {} as Record<string, FeeAssignment>,
    );

    return configs.map((config) => {
      const head =
        config.feeType?.schedules.map((sch) => ({
          id: sch.scheduleId,
          name: sch.installmentName,
        })) ?? [];

      return {
        feeTypeId: config.feeTypeId as string,
        name: config.feeType?.name as string,
        table: {
          head,
          body: enrollments.map((enrollment) => ({
            enrollmentId: enrollment.enrollmentId as string,
            student: enrollment.student,
            payments: head.reduce(
              (acc, current) => {
                const key = this.buildAssignmentKey(
                  enrollment.enrollmentId,
                  config.feeConfigId,
                  current.id,
                );
                acc[current.id] = assignmentGrouped[key] ?? null;
                return acc;
              },
              {} as Record<string, FeeAssignment | null>,
            ),
          })),
        },
      };
    });
  }

  /**
   * ACTION AUTOMATIQUE : Générer la dette d'un élève lors de son inscription active
   */
  async assignFeesToStudent(
    payload: {
      schoolId: string;
      yearId: string;
      enrollmentId: string;
      classroomId: string;
    },
    tx: TDataBase = this.clientDb,
  ) {
    this.validateContext(payload.schoolId, payload.yearId);
    this.logger.info(
      `[Initial Assignment] Processing fees for enrollment ${payload.enrollmentId}`,
    );

    try {
      const classroom = await this.classroomRepo.findById(
        payload.classroomId,
        tx,
      );
      if (!classroom) {
        throw new BusinessRuleError(
          `Classroom ${payload.classroomId} not found.`,
        );
      }

      const configs = await this.feeConfigRepo.findApplicableConfigurations(
        {
          classroomId: classroom.classId,
          optionId: classroom.optionId,
          section: classroom.section,
          schoolId: payload.schoolId,
          yearId: payload.yearId,
        },
        tx,
      );

      const requiredAssignments = this.extractRequiredAssignments(configs);

      if (requiredAssignments.length === 0) {
        this.logger.info(
          `[Initial Assignment] No fee configs applied for enrollment ${payload.enrollmentId}`,
        );
        return;
      }

      const assignmentsToCreate: InsertFeeAssignment[] =
        requiredAssignments.map((req) => ({
          enrollmentId: payload.enrollmentId,
          feeConfigId: req.feeConfigId,
          scheduleId: req.scheduleId,
          amountPaid: 0,
          status: FEE_SCHEDULES_ENUM.UNPAID,
        }));

      const assignmentClient = this.feeAssignmentRepo.getClient(tx);
      await assignmentClient
        .insert(feeAssignments)
        .values(assignmentsToCreate)
        .onConflictDoNothing();

      this.logger.info(
        `[Initial Assignment] Successfully assigned ${assignmentsToCreate.length} schedules to ${payload.enrollmentId}`,
      );
    } catch (error) {
      this.logger.error(
        `[Initial Assignment] Failed for enrollment ${payload.enrollmentId}`,
        error,
      );
      throw DatabaseError.from(
        error,
        `Unable to allocate initial fees for enrollment ${payload.enrollmentId}`,
      );
    }
  }

  /**
   * ACTION CENTRALISÉE : Encaisser un versement au guichet (Multi-devises & Portefeuille)
   */
  async processStudentPayment(payload: {
    schoolId: string;
    yearId: string;
    assignmentId: string;
    amountReceived: number;
    currencyReceived: CURRENCY_ENUM;
    paymentMethod: PAYMENT_METHOD_ENUM;
    transactionReference?: string;
  }) {
    this.validateContext(payload.schoolId, payload.yearId);
    this.logger.info(
      `[Payment processing] Initiating payment for assignment ${payload.assignmentId}`,
    );

    try {
      const assignmentRecord = await this.feeAssignmentRepo.findById(
        payload.assignmentId,
        this.clientDb,
      );
      if (!assignmentRecord) {
        throw new RecordNotFoundError(
          `Fee assignment [${payload.assignmentId}]`,
        );
      }

      const configRecord = await this.feeConfigRepo.findById(
        assignmentRecord.feeConfigId as string,
        this.clientDb,
      );
      if (!configRecord) {
        throw new RecordNotFoundError(
          `Fee configuration [${assignmentRecord.feeConfigId}]`,
        );
      }

      let amountConverted = payload.amountReceived;
      let exchangeRateMultiplied = EXCHANGE_RATE_SCALE;

      if (configRecord.currency !== payload.currencyReceived) {
        const todayStr = this.getLocalDateString();
        const rateRow = await this.rateRepo.getLatestExchangeRate(
          {
            where: {
              schoolId: payload.schoolId,
              date: todayStr,
              currencyFrom: payload.currencyReceived,
              currencyTo: configRecord.currency,
            },
          },
          this.clientDb,
        );

        if (!rateRow) {
          throw new ExchangeRateNotFoundError(
            payload.currencyReceived,
            configRecord.currency,
            todayStr,
          );
        }

        exchangeRateMultiplied = rateRow.rate;
        amountConverted = Math.round(
          (payload.amountReceived * EXCHANGE_RATE_SCALE) /
            exchangeRateMultiplied,
        );
      }

      const remainingDebt =
        configRecord.totalAmount - assignmentRecord.amountPaid;
      if (amountConverted > remainingDebt) {
        throw new OverpaymentError(remainingDebt, configRecord.currency);
      }

      return await this.clientDb.transaction(async (tx) => {
        const paymentClient = this.studentPaymentRepo.getClient(tx);
        const [newPayment] = await paymentClient
          .insert(studentPayments)
          .values({
            assignmentId: payload.assignmentId,
            amountReceived: payload.amountReceived,
            currencyReceived: payload.currencyReceived,
            appliedExchangeRate: exchangeRateMultiplied,
            amountConverted: amountConverted,
            paymentMethod: payload.paymentMethod,
            transactionReference: payload.transactionReference,
          })
          .returning();

        await this.feeAssignmentRepo.updateAssignmentProgress(
          payload.assignmentId,
          amountConverted,
          configRecord.totalAmount,
          tx,
        );

        const walletClient = this.walletRepo.getClient(tx);
        await walletClient
          .update(wallets)
          .set({
            currentBalance: sql`${wallets.currentBalance} + ${amountConverted}`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(wallets.walletId, configRecord.walletId as string));

        this.logger.info(
          `[Payment processing] Success for assignment ${payload.assignmentId}. ID: ${newPayment.paymentId}`,
        );
        return newPayment;
      });
    } catch (error) {
      if (
        error instanceof BusinessRuleError ||
        error instanceof RecordNotFoundError
      ) {
        throw error;
      }
      this.logger.error(
        `[Payment processing] Transaction failed for assignment ${payload.assignmentId}`,
        error,
      );
      throw new TransactionError(
        "Payment processing failed and was rolled back.",
        { cause: error },
      );
    }
  }
}

export const paymentService = new PaymentService(
  feeConfigurationRepository,
  feeAssignmentRepository,
  studentPaymentRepository,
  dailyExchangeRateRepository,
  walletRepository,
  enrollmentRepository,
  classroomRepository,
  db,
);
