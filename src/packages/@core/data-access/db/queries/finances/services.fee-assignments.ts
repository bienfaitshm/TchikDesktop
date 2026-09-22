import { db, FEE_SCHEDULES_ENUM, FeeAssignment, TDataBase } from "../..";
import {
  type BaseFeeAssignmentFilters,
  FeeAssignmentRepository,
  feeAssignmentRepository,
  type FeeAssignmentDTO,
  AdjustAmountPayload,
  MarkAsPaidPayload,
} from "./repository";
import { SelectOptionFacade } from "@/packages/drizzle-queries";

/**
 * Domain service providing business operations for student fee assignments.
 */
export class FeeAssignmentService {
  public readonly selectOptions: SelectOptionFacade<FeeAssignmentDTO>;

  /**
   * Creates an instance of FeeAssignmentService.
   * @param feeAssignmentRepo - Repository instance for database persistence.
   */
  constructor(
    private readonly feeAssignmentRepo: FeeAssignmentRepository = feeAssignmentRepository,
    private readonly _db: TDataBase = db,
  ) {
    this.selectOptions = new SelectOptionFacade<FeeAssignmentDTO>(
      this.feeAssignmentRepo,
      {
        valueKey: "assignmentId",
        labelKeyLong: "feeSchedule.installmentName",
        labelKeyShort: "feeSchedule.installmentName",
        labelFormat: "long",
      },
    );
  }

  /**
   * Loads options for select dropdown components.
   * @param filters - Filtering options.
   * @returns Promise resolving to formatted select options.
   */
  public async getOptions(filters?: BaseFeeAssignmentFilters) {
    return this.selectOptions.loadOptions(filters);
  }

  /**
   * Adjusts the total required fee amount by assignment scope or classroom scope.
   * @param payload - Target parameters containing amounts, currencies, and scope IDs.
   * @param tx - Optional transaction instance.
   * @returns Result of the update execution.
   */
  public adjustAmount(
    payload: AdjustAmountPayload,
    tx?: TDataBase,
  ): FeeAssignment[] {
    const {
      newTotalAmount,
      currency,
      scheduleIds,
      assignmentIds,
      classroomIds,
    } = payload;

    if (newTotalAmount < 0) {
      throw new Error("Adjusted fee amount cannot be negative.");
    }

    if (assignmentIds && assignmentIds.length > 0) {
      return this.feeAssignmentRepo.updateAmountByAssignments(
        newTotalAmount,
        currency,
        assignmentIds,
        scheduleIds,
        tx,
      );
    }

    if (classroomIds && classroomIds.length > 0) {
      return this.feeAssignmentRepo.updateAmountByClassrooms(
        newTotalAmount,
        currency,
        classroomIds,
        scheduleIds,
        tx,
      );
    }

    throw new Error(
      "Either assignmentIds or classroomIds must be provided to adjust amounts.",
    );
  }

  /**
   * Records a payment against an assignment and updates its progress and status.
   * @param payload - Payment information including assignment ID.
   * @param tx - Optional transaction instance.
   * @returns Updated fee assignment DTO.
   */
  public markAsPaid(payload: MarkAsPaidPayload, tx?: TDataBase): FeeAssignment {
    const { assignmentId } = payload;
    const dbContext = tx ?? this._db;

    return dbContext.transaction((transactionContext) => {
      const assignment = this.feeAssignmentRepo.findById(
        assignmentId,
        transactionContext,
      );

      if (!assignment) {
        throw new Error(
          `Fee assignment with ID "${assignmentId}" was not found.`,
        );
      }

      const updatedAssignment = this.feeAssignmentRepo.updateById(
        assignmentId,
        {
          status: FEE_SCHEDULES_ENUM.PAID,
          totalAmount: assignment.amountPaid,
        },
        transactionContext,
      );

      if (!updatedAssignment) {
        throw new Error(
          `Failed to update fee assignment with ID "${assignmentId}".`,
        );
      }

      return updatedAssignment;
    });
  }

  /**
   * Exempts selected students from payment obligations for specified assignments.
   * @param studentEnrollmentIds - Array of student enrollment identifiers.
   * @param assignmentIds - Array of fee assignment identifiers.
   * @param tx - Optional transaction instance.
   * @returns Result of exemption update.
   */
  public exemptFromPayment(
    studentEnrollmentIds: string[],
    assignmentIds: string[],
    tx?: TDataBase,
  ): FeeAssignment[] {
    if (!studentEnrollmentIds.length || !assignmentIds.length) {
      throw new Error(
        "Student enrollment IDs and assignment IDs must not be empty.",
      );
    }

    return this.feeAssignmentRepo.exemptStudentsFromFee(
      studentEnrollmentIds,
      assignmentIds,
      tx,
    );
  }
}

export const feeAssignmentService = new FeeAssignmentService(
  feeAssignmentRepository,
);
