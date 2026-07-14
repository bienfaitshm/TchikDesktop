import { CustomLogger } from "@/packages/logger";
import { FeeAssignmentRepository } from "../../repository";
import { SyncClassroomFees } from "./sync-classroom-fees";
import { buildAssignmentKey } from "../utils";
import { TableClassroomPaymentAssignment, OnSyncMessage } from "../types";
import { FeeAssignment } from "@/packages/@core/data-access/db/schemas";

export class GetClassroomPaymentTable {
  constructor(
    private readonly syncFeesUseCase: SyncClassroomFees,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly logger: CustomLogger,
  ) {}

  async execute(
    filters: { schoolId: string; yearId: string; classId: string },
    onSyncMessage?: OnSyncMessage,
  ): Promise<TableClassroomPaymentAssignment[]> {
    this.logger.info(
      `[Payment Table] Fetching assignment table for classroom ${filters.classId}`,
    );

    // 1. On s'assure que tout est à jour
    const { configs, enrollments } = await this.syncFeesUseCase.execute(
      filters,
      onSyncMessage,
    );
    if (!enrollments.length || !configs.length) return [];

    // 2. Récupération des affectations
    const enrollmentIds = enrollments.map((e) => e.enrollmentId);
    const assignments = await this.feeAssignmentRepo.findMany({
      whereIn: { enrollmentId: enrollmentIds },
    });

    // 3. Indexation rapide O(1)
    const assignmentMap = this.groupAssignmentsByKey(assignments);

    // 4. Formatage pour la vue
    return this.formatTableData(configs, enrollments, assignmentMap);
  }

  // --- Méthodes privées ---

  private groupAssignmentsByKey(
    assignments: any[],
  ): Record<string, FeeAssignment> {
    return assignments.reduce(
      (acc, current) => {
        const key = buildAssignmentKey(
          current.enrollmentId,
          current.feeConfigId,
          current.scheduleId,
        );
        acc[key] = current as FeeAssignment;
        return acc;
      },
      {} as Record<string, FeeAssignment>,
    );
  }

  private formatTableData(
    configs: any[],
    enrollments: any[],
    assignmentMap: Record<string, FeeAssignment>,
  ) {
    return configs.map((config) => {
      const head =
        config.feeType?.schedules.map((sch: any) => ({
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
            payments: head.reduce((acc: any, current: any) => {
              const key = buildAssignmentKey(
                enrollment.enrollmentId,
                config.feeConfigId,
                current.id,
              );
              acc[current.id] = assignmentMap[key] ?? null;
              return acc;
            }, {}),
          })),
        },
      };
    });
  }
}
