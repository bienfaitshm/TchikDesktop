import { type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  FEE_SCHEDULES_ENUM,
  SECTION_ENUM,
} from "@/packages/@core/data-access/db/options";
import type {
  InsertFeeAssignment,
  Classroom,
  FeeType,
  FeeAssignment,
  FeeSchedule,
} from "@/packages/@core/data-access/db/schemas";
import { DatabaseError } from "@/packages/drizzle-queries";
import { CustomLogger } from "@/packages/logger";
import {
  FeeConfigurationRepository,
  FeeAssignmentRepository,
  FeeApplicableConfiguration,
} from "@/packages/@core/data-access/db/queries/finances";
import { ClassroomRepository } from "@/packages/@core/data-access/db/queries/classrooms";
import {
  EnrollmentRepository,
  EnrollmentDTO,
} from "@/packages/@core/data-access/db/queries/enrollments";
import { buildAssignmentKey, extractRequiredAssignments } from "../utils";
import { OnSyncMessage } from "../types";
import { BusinessRuleError } from "../errors";

/**
 * Extended fee type including schedule relationships for enrollment contexts.
 */
export type EnrollmentPayment = FeeType & { label: string; value: string } & {
  schedules: (FeeAssignment & FeeSchedule & { label: string; value: string })[];
};

/**
 * Aggregated view of a student's enrollment and associated payment records.
 */
export type StudentPaymentTable = {
  enrollment: EnrollmentDTO;
  payments: EnrollmentPayment[];
};

/**
 * Service managing fee assignments, synchronizations, and payment overviews.
 */
export class FeeManagementService {
  /**
   * Initializes the FeeManagementService with required repositories and utilities.
   */
  constructor(
    private readonly classroomRepo: ClassroomRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly feeConfigRepo: FeeConfigurationRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly clientDb: TDataBase,
    private readonly logger: CustomLogger,
  ) {}

  /**
   * Synchronizes fee assignments for all active students in a given classroom.
   * @param ctx - Context containing school, year, and classroom IDs.
   * @param onSyncMessage - Optional callback for reporting sync progress.
   * @returns Object containing the processed configurations and enrollments.
   */
  async syncClassroomFeeAssignments(
    ctx: { schoolId: string; yearId: string; classId: string },
    onSyncMessage?: OnSyncMessage,
  ) {
    this.logger.info(
      `[FeeManagementService] Starting fee assignment sync for classroom: ${ctx.classId}`,
    );

    try {
      onSyncMessage?.({
        message: "Verifying classroom in database...",
        pourcent: 10,
      });

      const classroom = await this.classroomRepo.findById(
        ctx.classId,
        this.clientDb,
      );

      if (!classroom) {
        this.logger.warn(
          `[FeeManagementService] Classroom ${ctx.classId} not found.`,
        );
        onSyncMessage?.({
          message: "Classroom not found. Aborting.",
          pourcent: 100,
        });
        return { configs: [], enrollments: [] };
      }

      onSyncMessage?.({
        message: "Loading students and fee schedules...",
        pourcent: 30,
      });

      const { enrollments, configs } = this.fetchContextData(
        ctx.schoolId,
        ctx.yearId,
        classroom,
      );

      if (!enrollments.length || !configs.length) {
        onSyncMessage?.({
          message: "No active student or configuration found.",
          pourcent: 100,
        });
        return { configs, enrollments };
      }

      await this.processAssignments(enrollments, configs, onSyncMessage);

      onSyncMessage?.({
        message: "Account update completed successfully!",
        pourcent: 100,
      });

      return { configs, enrollments };
    } catch (error) {
      this.logger.error(
        `[FeeManagementService] Sync failed for classroom ${ctx.classId}:`,
        error,
      );
      onSyncMessage?.({
        message: "Synchronization error.",
        pourcent: 100,
      });
      throw DatabaseError.from(
        error,
        "Failed to synchronize student fee assignments.",
      );
    }
  }

