import { eq, and, sql, getTableColumns } from "drizzle-orm";
import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  feeAssignments,
  feeConfigurations,
  studentPayments,
  wallets,
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
  type DrizzleClient,
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

const EXCHANGE_RATE_SCALE = 1_000_000;

/* =========================================================================
   Exceptions Métier (Domain Errors) pour la Couche Application / API
   ========================================================================= */

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
  constructor(
    private readonly feeConfigRepo: FeeConfigurationRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly studentPaymentRepo: StudentPaymentRepository,
    private readonly rateRepo: DailyExchangeRateRepository,
    private readonly walletRepo: WalletRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly clientDb: TDataBase = db,
  ) {}

  /**
   * Asserte la présence du contexte scolaire obligatoire
   */
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

  /**
   * Extrait la date locale (YYYY-MM-DD) sans subir le décalage UTC de toISOString()
   */
  private getLocalDateString(): string {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  }

  /**
   * TÂCHE DE FOND : Synchronisation globale et Idempotente des dettes d'une année
   */
  async syncAllStudentAssignments(filters: {
    schoolId: string;
    yearId: string;
  }) {
    this.validateContext(filters.schoolId, filters.yearId);

    try {
      const activeEnrollments = await this.enrollmentRepo.getActiveEnrollments(
        filters,
        this.clientDb,
      );

      console.log(
        `[Sync Background] Début du traitement pour ${activeEnrollments.length} élèves.`,
      );

      const BATCH_SIZE = 50;
      for (let i = 0; i < activeEnrollments.length; i += BATCH_SIZE) {
        const chunk = activeEnrollments.slice(i, i + BATCH_SIZE);

        await this.clientDb.transaction(async (tx) => {
          const assignmentClient = this.feeAssignmentRepo.getClient(tx);

          for (const enrollment of chunk) {
            const applicableConfigs =
              await this.feeConfigRepo.findApplicableConfigurations(
                {
                  schoolId: filters.schoolId,
                  yearId: filters.yearId,
                  classroomId: enrollment.classroomId,
                  optionId: enrollment.optionId,
                },
                tx,
              );

            for (const config of applicableConfigs) {
              const [existingAssignment] = await assignmentClient
                .select()
                .from(feeAssignments)
                .where(
                  and(
                    eq(feeAssignments.enrollmentId, enrollment.enrollmentId),
                    eq(feeAssignments.feeConfigId, config.feeConfigId),
                  ),
                );

              if (!existingAssignment) {
                // --- ACTION A : CREATION ---
                await assignmentClient.insert(feeAssignments).values({
                  enrollmentId: enrollment.enrollmentId,
                  feeConfigId: config.feeConfigId,
                  amountPaid: 0,
                  status: FEE_SCHEDULES_ENUM.UNPAID,
                });
              } else {
                // --- ACTION B : RECALCUL DU STATUT ---
                let newStatus = FEE_SCHEDULES_ENUM.PARTIAL;
                if (existingAssignment.amountPaid >= config.totalAmount) {
                  newStatus = FEE_SCHEDULES_ENUM.PAID;
                } else if (existingAssignment.amountPaid <= 0) {
                  newStatus = FEE_SCHEDULES_ENUM.UNPAID;
                }

                if (existingAssignment.status !== newStatus) {
                  await assignmentClient
                    .update(feeAssignments)
                    .set({
                      status: newStatus as any,
                      updatedAt: sql`CURRENT_TIMESTAMP`,
                    })
                    .where(
                      eq(
                        feeAssignments.assignmentId,
                        existingAssignment.assignmentId,
                      ),
                    );
                }
              }
            }
          }
        });
      }
      console.log(`[Sync Background] Synchronisation terminée avec succès.`);
    } catch (error) {
      throw DatabaseError.from(
        error,
        "Échec de la tâche de synchronisation des comptes élèves.",
      );
    }
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
      optionId: string | null;
    },
    tx: TDataBase = this.clientDb,
  ) {
    this.validateContext(payload.schoolId, payload.yearId);

    try {
      const configs = await this.feeConfigRepo.findApplicableConfigurations(
        payload,
        tx,
      );

      const assignmentClient = this.feeAssignmentRepo.getClient(tx);

      for (const config of configs) {
        await assignmentClient
          .insert(feeAssignments)
          .values({
            enrollmentId: payload.enrollmentId,
            feeConfigId: config.feeConfigId,
            amountPaid: 0,
            status: FEE_SCHEDULES_ENUM.UNPAID,
          })
          .onConflictDoNothing();
      }
    } catch (error) {
      throw DatabaseError.from(
        error,
        `Impossible d'allouer les frais initiaux à l'inscription ${payload.enrollmentId}`,
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

    try {
      return await this.clientDb.transaction(async (tx) => {
        // 1. Récupérer l'état de la dette via le client du gestionnaire d'assignation
        const assignmentClient = this.feeAssignmentRepo.getClient(tx);

        const [target] = await assignmentClient
          .select({
            assignment: getTableColumns(feeAssignments),
            config: getTableColumns(feeConfigurations),
          })
          .from(feeAssignments)
          .innerJoin(
            feeConfigurations,
            eq(feeAssignments.feeConfigId, feeConfigurations.feeConfigId),
          )
          .where(eq(feeAssignments.assignmentId, payload.assignmentId));

        if (!target) {
          throw new RecordNotFoundError(
            `Dossier d'attribution de frais [${payload.assignmentId}]`,
          );
        }

        const { config, assignment } = target;
        let amountConverted = payload.amountReceived;
        let exchangeRateMultiplied = EXCHANGE_RATE_SCALE;

        // 2. Pivot de conversion si les devises diffèrent
        if (config.currency !== payload.currencyReceived) {
          const todayStr = this.getLocalDateString();

          const rateRow = await this.rateRepo.getLatestExchangeRate(
            {
              where: {
                schoolId: payload.schoolId,
                date: todayStr,
                currencyFrom: payload.currencyReceived,
                currencyTo: config.currency,
              },
            },
            tx,
          );

          if (!rateRow) {
            throw new ExchangeRateNotFoundError(
              payload.currencyReceived,
              config.currency,
              todayStr,
            );
          }

          exchangeRateMultiplied = rateRow.rate;
          amountConverted = Math.round(
            (payload.amountReceived * EXCHANGE_RATE_SCALE) /
              exchangeRateMultiplied,
          );
        }

        // 3. Validation de sécurité comptable contre les trop-perçus
        const remainingDebt = config.totalAmount - assignment.amountPaid;
        if (amountConverted > remainingDebt) {
          throw new OverpaymentError(remainingDebt, config.currency);
        }

        // 4. Écriture du Reçu Immuable (Ledger entry) via le dépôt de paiement
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

        // 5. Progression de l'amortissement de la dette
        await this.feeAssignmentRepo.updateAssignmentProgress(
          payload.assignmentId,
          amountConverted,
          config.totalAmount,
          tx,
        );

        // 6. Approvisionnement de la caisse cible dans sa monnaie native
        const walletClient = this.walletRepo.getClient(tx);
        await walletClient
          .update(wallets)
          .set({
            currentBalance: sql`${wallets.currentBalance} + ${amountConverted}`,
            updatedAt: sql`CURRENT_TIMESTAMP`,
          })
          .where(eq(wallets.walletId, config.walletId));

        return newPayment;
      });
    } catch (error) {
      if (
        error instanceof BusinessRuleError ||
        error instanceof RecordNotFoundError
      ) {
        throw error;
      }
      throw new TransactionError(
        "Le traitement du paiement a échoué et a été annulé.",
        { cause: error },
      );
    }
  }
}

// Export du singleton aligné avec l'architecture éclatée
export const paymentService = new PaymentService(
  feeConfigurationRepository,
  feeAssignmentRepository,
  studentPaymentRepository,
  dailyExchangeRateRepository,
  walletRepository,
  enrollmentRepository,
  db,
);
