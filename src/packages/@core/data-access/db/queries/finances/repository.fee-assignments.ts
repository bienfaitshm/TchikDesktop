import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeAssignments,
  type TableFeeAssignment,
  type FeeAssignment,
} from "@/packages/@core/data-access/db/schemas";
import { FEE_SCHEDULES_ENUM } from "@/packages/@core/data-access/db/options";

import {
  DatabaseError,
  helpers,
  betterSqlite,
} from "@/packages/drizzle-queries";

export const TABLES = {
  feeAssignments,
} as const;

export type BaseFeeAssignmentFilters = helpers.FindManyOptions<typeof TABLES>;
const FEE_ASSIGNMENT_DEFAULT_SORT: BaseFeeAssignmentFilters = {
  orderBy: [{ table: "feeAssignments", column: "assignmentId", order: "desc" }],
};

export class FeeAssignmentRepository extends betterSqlite.BaseRepository<
  TableFeeAssignment,
  TDataBase,
  FeeAssignment
> {
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: feeAssignments,
      idColumn: feeAssignments.assignmentId,
      baseTableName: "feeAssignments",
      logger: getLogger,
      defaultFilters: FEE_ASSIGNMENT_DEFAULT_SORT,
    });
  }

  /**
   * Determines the payment status based on the paid amount and the total expected amount.
   * @param amount - The current paid amount.
   * @param totalAmount - The total expected amount.
   * @returns The corresponding payment schedule status enum.
   */
  getPaymentStatus(amount: number, totalAmount: number): FEE_SCHEDULES_ENUM {
    if (amount >= totalAmount) {
      return amount > totalAmount
        ? FEE_SCHEDULES_ENUM.OVERPAID
        : FEE_SCHEDULES_ENUM.PAID;
    }

    if (amount <= 0) {
      return FEE_SCHEDULES_ENUM.UNPAID;
    }

    return FEE_SCHEDULES_ENUM.PARTIALLY_PAID;
  }

  /**
   * Retrieves the currently paid amount for a specific fee assignment.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param tx - Optional database transaction instance.
   * @returns The amount already paid.
   */
  getAssignmentAmount(assignmentId: string, tx: TDataBase = this.db): number {
    const current = this.findById(assignmentId, tx, {
      amountPaid: this.table.amountPaid,
    });
    if (!current) {
      throw new Error(`Fee assignment with ID ${assignmentId} not found`);
    }
    return current.amountPaid ?? 0;
  }

  /**
   * Updates the progress, paid amount, and status of a specific fee assignment.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param amountConverted - The new amount to add to the current balance.
   * @param totalAmount - The total expected amount for status evaluation.
   * @param tx - Optional database transaction instance.
   * @returns The updated fee assignment record.
   */
  updateAssignmentProgress(
    assignmentId: string,
    amountConverted: number,
    totalAmount: number,
    tx: TDataBase = this.db,
  ) {
    try {
      const previousAmount = this.getAssignmentAmount(assignmentId, tx);
      const newAmountPaid = previousAmount + amountConverted;
      const newStatus = this.getPaymentStatus(newAmountPaid, totalAmount);

      const filters: BaseFeeAssignmentFilters = {
        where: { feeAssignments: { assignmentId: { $eq: assignmentId } } },
      };

      const updatedRecord = this.update(
        {
          amountPaid: newAmountPaid,
          status: newStatus,
        },
        filters,
        tx,
      );

      if (!updatedRecord) {
        throw new Error(
          `Failed to return the updated record for assignment ID: ${assignmentId}`,
        );
      }

      return updatedRecord;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to update assignment progress for ID: ${assignmentId}`,
      );
      this.logError("updateAssignmentProgress", dbError, {
        assignmentId,
        amountConverted,
        totalAmount,
      });
      throw dbError;
    }
  }
}

export const feeAssignmentRepository = new FeeAssignmentRepository(db);
