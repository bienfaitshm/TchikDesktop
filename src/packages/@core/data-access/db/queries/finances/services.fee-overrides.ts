import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { SelectOptionFacade } from "@/packages/drizzle-queries";
import {
  type BaseFeeOverrideFilters,
  FeeOverrideRepository,
  feeOverrideRepository,
  type FeeOverrideDTO,
} from "./repository";
import {
  FeeAssignmentRepository,
  feeAssignmentRepository,
} from "./repository.fee-assignments";
import {
  EnrollmentRepository,
  enrollmentRepository,
} from "../enrollments/enrollment.repository";

export interface UpdateFeeInput {
  targetType: "CLASS" | "STUDENT";
  targetId: string; // classroomId or enrollmentId
  feeTypeId: string;
  reason: string;
  newTotalAmount: number;
}

/**
 * Service handling business logic, fee redistribution, and UI option formatting for fee overrides.
 */
export class FeeOverrideService {
  public readonly selectOptions: SelectOptionFacade<FeeOverrideDTO>;

  /**
   * Initializes the FeeOverrideService with its dependencies.
   * @param feeOverrideRepo - Repository instance for fee overrides data access.
   * @param feeAssignmentRepo - Repository instance for fee assignments data access.
   * @param enrollmentRepo - Repository instance for classroom enrollments access.
   */
  constructor(
    private readonly feeOverrideRepo: FeeOverrideRepository = feeOverrideRepository,
    private readonly feeAssignmentRepo: FeeAssignmentRepository = feeAssignmentRepository,
    private readonly enrollmentRepo: EnrollmentRepository = enrollmentRepository,
  ) {
    this.selectOptions = new SelectOptionFacade<FeeOverrideDTO>(
      this.feeOverrideRepo,
      {
        valueKey: "feeOverrideId",
        labelKeyLong: "reason",
        labelKeyShort: "reason",
        labelFormat: "long",
      },
    );
  }

  /**
   * Loads formatted select options for fee overrides based on provided filters.
   * @param filters - Optional filters to restrict the fetched options.
   * @returns Promise resolving to formatted select options.
   */
  public async getOptions(filters?: BaseFeeOverrideFilters) {
    return this.selectOptions.loadOptions(filters);
  }

  /**
   * Applies a fee override and redistributes remaining balances over pending schedules atomically.
   * @param input - Data containing target type, identifier, fee type, and new amount.
   * @param tx - Optional database transaction instance.
   */
  public async updateAssignedFees(
    input: UpdateFeeInput,
    tx: TDataBase = db,
  ): Promise<void> {
    return tx.transaction(async (transaction) => {
      // 1. Record the fee override entry
      this.feeOverrideRepo.create(
        {
          feeTypeId: input.feeTypeId,
          classId: input.targetType === "CLASS" ? input.targetId : null,
          enrollmentId: input.targetType === "STUDENT" ? input.targetId : null,
          customAmount: input.newTotalAmount,
          reason: input.reason,
        },
        transaction,
      );

      // 2. Resolve target student enrollment IDs
      let targetEnrollmentIds: string[] = [];

      if (input.targetType === "STUDENT") {
        targetEnrollmentIds = [input.targetId];
      } else {
        const enrollments = await this.enrollmentRepo.findMany(
          {
            where: {
              classroomEnrollments: {
                classroomId: { $eq: input.targetId },
              },
            },
          },
          transaction,
        );
        targetEnrollmentIds = enrollments.map((item) => item.enrollmentId);
      }

      // 3. Process balance redistribution for each student
      for (const enrollmentId of targetEnrollmentIds) {
        const pendingSchedules =
          await this.feeAssignmentRepo.getPendingSchedulesForEnrollment(
            enrollmentId,
            input.feeTypeId,
            transaction,
          );

        if (pendingSchedules.length === 0) {
          continue;
        }

        const paidAmount =
          await this.feeAssignmentRepo.getAlreadyPaidAmountForFee(
            enrollmentId,
            input.feeTypeId,
            transaction,
          );

        const remainingBalanceToSpread = input.newTotalAmount - paidAmount;

        if (remainingBalanceToSpread < 0) {
          throw new Error(
            `The new total amount (${input.newTotalAmount}) is less than the amount already paid (${paidAmount}) for enrollment ID ${enrollmentId}.`,
          );
        }

        const newAmountPerPendingSchedule =
          remainingBalanceToSpread / pendingSchedules.length;

        const scheduleAssignmentIds = pendingSchedules.map(
          (schedule) => schedule.assignmentId,
        );

        await this.feeAssignmentRepo.updatePendingSchedules(
          scheduleAssignmentIds,
          newAmountPerPendingSchedule,
          transaction,
        );
      }
    });
  }
}

export const feeOverrideService = new FeeOverrideService();
