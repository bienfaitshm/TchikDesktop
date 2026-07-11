import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeConfigurations,
  feeAssignments,
  studentPayments,
  dailyExchangeRates,
  type TableFeeConfiguration,
  type FeeConfiguration,
  type TableFeeAssignment,
  type TableStudentPayment,
  type TableDailyExchangeRate,
  type FindManyOptions,
  options,
  feeTypes,
  classrooms,
  type Option,
  type FeeType,
  type Classroom,
  type FeeSchedule,
} from "@/packages/@core/data-access/db/schemas";
import {
  FEE_SCHEDULES_ENUM,
  SECTION_ENUM,
} from "@/packages/@core/data-access/db/options";
import type {
  OptionProvider,
  SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import {
  BaseRepository,
  DatabaseError,
  type DrizzleClient,
} from "@/packages/drizzle-queries";
import { and, eq, getTableColumns, or, sql } from "drizzle-orm";

export type FeeApplicableConfiguration = FeeConfiguration & {
  feeType:
    | (FeeType & {
        schedules: FeeSchedule[];
      })
    | null;
};

export type FeeConfigurationDTO = FeeConfiguration & {
  option: Option | null;
  classroom: Classroom | null;
  feeType: FeeType;
};
/* =========================================================================
   3. FEE CONFIGURATION REPOSITORY
   ========================================================================= */

export type FeeConfigurationFilters = Partial<
  FindManyOptions<TableFeeConfiguration>
>;

const FEE_CONFIG_DEFAULT_SORT: FeeConfigurationFilters = {
  orderBy: [{ column: "name", order: "asc" }],
};

export class FeeConfigurationRepository
  extends BaseRepository<TableFeeConfiguration, TDataBase>
  implements OptionProvider<FeeConfiguration>
{
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: feeConfigurations,
      idColumn: feeConfigurations.feeConfigId,
      entityName: "FeeConfiguration",
      logger: getLogger,
      defaultSort: FEE_CONFIG_DEFAULT_SORT,
    });

    this.searchFiltersColumns = [feeConfigurations.name];
  }

  protected getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),

        option: getTableColumns(options),
        classroom: getTableColumns(classrooms),
        feeType: getTableColumns(feeTypes),
      })
      .from(this.table)
      .leftJoin(options, eq(this.table.optionId, options.optionId))
      .leftJoin(classrooms, eq(this.table.classroomId, classrooms.classId))
      .innerJoin(feeTypes, eq(this.table.feeTypeId, feeTypes.feeTypeId))
      .$dynamic();
  }

  /**
   * Permet de lister les configurations de frais disponibles pour un Select/Combobox.
   */
  async fetchOptions(
    params: SearchOptions<FeeConfigurationFilters> = {},
  ): Promise<FeeConfiguration[]> {
    return this.findForSelect(params);
  }

  /**
   * Trouver toutes les configurations applicables à une classe ou une option (XOR)
   * Sécurisé contre les valeurs nulles en SQL
   */
  async findApplicableConfigurations(
    ctx: {
      schoolId: string;
      yearId: string;
      classroomId: string;
      optionId: string | null;
      section: SECTION_ENUM | null;
    },
    tx: TDataBase = this.db,
  ) {
    try {
      const existeTeeTypeIDs = new Set();
      const client = this.getClient(tx);

      const targetConditions = [
        eq(feeConfigurations.classroomId, ctx.classroomId),
      ];

      if (ctx.optionId) {
        targetConditions.push(eq(feeConfigurations.optionId, ctx.optionId));
      }
      if (ctx.section) {
        targetConditions.push(
          eq(feeConfigurations.section, ctx.section as SECTION_ENUM),
        );
      }

      const configs = await client.query.feeConfigurations.findMany({
        where: and(
          eq(feeConfigurations.schoolId, ctx.schoolId),
          eq(feeConfigurations.yearId, ctx.yearId),
          or(...targetConditions),
        ),
        with: {
          feeType: {
            with: {
              schedules: true,
            },
          },
        },
      });

      if (configs.length === 0) return null;
      // if (configs.length === 1) return configs[0];
      const _configs = configs.sort((a, b) => {
        const getWeight = (c: typeof a) => {
          if (c.classroomId === ctx.classroomId) return 3;
          if (ctx.optionId && c.optionId === ctx.optionId) return 2;
          if (ctx.section && c.section === ctx.section) return 1;
          return 0;
        };

        return getWeight(b) - getWeight(a);
      });

      const feeConfigs: FeeApplicableConfiguration[] = [];
      _configs.forEach((element) => {
        if (!existeTeeTypeIDs.has(element.feeTypeId)) {
          feeConfigs.push(element);
        }
        existeTeeTypeIDs.add(element.feeTypeId);
      });
      return feeConfigs;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Failed to find applicable fee configurations.",
      );
      this.logError("findApplicableConfigurations", dbError, ctx);
      throw dbError;
    }
  }
}