  /**
   * Evaluates and assigns missing fees to a provided list of student enrollments.
   * @param enrollments - Array of student enrollments to process.
   * @param ctx - Context object containing identifiers to match configurations.
   * @returns Array of applicable fee configurations.
   */
  assignFees(
    enrollments: { enrollmentId: string }[],
    ctx: {
      schoolId: string;
      yearId: string;
      classroomId: string;
      optionId: string | null;
      section: SECTION_ENUM | null;
    },
  ) {
    const configs = this.feeConfigRepo.findApplicableConfigurations(
      ctx,
      this.clientDb,
    );

    if (!enrollments.length || !configs.length) {
      return configs;
    }

    this.processAssignments(enrollments, configs);
    return configs;
  }

  /**
   * Internal processor handling the extraction, comparison, and creation of assignments.
   * @param enrollments - List of enrollments to evaluate.
   * @param configs - List of applicable fee configurations.
   * @param onSyncMessage - Optional progress tracking callback.
   */
  private async processAssignments(
    enrollments: { enrollmentId: string }[],
    configs: FeeApplicableConfiguration[],
    onSyncMessage?: OnSyncMessage,
  ): Promise<void> {
    const requiredAssignments = extractRequiredAssignments(configs);
    if (!requiredAssignments.length) return;

    onSyncMessage?.({
      message: "Comparing student accounts...",
      pourcent: 50,
    });

    const existingKeys = this.getExistingAssignmentKeys(enrollments);

    onSyncMessage?.({
      message: "Calculating missing installments...",
      pourcent: 70,
    });

    const assignmentsToCreate = this.buildMissingAssignments(
      enrollments,
      requiredAssignments,
      existingKeys,
    );

    if (assignmentsToCreate.length > 0) {
      onSyncMessage?.({
        message: `Saving ${assignmentsToCreate.length} new assignments...`,
        pourcent: 90,
      });
      await this.feeAssignmentRepo.bulkCreate(assignmentsToCreate);
    }
  }

  /**
   * Fetches the classroom enrollments and applicable fee configurations.
   * @param schoolId - The school identifier.
   * @param yearId - The academic year identifier.
   * @param classroom - The classroom entity.
   * @returns Object containing active enrollments and related configurations.
   */
  private fetchContextData(
    schoolId: string,
    yearId: string,
    classroom: Classroom,
  ) {
    const enrollments = this.enrollmentRepo.getActiveEnrollments(
      {
        where: {
          classroomEnrollments: {
            classroomId: { $eq: classroom.classId },
            yearId: { $eq: yearId },
            schoolId: { $eq: schoolId },
          },
        },
        orderBy: [
          { table: "users", column: "lastName", order: "asc" },
          { table: "users", column: "middleName", order: "asc" },
          { table: "users", column: "firstName", order: "asc" },
        ],
      },
      this.clientDb,
    );

    const configs = this.feeConfigRepo.findApplicableConfigurations(
      {
        classroomId: classroom.classId,
        optionId: classroom.optionId,
        section: classroom.section,
        schoolId: schoolId,
        yearId: yearId,
      },
      this.clientDb,
    );

    return { enrollments, configs };
  }

  /**
   * Retrieves a Set of existing assignment keys to prevent duplicate creation.
   * @param enrollments - Array of enrollments to query existing assignments for.
   * @returns A Set containing unique composite keys of existing assignments.
   */
  private getExistingAssignmentKeys(
    enrollments: { enrollmentId: string }[],
  ): Set<string> {
    const enrollmentIds = enrollments.map((e) => e.enrollmentId);
    const existing = this.feeAssignmentRepo.findMany({
      where: { feeAssignments: { enrollmentId: { $in: enrollmentIds } } },
    });

    return new Set(
      existing.map((e) =>
        buildAssignmentKey(
          e.enrollmentId as string,
          e.feeConfigId as string,
          e.scheduleId as string,
        ),
      ),
    );
  }

