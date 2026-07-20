import { type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  FeeType,
  FeeSchedule,
  FeeAssignment,
  InsertFeeAssignment,
} from "@/packages/@core/data-access/db/schemas";
import {
  FEE_SCHEDULES_ENUM,
  SECTION_ENUM,
} from "@/packages/@core/data-access/db/options";
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
import { validateContext, extractRequiredAssignments } from "../utils";
import { BusinessRuleError } from "../errors";

export type EnrollmentPayment = FeeType & { label: string; value: string } & {
  schedules: (FeeAssignment & FeeSchedule & { label: string; value: string })[];
};

export type StudentPaymentTable = {
  enrollment: EnrollmentDTO;
  payments: EnrollmentPayment[];
};

export class AssignInitialFees {
  /**
   * Initializes a new instance of AssignInitialFees.
   * @param classroomRepo - Repository for classroom data access.
   * @param feeConfigRepo - Repository for fee configuration queries.
   * @param feeAssignmentRepo - Repository for managing fee assignments.
   * @param clientDb - Default database connection client.
   * @param logger - Custom logger instance.
   */
  constructor(
    private readonly classroomRepo: ClassroomRepository,
    private readonly feeConfigRepo: FeeConfigurationRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly clientDb: TDataBase,
    private readonly logger: CustomLogger,
  ) {}

  /**
   * Calculates applicable fee configurations and assigns required fee schedules to an enrollment.
   * @param ctx - Context parameters including school, classroom, section, and enrollment IDs.
   * @param tx - Optional database transaction instance.
   * @returns List of applicable fee configurations or void if no assignments were required.
   */
  assignFees(
    ctx: {
      schoolId: string;
      yearId: string;
      classroomId: string;
      optionId: string | null;
      section: SECTION_ENUM | null;
      enrollmentId: string;
    },
    tx: TDataBase = this.clientDb,
  ): FeeApplicableConfiguration[] | undefined {
    const configs = this.feeConfigRepo.findApplicableConfigurations(ctx, tx);

    const requiredAssignments = extractRequiredAssignments(configs);
    if (requiredAssignments.length === 0) {
      this.logger.info(
        `[Initial Assignment] No fee configs applied for ${ctx.enrollmentId}`,
      );
      return;
    }

    const assignmentsToCreate: InsertFeeAssignment[] = requiredAssignments.map(
      (req) => ({
        enrollmentId: ctx.enrollmentId,
        feeConfigId: req.feeConfigId,
        scheduleId: req.scheduleId,
        amountPaid: 0,
        status: FEE_SCHEDULES_ENUM.UNPAID,
      }),
    );

    this.feeAssignmentRepo.assignFees(assignmentsToCreate, tx);

    this.logger.info(
      `[Initial Assignment] Assigned ${assignmentsToCreate.length} schedules to ${ctx.enrollmentId}`,
    );

    return configs;
  }

  /**
   * Validates payload context and executes the initial fee assignment workflow for an enrollment.
   * @param payload - Payload containing school, year, classroom, and enrollment identifiers.
   * @param tx - Optional database transaction instance.
   */
  execute(
    payload: {
      schoolId: string;
      yearId: string;
      enrollmentId: string;
      classroomId: string;
    },
    tx: TDataBase = this.clientDb,
  ): void {
    validateContext(payload.schoolId, payload.yearId);
    this.logger.info(
      `[Initial Assignment] Processing fees for enrollment ${payload.enrollmentId}`,
    );

    try {
      const classroom = this.classroomRepo.findById(payload.classroomId, tx);
      if (!classroom) {
        throw new BusinessRuleError(
          `Classroom ${payload.classroomId} not found.`,
        );
      }

      this.assignFees(
        {
          ...payload,
          section: classroom.section,
          optionId: classroom.optionId,
        },
        tx,
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
}

export class StudentPaymentInfos {
  /**
   * Initializes a new instance of StudentPaymentInfos.
   * @param enrollmentRepo - Repository for student enrollment data.
   * @param feeAssignmentRepo - Repository for fee assignment records.
   * @param assignFeesUseCase - Use case instance to ensure initial fee assignments exist.
   * @param logger - Custom logger instance.
   */
  constructor(
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly assignFeesUseCase: AssignInitialFees,
    private readonly logger: CustomLogger,
  ) {}

  /**
   * Converts an array of fee assignments into an optimized Map indexed by schedule ID.
   * @param assignments - List of fee assignment records.
   * @returns A Map mapping schedule IDs to fee assignments.
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
   * Maps fee configurations and assigned schedules into structured enrollment payment records.
   * @param assignments - Array of fee assignments.
   * @param configs - Optional applicable fee configurations.
   * @returns Array of mapped enrollment payment objects.
   */
  public getPaymentMapped(
    assignments: FeeAssignment[],
    configs?: FeeApplicableConfiguration[],
  ): EnrollmentPayment[] {
    if (!configs || configs.length === 0) {
      this.logger.info(
        "[StudentPaymentInfos] No fee configurations provided for mapping.",
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
      `[StudentPaymentInfos] Mapped ${mappedPayments.length} fee types.`,
    );
    return mappedPayments as EnrollmentPayment[];
  }

  /**
   * Fetches comprehensive payment information for a student by enrollment ID.
   * @param enrollmentId - Unique identifier of the student enrollment.
   * @returns The aggregated student payment table data.
   */
  public getStudentPaymentOverview(enrollmentId: string): StudentPaymentTable {
    this.logger.info(
      `[StudentPaymentInfos] Fetching payment overview for enrollment ID: ${enrollmentId}`,
    );

    try {
      const enrollment = this.enrollmentRepo.findById(enrollmentId);
      if (!enrollment) {
        throw new BusinessRuleError(`Enrollment ${enrollmentId} not found.`);
      }

      const configs = this.assignFeesUseCase.assignFees({
        classroomId: enrollment.classroomId,
        optionId: enrollment.classroom.optionId,
        section: enrollment.classroom.section,
        schoolId: enrollment.schoolId,
        yearId: enrollment.yearId,
        enrollmentId,
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
        `[StudentPaymentInfos] Successfully generated payment overview for enrollment ID: ${enrollmentId}`,
      );

      return {
        enrollment,
        payments,
      };
    } catch (error) {
      this.logger.error(
        `[StudentPaymentInfos] Failed to retrieve payment overview for enrollment ID: ${enrollmentId}`,
        error,
      );
      throw error;
    }
  }
}