export const feeConfigurationRepository = new FeeConfigurationRepository(db);

/* =========================================================================
   4. FEE ASSIGNMENT REPOSITORY
   ========================================================================= */

export type FeeAssignmentFilters = Partial<FindManyOptions<TableFeeAssignment>>;

const FEE_ASSIGNMENT_DEFAULT_SORT: FeeAssignmentFilters = {
  orderBy: [{ column: "assignmentId", order: "desc" }],
};

export class FeeAssignmentRepository extends BaseRepository<
  TableFeeAssignment,
  DrizzleClient
> {
  constructor(database: DrizzleClient = db) {
    super({
      db: database,
      table: feeAssignments,
      idColumn: feeAssignments.assignmentId,
      entityName: "FeeAssignment",
      logger: getLogger,
      defaultSort: FEE_ASSIGNMENT_DEFAULT_SORT,
    });

    this.searchFiltersColumns = [];
  }

  /**
   * Mettre à jour l'état d'avancement de la dette de l'élève (Garanti transactionnel)
   */
  async updateAssignmentProgress(
    assignmentId: string,
    amountConverted: number,
    totalAmount: number,
    tx: DrizzleClient = this.db,
  ) {
    try {
      const client = this.getClient(tx);

      const [current] = await client
        .select({ amountPaid: feeAssignments.amountPaid })
        .from(feeAssignments)
        .where(eq(feeAssignments.assignmentId, assignmentId));

      const newAmountPaid = (current?.amountPaid ?? 0) + amountConverted;
      let newStatus = FEE_SCHEDULES_ENUM.PARTIAL;

      if (newAmountPaid >= totalAmount) {
        newStatus = FEE_SCHEDULES_ENUM.PAID;
      } else if (newAmountPaid <= 0) {
        newStatus = FEE_SCHEDULES_ENUM.UNPAID;
      }

      await client
        .update(feeAssignments)
        .set({
          amountPaid: newAmountPaid,
          status: newStatus as any,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(feeAssignments.assignmentId, assignmentId));
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

/* =========================================================================
   5. STUDENT PAYMENT REPOSITORY (Historique Comptable)
   ========================================================================= */

export type StudentPaymentFilters = Partial<
  FindManyOptions<TableStudentPayment>
>;

const STUDENT_PAYMENT_DEFAULT_SORT: StudentPaymentFilters = {
  orderBy: [{ column: "paymentId", order: "desc" }],
};

export class StudentPaymentRepository extends BaseRepository<
  TableStudentPayment,
  DrizzleClient
> {
  constructor(database: DrizzleClient = db) {
    super({
      db: database,
      table: studentPayments,
      idColumn: studentPayments.paymentId,
      entityName: "StudentPayment",
      logger: getLogger,
      defaultSort: STUDENT_PAYMENT_DEFAULT_SORT,
    });

    this.searchFiltersColumns = [studentPayments.transactionReference];
  }
}

export const studentPaymentRepository = new StudentPaymentRepository(db);

/* =========================================================================
   6. DAILY EXCHANGE RATE REPOSITORY (Taux du jour)
   ========================================================================= */

export type DailyExchangeRateFilters = Partial<
  FindManyOptions<TableDailyExchangeRate>
>;

const DAILY_EXCHANGE_RATE_DEFAULT_SORT: DailyExchangeRateFilters = {
  orderBy: [{ column: "date", order: "desc" }],
};

export class DailyExchangeRateRepository extends BaseRepository<
  TableDailyExchangeRate,
  DrizzleClient
> {
  constructor(database: DrizzleClient = db) {
    super({
      db: database,
      table: dailyExchangeRates,
      idColumn: dailyExchangeRates.rateId,
      entityName: "DailyExchangeRate",
      logger: getLogger,
      defaultSort: DAILY_EXCHANGE_RATE_DEFAULT_SORT,
    });

    this.searchFiltersColumns = [dailyExchangeRates.date];
  }

  /**
   * Obtenir le taux du jour le plus récent pour un couple de devises (Compatible Transaction)
   */
  async getLatestExchangeRate(
    filters: DailyExchangeRateFilters,
    tx: DrizzleClient = this.db,
  ) {
    try {
      const dailyRates = await this.findMany(filters, tx);
      if (dailyRates.length > 0) {
        const [rate] = dailyRates;
        return rate;
      }
      return null;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Failed to retrieve the latest exchange rate.",
      );
      this.logError("getLatestExchangeRate", dbError, filters);
      throw dbError;
    }
  }
}

export const dailyExchangeRateRepository = new DailyExchangeRateRepository(db);
