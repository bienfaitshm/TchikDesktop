import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeAssignments,
  classroomEnrollments,
  feeSchedules,
  feeTypes,
  type TableFeeAssignment,
  type FeeAssignment,
  type InsertFeeAssignment,
  type FeeSchedule,
  type FeeType,
} from "@/packages/@core/data-access/db/schemas";
import {
  CURRENCY_ENUM,
  FEE_SCHEDULE_STATUS_ENUM,
} from "@/packages/@core/data-access/db/options";
import {
  DatabaseError,
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";
import { getTableColumns, eq, and, sql } from "drizzle-orm";

export const TABLES = {
  feeAssignments,
  classroomEnrollments,
  feeSchedules,
  feeTypes,
} as const;

export type BaseFeeAssignmentFilters = helpers.FindManyOptions<typeof TABLES>;

const FEE_ASSIGNMENT_DEFAULT_SORT: BaseFeeAssignmentFilters = {
  orderBy: [{ table: "feeAssignments", column: "assignmentId", order: "desc" }],
};

const DEFAULT_FETCH_LIMIT = 20000;

export type FeeAssignmentDTO = FeeAssignment & {
  feeType: FeeType;
  feeSchedule: FeeSchedule;
};

export type AdjustAmountPayload = {
  newTotalAmount: number;
  currency: CURRENCY_ENUM;
  scheduleIds: string[];
  assignmentIds?: string[];
  classroomIds?: string[];
};

export type MarkAsPaidPayload = {
  assignmentId: string;
  amountConverted: number;
  totalAmount: number;
};

export type RevertPaymentPayload = {
  assignmentId: string;
  amountDeducted: number;
  totalAmount: number;
};

/**
 * Calculates the payment schedule status based on current and target amounts.
 * @param amount - The accumulated paid amount.
 * @param totalAmount - The target amount due.
 * @returns The resolved payment status enum value.
 */
export function calculatePaymentStatus(
  amount: number,
  totalAmount: number,
): FEE_SCHEDULE_STATUS_ENUM {
  if (amount >= totalAmount) {
    return amount > totalAmount
      ? FEE_SCHEDULE_STATUS_ENUM.OVERPAID
      : FEE_SCHEDULE_STATUS_ENUM.PAID;
  }
  if (amount <= 0) {
    return FEE_SCHEDULE_STATUS_ENUM.UNPAID;
  }
  return FEE_SCHEDULE_STATUS_ENUM.PARTIALLY_PAID;
}

/**
 * Data access repository for managing fee assignments and schedule calculations using Better-SQLite.
 */
export class FeeAssignmentRepository
  extends betterSqlite.BaseRepository<
    TableFeeAssignment,
    TDataBase,
    FeeAssignmentDTO,
    BaseFeeAssignmentFilters
  >
  implements OptionProvider<FeeAssignmentDTO, BaseFeeAssignmentFilters>
{
  /**
   * Initializes a new instance of FeeAssignmentRepository.
   * @param database - Database connection or transaction instance.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: feeAssignments,
      idColumn: feeAssignments.assignmentId,
      baseTableName: "FeeAssignment",
      logger: getLogger,
      defaultFilters: FEE_ASSIGNMENT_DEFAULT_SORT,
      joinTables: TABLES,
    });
  }

  /**
   * Constructs the DTO columns selection map for query projections.
   * @returns Column selections object for primary and joined tables.
   */
  public getDTOColumns() {
    return {
      ...getTableColumns(this.table),
      feeType: getTableColumns(feeTypes),
      feeSchedule: getTableColumns(feeSchedules),
    };
  }

  /**
   * Constructs the base query set with joins required for building FeeAssignmentDTO.
   * @param tx - Optional transaction client.
   * @returns Prepared dynamic query builder.
   */
  protected override getQuerySet(tx?: TDataBase) {
    const client = this.getClient(tx);
    return client
      .select(this.getDTOColumns())
      .from(this.table)
      .innerJoin(
        feeSchedules,
        eq(this.table.scheduleId, feeSchedules.scheduleId),
      )
      .innerJoin(feeTypes, eq(feeSchedules.feeTypeId, feeTypes.feeTypeId))
      .$dynamic();
  }

  /**
   * Fetches fee assignment options for select facade components.
   * @param filters - Query filters.
   * @returns Array of FeeAssignmentDTO objects.
   */
  public fetchOptions(filters?: BaseFeeAssignmentFilters): FeeAssignmentDTO[] {
    return this.findMany(filters);
  }

  /**
   * Retrieves fee assignments corresponding to a list of enrollment IDs.
   * @param enrollmentIds - Array of enrollment identifiers.
   * @returns Array of matching fee assignments.
   */
  public getEnrollmentAssignments(enrollmentIds: string[]): FeeAssignmentDTO[] {
    if (enrollmentIds.length === 0) {
      return [];
    }

    return this.findMany({
      where: {
        feeAssignments: { enrollmentId: { $in: enrollmentIds } },
      },
      limit: DEFAULT_FETCH_LIMIT,
    });
  }

  /**
   * Fetches pending fee schedules for a specific student enrollment and fee type.
   * @param enrollmentId - Student enrollment identifier.
   * @param feeTypeId - Fee type identifier.
   * @param tx - Optional database transaction instance.
   * @returns List of pending fee assignment DTOs.
   */
  public getPendingSchedulesForEnrollment(
    enrollmentId: string,
    feeTypeId: string,
    tx: TDataBase = this.db,
  ): FeeAssignmentDTO[] {
    return this.findMany(
      {
        where: {
          feeAssignments: {
            enrollmentId: { $eq: enrollmentId },
            status: { $ne: FEE_SCHEDULE_STATUS_ENUM.PAID },
          },
          feeTypes: {
            feeTypeId,
          },
        },
      },
      tx,
    );
  }

  /**
   * Computes total amount already paid by a student enrollment for a given fee type.
   * @param enrollmentId - Student enrollment identifier.
   * @param feeTypeId - Fee type identifier.
   * @param tx - Optional database transaction instance.
   * @returns Sum of paid amounts.
   */
  public getAlreadyPaidAmountForFee(
    enrollmentId: string,
    feeTypeId: string,
    tx: TDataBase = this.db,
  ): number {
    const client = this.getClient(tx);

    const result = client
      .select({
        totalPaid: sql<number>`COALESCE(SUM(${feeAssignments.amountPaid}), 0)`,
      })
      .from(feeAssignments)
      .innerJoin(
        feeSchedules,
        eq(feeAssignments.scheduleId, feeSchedules.scheduleId),
      )
      .where(
        and(
          eq(feeAssignments.enrollmentId, enrollmentId),
          eq(feeSchedules.feeTypeId, feeTypeId),
        ),
      )
      .get();

    return Number(result?.totalPaid ?? 0);
  }

  /**
   * Updates amounts due for specified pending assignment schedules.
   * @param assignmentIds - Array of assignment IDs to update.
   * @param newAmountDue - Updated amount to set per schedule.
   * @param tx - Optional database transaction instance.
   */
  public updatePendingSchedules(
    assignmentIds: string[],
    newAmountDue: number,
    tx: TDataBase = this.db,
  ): void {
    if (assignmentIds.length === 0) return;

    try {
      this.update(
        { totalAmount: newAmountDue },
        {
          where: {
            feeAssignments: {
              assignmentId: { $in: assignmentIds },
            },
          },
        },
        tx,
      );
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Failed to update pending schedule amounts.",
      );
      this.logError("updatePendingSchedules", dbError, {
        assignmentIds,
        newAmountDue,
      });
      throw dbError;
    }
  }

  /**
   * Retrieves the currently paid amount for a specific fee assignment.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param tx - Optional database transaction instance.
   * @returns Object containing paid and total amounts.
   */
  public getAssignmentAmount(
    assignmentId: string,
    tx: TDataBase = this.db,
  ): { amountPaid: number; totalAmount: number } {
    const current = this.findById(assignmentId, tx, {
      amountPaid: this.table.amountPaid,
      totalAmount: this.table.totalAmount,
    });
    if (!current) {
      throw new DatabaseError(
        `Fee assignment with ID ${assignmentId} not found`,
      );
    }
    return {
      amountPaid: current.amountPaid ?? 0,
      totalAmount: current.totalAmount ?? 0,
    };
  }

  /**
   * Inserts multiple fee assignments in bulk while ignoring conflicting unique constraints.
   * @param assignments - Array of fee assignment records to insert.
   * @param tx - Optional database transaction instance.
   */
  public assignFees(
    assignments: InsertFeeAssignment[],
    tx: TDataBase = this.db,
  ): void {
    try {
      const assignmentClient = this.getClient(tx);
      assignmentClient
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
   * Updates progress by adding new payment amount and refreshing status.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param amountConverted - The new amount to add to current balance.
   * @param tx - Optional database transaction instance.
   * @returns The updated fee assignment record.
   */
  public updateAssignmentProgress(
    assignmentId: string,
    amountConverted: number,
    tx: TDataBase = this.db,
  ): FeeAssignment {
    const { amountPaid: previousAmount, totalAmount } =
      this.getAssignmentAmount(assignmentId, tx);
    const newAmountPaid = previousAmount + amountConverted;
    return this.applyProgressUpdate(
      assignmentId,
      newAmountPaid,
      totalAmount,
      "updateAssignmentProgress",
      tx,
    );
  }

  /**
   * Reverts progress by deducting canceled payment amount and updating status.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param amountDeducted - The amount to subtract from current balance.
   * @param tx - Optional database transaction instance.
   * @returns The updated fee assignment record.
   */
  public revertAssignmentProgress(
    assignmentId: string,
    amountDeducted: number,
    tx: TDataBase = this.db,
  ): FeeAssignment {
    const { amountPaid: previousAmount, totalAmount } =
      this.getAssignmentAmount(assignmentId, tx);
    const newAmountPaid = Math.max(0, previousAmount - amountDeducted);
    return this.applyProgressUpdate(
      assignmentId,
      newAmountPaid,
      totalAmount,
      "revertAssignmentProgress",
      tx,
    );
  }

  /**
   * Internal helper to persist updated paid amount and status.
   * @param assignmentId - Unique identifier of the fee assignment.
   * @param newAmountPaid - Recalculated total amount paid.
   * @param totalAmount - Target expected total amount.
   * @param actionName - Name of calling method for logging context.
   * @param tx - Database transaction handle.
   * @returns The updated fee assignment record.
   */
  private applyProgressUpdate(
    assignmentId: string,
    newAmountPaid: number,
    totalAmount: number,
    actionName: string,
    tx: TDataBase,
  ): FeeAssignment {
    try {
      const newStatus = calculatePaymentStatus(newAmountPaid, totalAmount);
      const filters: BaseFeeAssignmentFilters = {
        where: { feeAssignments: { assignmentId: { $eq: assignmentId } } },
      };

      const [updatedRecord] = this.update(
        {
          amountPaid: newAmountPaid,
          status: newStatus,
        },
        filters,
        tx,
      );

      if (!updatedRecord) {
        throw new Error(
          `Failed to return updated record for assignment ID: ${assignmentId}`,
        );
      }

      return updatedRecord;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to execution action ${actionName} for assignment ID: ${assignmentId}`,
      );
      this.logError(actionName, dbError, {
        assignmentId,
        newAmountPaid,
        totalAmount,
      });
      throw dbError;
    }
  }

  /**
   * Updates total fee amount for specific assignments and schedules.
   * @param newTotalAmount - New target total amount.
   * @param currency - Currency enum code.
   * @param assignmentIds - List of assignment identifiers.
   * @param scheduleIds - List of schedule identifiers.
   * @param tx - Transaction client.
   * @returns Array of updated fee assignments.
   */
  public updateAmountByAssignments(
    newTotalAmount: number,
    currency: CURRENCY_ENUM,
    assignmentIds: string[],
    scheduleIds: string[],
    tx: TDataBase = this.db,
  ): FeeAssignment[] {
    return this.updateAmount(
      newTotalAmount,
      currency,
      {
        feeAssignments: {
          assignmentId: { $in: assignmentIds },
          scheduleId: { $in: scheduleIds },
        },
      },
      tx,
    );
  }

  /**
   * Updates total fee amount for specific classrooms and schedules.
   * @param newTotalAmount - New target total amount.
   * @param currency - Currency enum code.
   * @param classroomIds - List of classroom identifiers.
   * @param scheduleIds - List of schedule identifiers.
   * @param tx - Transaction client.
   * @returns Array of updated fee assignments.
   */
  public updateAmountByClassrooms(
    newTotalAmount: number,
    currency: CURRENCY_ENUM,
    classroomIds: string[],
    scheduleIds: string[],
    tx: TDataBase = this.db,
  ): FeeAssignment[] {
    return this.updateAmount(
      newTotalAmount,
      currency,
      {
        feeAssignments: { scheduleId: { $in: scheduleIds } },
        classroomEnrollments: { classroomId: { $in: classroomIds } },
      },
      tx,
    );
  }

  /**
   * Exempts students from payment for specified assignments.
   * @param studentEnrollmentIds - List of student enrollment identifiers.
   * @param assignmentIds - List of assignment identifiers to exempt.
   * @param tx - Transaction client.
   * @returns Array of updated fee assignments.
   */
  public exemptStudentsFromFee(
    studentEnrollmentIds: string[],
    assignmentIds: string[],
    tx: TDataBase = this.db,
  ): FeeAssignment[] {
    return this.update(
      { status: FEE_SCHEDULE_STATUS_ENUM.EXEMPTED },
      {
        where: {
          feeAssignments: {
            enrollmentId: { $in: studentEnrollmentIds },
            assignmentId: { $in: assignmentIds },
          },
        },
      },
      tx,
    );
  }

  /**
   * Private helper to update total fee amount using a custom filter query.
   * @param newTotalAmount - Target total amount.
   * @param currency - Target currency enum.
   * @param whereQuery - Criteria object for filtering.
   * @param tx - Transaction instance.
   * @returns Array of updated fee assignments.
   */
  private updateAmount(
    newTotalAmount: number,
    currency: CURRENCY_ENUM,
    whereQuery: BaseFeeAssignmentFilters["where"],
    tx: TDataBase,
  ): FeeAssignment[] {
    return this.update(
      { totalAmount: newTotalAmount, currency, isCustomized: true },
      { where: whereQuery },
      tx,
    );
  }
}

export const feeAssignmentRepository = new FeeAssignmentRepository(db);
