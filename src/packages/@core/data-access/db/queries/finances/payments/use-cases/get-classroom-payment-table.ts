import { CustomLogger } from "@/packages/logger";
import { FeeAssignmentRepository } from "../../repository";
import { FeeManagementService } from "./sync-classroom-fees";
import { buildAssignmentKey } from "../utils";
import { TableClassroomPaymentAssignment, OnSyncMessage } from "../types";
import {
  ClassroomEnrollment,
  FeeAssignment,
  User,
} from "@/packages/@core/data-access/db/schemas";
import { FeeApplicableConfiguration } from "@/packages/@core/data-access/db/queries/finances";

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

    // Ensure all fee assignments are up-to-date
    const { configs, enrollments } =
      await this.syncFees.syncClassroomFeeAssignments(filters, onSyncMessage);

    if (!enrollments.length || !configs.length) {
      return [];
    }

    // Retrieve database assignments for classroom students
    const enrollmentIds = enrollments.map((e) => e.enrollmentId);
    const assignments =
      this.feeAssignmentRepo.getEnrollmentAssignments(enrollmentIds);

    // Fast O(1) indexing map
    const assignmentMap = this.groupAssignmentsByKey(assignments);

    // Format output payload for the UI component
    return this.formatTableData(configs, enrollments as any, assignmentMap);
  }

  /**
   * Groups assignment entities into a key-value record mapped by assignment key.
   * @param assignments - Array of fee assignment records.
   * @returns Map of assignment keys targeting corresponding fee assignments.
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
   * @param enrollments - Student enrollment records.
   * @param assignmentMap - Pre-indexed assignment lookup map.
   * @returns Structured classroom payment assignment table dataset.
   */
  private formatTableData(
    configs: FeeApplicableConfiguration[],
    enrollments: (ClassroomEnrollment & { student: User })[],
    assignmentMap: Record<string, FeeAssignment>,
  ): TableClassroomPaymentAssignment[] {
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
            enrollmentId: enrollment.enrollmentId,
            student: enrollment.student,
            payments: head.reduce(
              (acc, current) => {
                const key = buildAssignmentKey(
                  enrollment.enrollmentId,
                  config.feeConfigId,
                  current.id,
                );
                acc[current.id] = assignmentMap[key] ?? null;
                return acc;
              },
              {} as Record<string, FeeAssignment | null>,
            ),
          })),
        },
      };
    });
  }
}
