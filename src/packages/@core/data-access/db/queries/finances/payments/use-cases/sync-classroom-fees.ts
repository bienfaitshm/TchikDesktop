import { type TDataBase } from "@/packages/@core/data-access/db/config";
import { FEE_SCHEDULES_ENUM } from "@/packages/@core/data-access/db/options";
import { InsertFeeAssignment } from "@/packages/@core/data-access/db/schemas";
import { DatabaseError } from "@/packages/drizzle-queries";
import { CustomLogger } from "@/packages/logger";
import {
  FeeConfigurationRepository,
  FeeAssignmentRepository,
} from "@/packages/@core/data-access/db/queries/finances";
import { ClassroomRepository } from "@/packages/@core/data-access/db/queries/classrooms";
import { EnrollmentRepository } from "@/packages/@core/data-access/db/queries/enrollments";
import { buildAssignmentKey, extractRequiredAssignments } from "../utils";
import { OnSyncMessage } from "../types";

export class SyncClassroomFees {
  constructor(
    private readonly classroomRepo: ClassroomRepository,
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly feeConfigRepo: FeeConfigurationRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly clientDb: TDataBase,
    private readonly logger: CustomLogger,
  ) {}

  async execute(
    ctx: { schoolId: string; yearId: string; classId: string },
    onSyncMessage?: OnSyncMessage,
  ) {
    this.logger.info(
      `[Sync Background] Starting fee assignment sync for classroom: ${ctx.classId}`,
    );

    try {
      // 1. Vérification de la classe
      onSyncMessage?.({
        message: "Vérification de la classe en base de données...",
        pourcent: 10,
      });
      const classroom = await this.classroomRepo.findById(
        ctx.classId,
        this.clientDb,
      );

      if (!classroom) {
        this.logger.warn(
          `[Sync Background] Classroom ${ctx.classId} not found.`,
        );
        onSyncMessage?.({
          message: "Classe introuvable. Annulation.",
          pourcent: 100,
        });
        return { configs: [], enrollments: [] };
      }

      // 2. Chargement des données
      onSyncMessage?.({
        message: "Chargement des élèves et des grilles tarifaires...",
        pourcent: 30,
      });
      const { enrollments, configs } = await this.fetchContextData(
        ctx,
        classroom,
      );

      if (!enrollments.length || !configs.length) {
        onSyncMessage?.({
          message: "Aucun élève actif ou configuration trouvé.",
          pourcent: 100,
        });
        return { configs, enrollments };
      }

      // 3. Extraction et Comparaison
      const requiredAssignments = extractRequiredAssignments(configs);
      if (!requiredAssignments.length) return { configs, enrollments };

      onSyncMessage?.({
        message: "Comparaison des comptes élèves...",
        pourcent: 50,
      });
      const existingKeys = await this.getExistingAssignmentKeys(enrollments);

      // 4. Génération
      onSyncMessage?.({
        message: "Calcul des nouvelles échéances à générer...",
        pourcent: 70,
      });
      const assignmentsToCreate = this.buildMissingAssignments(
        enrollments,
        requiredAssignments,
        existingKeys,
      );

      // 5. Sauvegarde
      if (assignmentsToCreate.length > 0) {
        onSyncMessage?.({
          message: `Enregistrement de ${assignmentsToCreate.length} nouvelles affectations...`,
          pourcent: 90,
        });
        await this.feeAssignmentRepo.bulkCreate(assignmentsToCreate);
      }

      onSyncMessage?.({
        message: "Mise à jour des comptes terminée avec succès !",
        pourcent: 100,
      });
      return { configs, enrollments };
    } catch (error) {
      this.logger.error(
        `[Sync Background] Sync failed for classroom ${ctx.classId}:`,
        error,
      );
      onSyncMessage?.({
        message: "Erreur lors de la synchronisation.",
        pourcent: 100,
      });
      throw DatabaseError.from(
        error,
        "Failed to synchronize student fee assignments.",
      );
    }
  }

  private async fetchContextData(ctx: any, classroom: any) {
    const [enrollments, configs] = await Promise.all([
      this.enrollmentRepo.getActiveEnrollments(
        { where: { ...ctx, classroomId: ctx.classId } },
        this.clientDb,
      ),
      this.feeConfigRepo.findApplicableConfigurations(
        {
          classroomId: classroom.classId,
          optionId: classroom.optionId,
          section: classroom.section,
          schoolId: ctx.schoolId,
          yearId: ctx.yearId,
        },
        this.clientDb,
      ),
    ]);
    return { enrollments, configs };
  }

  private async getExistingAssignmentKeys(
    enrollments: any[],
  ): Promise<Set<string>> {
    const enrollmentIds = enrollments.map((e) => e.enrollmentId);
    const existing = await this.feeAssignmentRepo.findMany({
      whereIn: { enrollmentId: enrollmentIds },
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

  private buildMissingAssignments(
    enrollments: any[],
    required: any[],
    existingKeys: Set<string>,
  ) {
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
            amountPaid: 0,
            status: FEE_SCHEDULES_ENUM.UNPAID,
            enrollmentId: enrollment.enrollmentId,
            feeConfigId: req.feeConfigId,
            scheduleId: req.scheduleId,
          });
          existingKeys.add(key);
        }
      }
    }
    return toCreate;
  }
}
