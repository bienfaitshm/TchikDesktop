import { type TDataBase } from "@/packages/@core/data-access/db/config";
import {
  feeAssignments,
  InsertFeeAssignment,
} from "@/packages/@core/data-access/db/schemas";
import { FEE_SCHEDULES_ENUM } from "@/packages/@core/data-access/db/options";
import { DatabaseError } from "@/packages/drizzle-queries";
import { CustomLogger } from "@/packages/logger";
import {
  FeeConfigurationRepository,
  FeeAssignmentRepository,
} from "@/packages/@core/data-access/db/queries/finances";
import { ClassroomRepository } from "@/packages/@core/data-access/db/queries/classrooms";
import { validateContext, extractRequiredAssignments } from "../utils";
import { BusinessRuleError } from "../errors";

export class AssignInitialFees {
  constructor(
    private readonly classroomRepo: ClassroomRepository,
    private readonly feeConfigRepo: FeeConfigurationRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository,
    private readonly clientDb: TDataBase,
    private readonly logger: CustomLogger,
  ) {}

  async execute(
    payload: {
      schoolId: string;
      yearId: string;
      enrollmentId: string;
      classroomId: string;
    },
    tx: TDataBase = this.clientDb,
  ) {
    validateContext(payload.schoolId, payload.yearId);
    this.logger.info(
      `[Initial Assignment] Processing fees for enrollment ${payload.enrollmentId}`,
    );

    try {
      // 1. Récupérer la classe
      const classroom = await this.classroomRepo.findById(
        payload.classroomId,
        tx,
      );
      if (!classroom)
        throw new BusinessRuleError(
          `Classroom ${payload.classroomId} not found.`,
        );

      // 2. Trouver les configurations de frais applicables
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

      // 3. Extraire ce qu'il faut générer
      const requiredAssignments = extractRequiredAssignments(configs);
      if (requiredAssignments.length === 0) {
        this.logger.info(
          `[Initial Assignment] No fee configs applied for ${payload.enrollmentId}`,
        );
        return;
      }

      // 4. Sauvegarde via Drizzle
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
        `[Initial Assignment] Assigned ${assignmentsToCreate.length} schedules to ${payload.enrollmentId}`,
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
