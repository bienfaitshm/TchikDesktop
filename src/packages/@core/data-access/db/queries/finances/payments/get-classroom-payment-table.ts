import { CustomLogger } from "@/packages/logger";
import { FeeAssignmentRepository } from "../repository";
import { FeeManagementService } from "./sync-classroom-fees";
import { buildAssignmentKey } from "./utils";
import { TableClassroomPaymentAssignment, OnSyncMessage } from "./types";
import { FeeAssignment, User } from "@/packages/@core/data-access/db/schemas";
import { FeeApplicableConfiguration } from "@/packages/@core/data-access/db/queries/finances";
import { EnrollmentDTO } from "@/packages/@core/data-access/db/queries/enrollments";

export type TableHeaderItem = {
  id: string;
  name: string;
};

export type EnrollmentWithStudent = EnrollmentDTO & {
  student: User;
};

/**
 * Service generating formatted classroom payment assignment tables.
 */
export class GetClassroomPaymentTable {
  /**
   * Initializes the GetClassroomPaymentTable query service.
   * @param syncFees - Fee management service handling classroom sync.
   * @param feeAssignmentRepo - Repository for fee assignment persistence queries.
   * @param logger - Custom logger instance for tracking query lifecycle.
   */
  constructor(
    private readonly syncFees: FeeManagementService,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly logger: CustomLogger,
  ) {}

  /**
   * Synchronizes and formats payment assignment tables for a classroom.
   * @param filters - Context filter arguments (schoolId, yearId, classId).
   * @param onSyncMessage - Optional progress tracking callback.
   * @returns Array of structured classroom payment assignment objects.
   */
  async getClassroomPaymentTable(
    filters: { schoolId: string; yearId: string; classId: string },
    onSyncMessage?: OnSyncMessage,
  ): Promise<TableClassroomPaymentAssignment[]> {
    this.logger.info(
      `[Payment Table] Fetching assignment table for classroom ${filters.classId}`,
    );

    const { configs, enrollments } =
      await this.syncFees.syncClassroomFeeAssignments(filters, onSyncMessage);

    if (!enrollments.length || !configs.length) {
      return [];
    }

    const enrollmentIds = enrollments.map((e) => e.enrollmentId);
    const assignments =
      this.feeAssignmentRepo.getEnrollmentAssignments(enrollmentIds);

    const assignmentMap = this.groupAssignmentsByKey(assignments);

    return this.formatTableData(
      configs,
      enrollments as EnrollmentWithStudent[],
      assignmentMap,
    );
  }

  /**
   * Groups assignment entities into a key-value record mapped by assignment key.
   * @param assignments - Array of fee assignment records.
   * @returns Record of assignment keys targeting corresponding fee assignments.
   */
  private groupAssignmentsByKey(
    assignments: FeeAssignment[],
  ): Record<string, FeeAssignment> {
    return assignments.reduce(
      (acc, current) => {
        const key = buildAssignmentKey(
          current.enrollmentId,
          current.feeConfigId,
          current.scheduleId,
        );
        acc[key] = current;
        return acc;
      },
      {} as Record<string, FeeAssignment>,
    );
  }

  /**
   * Formats configurations, student enrollments, and assignments into table rows and columns.
   * @param configs - Applicable fee configurations.
   * @param enrollments - Student enrollment records with student relation.
   * @param assignmentMap - Pre-indexed assignment lookup map.
   * @returns Structured classroom payment assignment table dataset.
   */
  private formatTableData(
    configs: FeeApplicableConfiguration[],
    enrollments: EnrollmentWithStudent[],
    assignmentMap: Record<string, FeeAssignment>,
  ): TableClassroomPaymentAssignment[] {
    return configs.map((config) => {
      const headers = this.extractFeeHeaders(config);
      return this.buildConfigTableEntry(
        config,
        headers,
        enrollments,
        assignmentMap,
      );
    });
  }

  /**
   * Extracts schedule items as table headers from a fee configuration.
   * @param config - Applicable fee configuration.
   * @returns Array of table header items.
   */
  private extractFeeHeaders(
    config: FeeApplicableConfiguration,
  ): TableHeaderItem[] {
    return (
      config.feeType?.schedules.map((sch) => ({
        id: sch.scheduleId,
        name: sch.installmentName,
      })) ?? []
    );
  }

  /**
   * Builds a formatted table entry for a single fee configuration.
   * @param config - Applicable fee configuration.
   * @param headers - Table column headers derived from schedules.
   * @param enrollments - Student enrollment records.
   * @param assignmentMap - Pre-indexed assignment lookup map.
   * @returns Structured fee table assignment object.
   */
  private buildConfigTableEntry(
    config: FeeApplicableConfiguration,
    headers: TableHeaderItem[],
    enrollments: EnrollmentWithStudent[],
    assignmentMap: Record<string, FeeAssignment>,
  ): TableClassroomPaymentAssignment {
    return {
      feeTypeId: config.feeTypeId as string,
      name: config.feeType?.name as string,
      table: {
        head: headers,
        body: enrollments.map((enrollment) => ({
          ...enrollment,
          payments: this.mapEnrollmentPayments(
            enrollment.enrollmentId,
            config.feeConfigId,
            headers,
            assignmentMap,
          ),
        })),
      },
    };
  }

  /**
   * Maps payment assignments for a single enrollment across all table headers.
   * @param enrollmentId - Unique identifier of the enrollment.
   * @param feeConfigId - Unique identifier of the fee configuration.
   * @param headers - Table column headers.
   * @param assignmentMap - Pre-indexed assignment lookup map.
   * @returns Record mapping header IDs to fee assignments or null.
   */
  private mapEnrollmentPayments(
    enrollmentId: string,
    feeConfigId: string,
    headers: TableHeaderItem[],
    assignmentMap: Record<string, FeeAssignment>,
  ): Record<string, FeeAssignment | null> {
    return headers.reduce(
      (acc, header) => {
        const key = buildAssignmentKey(enrollmentId, feeConfigId, header.id);
        acc[header.id] = assignmentMap[key] ?? null;
        return acc;
      },
      {} as Record<string, FeeAssignment | null>,
    );
  }
}