  /**
   * Constructs the payload for new fee assignments that do not yet exist in the database.
   * @param enrollments - List of enrollments to bill.
   * @param required - List of required configurations and schedules.
   * @param existingKeys - Set of currently existing assignment keys.
   * @returns Array of new assignments ready for database insertion.
   */
  private buildMissingAssignments(
    enrollments: { enrollmentId: string }[],
    required: ReturnType<typeof extractRequiredAssignments>,
    existingKeys: Set<string>,
  ): InsertFeeAssignment[] {
    const toCreate: InsertFeeAssignment[] = [];

    for (const enrollment of enrollments) {
      for (const req of required) {
        const key = buildAssignmentKey(
          enrollment.enrollmentId,
          req.feeConfigId,
          req.scheduleId,
        );

        if (!existingKeys.has(key)) {
          toCreate.push({
            totalAmount: req.totalAmount,
            amountPaid: 0,
            status: FEE_SCHEDULES_ENUM.UNPAID,
            enrollmentId: enrollment.enrollmentId,
            feeConfigId: req.feeConfigId,
            scheduleId: req.scheduleId,
            currency: req.currency,
          });
          existingKeys.add(key);
        }
      }
    }
    return toCreate;
  }

  /**
   * Converts an array of fee assignments into a Map indexed by schedule ID.
   * @param assignments - List of fee assignment records.
   * @returns A dictionary mapping schedule IDs to their respective assignments.
   */
  private convertListToMap(
    assignments: FeeAssignment[],
  ): Map<string, FeeAssignment> {
    const assignmentMap = new Map<string, FeeAssignment>();
    for (const assignment of assignments) {
      assignmentMap.set(assignment.scheduleId, assignment);
    }
    return assignmentMap;
  }

  /**
   * Merges fee configurations and database assignments into a client-friendly nested structure.
   * @param assignments - Array of existing fee assignments.
   * @param configs - Applicable fee configurations for the enrollment.
   * @returns Structured array of fee types containing their schedules and current status.
   */
  public getPaymentMapped(
    assignments: FeeAssignment[],
    configs?: FeeApplicableConfiguration[],
  ): EnrollmentPayment[] {
    if (!configs || configs.length === 0) {
      this.logger.info(
        "[FeeManagementService] No fee configurations provided for mapping.",
      );
      return [];
    }

    const assignmentMap = this.convertListToMap(assignments);

    const mappedPayments = configs
      .filter(
        (config): config is FeeApplicableConfiguration & { feeType: FeeType } =>
          config.feeType !== null,
      )
      .map(({ feeType }) => ({
        value: feeType.feeTypeId,
        label: feeType.name,
        ...feeType,
        schedules: (feeType.schedules || []).map((schedule) => ({
          value: schedule.scheduleId,
          label: schedule.installmentName,
          ...schedule,
          ...(assignmentMap.get(schedule.scheduleId) ?? {}),
        })),
      }));

    this.logger.info(
      `[FeeManagementService] Mapped ${mappedPayments.length} fee types.`,
    );
    return mappedPayments as EnrollmentPayment[];
  }

  /**
   * Retrieves and structures a comprehensive payment overview for a specific student.
   * @param enrollmentId - Unique identifier of the student's enrollment.
   * @returns Structured overview detailing the student's information and payment statuses.
   */
  public getStudentPaymentOverview(enrollmentId: string): StudentPaymentTable {
    this.logger.info(
      `[FeeManagementService] Fetching payment overview for enrollment ID: ${enrollmentId}`,
    );

    try {
      const enrollment = this.enrollmentRepo.findById(enrollmentId);
      if (!enrollment) {
        throw new BusinessRuleError(`Enrollment ${enrollmentId} not found.`);
      }

      const configs = this.assignFees([enrollment], {
        classroomId: enrollment.classroomId,
        optionId: enrollment.classroom.optionId,
        section: enrollment.classroom.section,
        schoolId: enrollment.schoolId,
        yearId: enrollment.yearId,
      });

      const assignments = this.feeAssignmentRepo.findMany({
        where: {
          feeAssignments: {
            enrollmentId: { $eq: enrollmentId },
          },
        },
      });

      const payments = this.getPaymentMapped(assignments, configs);

      this.logger.info(
        `[FeeManagementService] Successfully generated payment overview for enrollment ID: ${enrollmentId}`,
      );

      return {
        enrollment,
        payments,
      };
    } catch (error) {
      this.logger.error(
        `[FeeManagementService] Failed to retrieve payment overview for enrollment ID: ${enrollmentId}`,
        error,
      );
      throw error;
    }
  }
}
