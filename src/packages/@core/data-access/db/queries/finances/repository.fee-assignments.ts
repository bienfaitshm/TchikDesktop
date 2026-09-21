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
  FEE_SCHEDULES_ENUM,
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

export type FeeAssignmentDTO = FeeAssignment & {
  feeType: FeeType;
  feeSchedule: FeeSchedule;
};

/**
 * Data access repository for managing fee assignments and schedule calculations.
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
   * Initializes a new instance of the FeeAssignmentRepository.
   * @param database - Optional database connection or transaction instance.
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
   * @returns Prepared dynamic query.
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
    return this.findMany({
      where: {
        feeAssignments: { enrollmentId: { $in: enrollmentIds } },
      },
      limit: 20000,
    });
  }

  /**
   * Fetches pending (unpaid or partially paid) fee schedules for a specific student enrollment and fee type.
   * @param enrollmentId - Student enrollment identifier.
   * @param feeTypeId - Fee type identifier.
   * @param tx - Optional database transaction instance.
   * @returns List of pending fee assignment DTOs.
   */
  public async getPendingSchedulesForEnrollment(
    enrollmentId: string,
    feeTypeId: string,
    tx: TDataBase = this.db,
  ): Promise<FeeAssignmentDTO[]> {
    return this.findMany(
      {
        where: {
          feeAssignments: {
            enrollmentId: { $eq: enrollmentId },
            status: { $ne: FEE_SCHEDULES_ENUM.PAID },
          },
          feeTypes: {
            feeTypeId: { $eq: feeTypeId },
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
  public async getAlreadyPaidAmountForFee(
    enrollmentId: string,
    feeTypeId: string,
    tx: TDataBase = this.db,
  ): Promise<number> {
    const client = this.getClient(tx);

    const result = await client
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
      );

    return Number(result[0]?.totalPaid ?? 0);
  }

  /**
   * Updates amounts due for specified pending assignment schedules.
   * @param assignmentIds - Array of assignment IDs to update.
   * @param newAmountDue - Updated amount to set per schedule.
   * @param tx - Optional database transaction instance.
   */
  public async updatePendingSchedules(
    assignmentIds: string[],
    newAmountDue: number,
    tx: TDataBase = this.db,
  ): Promise<void> {
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
   * Determines the payment status based on the paid amount and the total expected amount.
   * @param amount - The current paid amount.
   * @param totalAmount - The total expected amount.
   * @returns The corresponding payment schedule status enum.
   */
  public getPaymentStatus(
    amount: number,
    totalAmount: number,
  ): FEE_SCHEDULES_ENUM {
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
  public getAssignmentAmount(
    assignmentId: string,
    tx: TDataBase = this.db,
  ): number {
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
  public assignFees(
    assignments: InsertFeeAssignment[],
    tx: TDataBase = this.db,
  ) {
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
  public updateAssignmentProgress(
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
   * @param currency - Currency code.
   * @param assignmentIds - List of assignment identifiers.
   * @param scheduleIds - List of schedule identifiers.
   * @param tx - Transaction client.
   * @returns Result of update query.
   */
  public updateAmountByAssignments(
    newTotalAmount: number,
    currency: CURRENCY_ENUM,
    assignmentIds: string[],
    scheduleIds: string[],
    tx: TDataBase = this.db,
  ) {
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
   * Updates the total fee amount for specific classrooms and schedules.
   * @param newTotalAmount - The new amount to be applied.
   * @param currency - Currency code.
   * @param classroomIds - List of classroom identifiers.
   * @param scheduleIds - List of schedule identifiers.
   * @param tx - Transaction client.
   * @returns Result of update query.
   */
  public updateAmountByClassrooms(
    newTotalAmount: number,
    currency: CURRENCY_ENUM,
    classroomIds: string[],
    scheduleIds: string[],
    tx: TDataBase = this.db,
  ) {
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
   * Exempts students from payment for the specified assignments.
   * @param studentEnrollmentIds - List of student enrollment identifiers.
   * @param assignmentIds - List of assignment identifiers to exempt.
   * @param tx - Transaction client.
   * @returns Result of update query.
   */
  public exemptStudentsFromFee(
    studentEnrollmentIds: string[],
    assignmentIds: string[],
    tx: TDataBase = this.db,
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
      tx,
    );
  }

  /**
   * Private helper to update total fee amount using a custom filter query.
   * @param newTotalAmount - The target amount.
   * @param currency - Target currency.
   * @param whereQuery - Criteria object for filtering.
   * @param tx - Transaction instance.
   * @returns Update query result.
   */
  private updateAmount(
    newTotalAmount: number,
    currency: CURRENCY_ENUM,
    whereQuery: BaseFeeAssignmentFilters["where"],
    tx: TDataBase,
  ) {
    return this.update(
      { totalAmount: newTotalAmount, currency },
      { where: whereQuery },
      tx,
    );
  }
}

export const feeAssignmentRepository = new FeeAssignmentRepository(db);
