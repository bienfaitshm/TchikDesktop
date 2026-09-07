import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeAssignments,
  classroomEnrollments,
  type TableFeeAssignment,
  type FeeAssignment,
  type InsertFeeAssignment,
} from "@/packages/@core/data-access/db/schemas";
import { FEE_SCHEDULES_ENUM } from "@/packages/@core/data-access/db/options";

import {
  DatabaseError,
  helpers,
  betterSqlite,
} from "@/packages/drizzle-queries";

export const TABLES = {
  feeAssignments,
  classroomEnrollments,
} as const;

export type BaseFeeAssignmentFilters = helpers.FindManyOptions<typeof TABLES>;
const FEE_ASSIGNMENT_DEFAULT_SORT: BaseFeeAssignmentFilters = {
  orderBy: [{ table: "feeAssignments", column: "assignmentId", order: "desc" }],
};

export class FeeAssignmentRepository extends betterSqlite.BaseRepository<
  TableFeeAssignment,
  TDataBase,
  FeeAssignment,
  BaseFeeAssignmentFilters
> {
  /**
   * Initializes a new instance of the FeeAssignmentRepository.
   * @param database - Optional database connection instance.
   */
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

  getEnrollmentAssignments(enrollmentIds: string[]) {
    return this.findMany({
      where: {
        feeAssignments: { enrollmentId: { $in: enrollmentIds } },
      },
      limit: 20000,
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
   * Inserts multiple fee assignments in bulk while ignoring conflicting unique constraints.
   * @param assignments - Array of fee assignment records to insert.
   * @param tx - Optional database transaction instance.
   * @returns The result of the batch insert operation.
   */
  assignFees(assignments: InsertFeeAssignment[], tx: TDataBase = this.db) {
    try {
      const assignmentClient = this.getClient(tx);
      return assignmentClient
        .insert(this.table)
        .values(assignments)
        .onConflictDoNothing()
        .run();
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Failed to assign fee records in bulk.",
      );
      this.logError("assignFees", dbError, { count: assignments.length });
      throw dbError;
    }
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

  /**
   * Updates the total fee amount for specific assignments and schedules.
   * @param newTotalAmount - The new amount to be applied.
   * @param assignmentIds - List of assignment identifiers to filter by.
   * @param scheduleIds - List of schedule identifiers to filter by.
   * @returns Promise resolving to the result of the update operation.
   */
  updateAmountByAssignments(
    newTotalAmount: number,
    assignmentIds: string[],
    scheduleIds: string[],
  ) {
    return this.updateAmount(newTotalAmount, {
      feeAssignments: {
        assignmentId: { $in: assignmentIds },
        scheduleId: { $in: scheduleIds },
      },
    });
  }

  /**
   * Updates the total fee amount for specific classrooms and schedules.
   * @param newTotalAmount - The new amount to be applied.
   * @param classroomIds - List of classroom identifiers to filter by.
   * @param scheduleIds - List of schedule identifiers to filter by.
   * @returns Promise resolving to the result of the update operation.
   */
  updateAmountByClassrooms(
    newTotalAmount: number,
    classroomIds: string[],
    scheduleIds: string[],
  ) {
    return this.updateAmount(newTotalAmount, {
      feeAssignments: { scheduleId: { $in: scheduleIds } },
      classroomEnrollments: { classroomId: { $in: classroomIds } },
    });
  }

  /**
   * Exempts students from payment for the specified assignments.
   * @param studentEnrollmentIds - List of student enrollment identifiers.
   * @param assignmentIds - List of assignment identifiers to exempt.
   * @returns Promise resolving to the result of the update operation.
   */
  exemptStudentsFromFee(
    studentEnrollmentIds: string[],
    assignmentIds: string[],
  ) {
    return this.update(
      { status: FEE_SCHEDULES_ENUM.EXEMPTED },
      {
        where: {
          feeAssignments: {
            enrollmentId: { $in: studentEnrollmentIds },
            assignmentId: { $in: assignmentIds },
          },
        },
      },
    );
  }

  /**
   * Private helper to update the total fee amount using a custom filter query.
   * @param newTotalAmount - The target amount.
   * @param whereQuery - The criteria object for filtering updates.
   * @returns Promise resolving to the result of the update operation.
   */
  private updateAmount(
    newTotalAmount: number,
    whereQuery: BaseFeeAssignmentFilters["where"],
  ) {
    return this.update({ totalAmount: newTotalAmount }, { where: whereQuery });
  }
}

export const feeAssignmentRepository = new FeeAssignmentRepository(db);
