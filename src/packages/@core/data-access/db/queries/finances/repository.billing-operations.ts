import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  feeConfigurations,
  dailyExchangeRates,
  type TableFeeConfiguration,
  type FeeConfiguration,
  type TableDailyExchangeRate,
  options,
  feeTypes,
  classrooms,
  type Option,
  type FeeType,
  type Classroom,
  type FeeSchedule,
  type Wallet,
  wallets,
} from "@/packages/@core/data-access/db/schemas";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/options";
import type { OptionProvider } from "@/packages/@core/data-access/db/queries/select-option.transformer";
import {
  DatabaseError,
  helpers,
  betterSqlite,
} from "@/packages/drizzle-queries";
import { eq, getTableColumns } from "drizzle-orm";

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
  wallet: Wallet;
};

const configJoinTables = {
  options,
  classrooms,
  feeTypes,
  wallets,
  feeConfigurations,
} as const;

export type FeeConfigurationFilters = helpers.FindManyOptions<
  typeof configJoinTables
>;

const FEE_CONFIG_DEFAULT_SORT: FeeConfigurationFilters = {
  orderBy: [{ table: "feeConfigurations", column: "name", order: "asc" }],
};

export class FeeConfigurationRepository
  extends betterSqlite.BaseRepository<
    TableFeeConfiguration,
    TDataBase,
    FeeConfigurationDTO
  >
  implements OptionProvider<FeeConfiguration>
{
  /**
   * Initializes a new instance of the FeeConfigurationRepository.
   * @param database - Optional database connection instance.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: feeConfigurations,
      idColumn: feeConfigurations.feeConfigId,
      baseTableName: "feeConfigurations",
      logger: getLogger,
      defaultFilters: FEE_CONFIG_DEFAULT_SORT,
      joinTables: configJoinTables,
    });
  }

  /**
   * Constructs the base query set with necessary relations for fee configurations.
   * @param tx - Optional database transaction instance.
   * @returns The dynamic query builder populated with joined relations.
   */
  protected getQuerySet(tx?: TDataBase) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),
        option: getTableColumns(options),
        classroom: getTableColumns(classrooms),
        feeType: getTableColumns(feeTypes),
        wallet: getTableColumns(wallets),
      })
      .from(this.table)
      .leftJoin(options, eq(this.table.optionId, options.optionId))
      .leftJoin(classrooms, eq(this.table.classroomId, classrooms.classId))
      .innerJoin(feeTypes, eq(this.table.feeTypeId, feeTypes.feeTypeId))
      .innerJoin(wallets, eq(feeTypes.walletId, wallets.walletId))
      .$dynamic();
  }

  /**
   * Lists available fee configurations for selection components.
   * @param filters - Optional filters to apply when fetching records.
   * @returns An array of fee configurations.
   */
  fetchOptions(filters: FeeConfigurationFilters = {}): FeeConfiguration[] {
    return this.findMany(filters);
  }

  /**
   * Finds all applicable configurations for a classroom or option based on specific context weightings.
   * @param ctx - Context object containing school, year, classroom, option, and section identifiers.
   * @param tx - Optional database transaction instance.
   * @returns An array of prioritized applicable fee configurations.
   */
  findApplicableConfigurations(
    ctx: {
      schoolId: string;
      yearId: string;
      classroomId: string;
      optionId: string | null;
      section: SECTION_ENUM | null;
    },
    tx: TDataBase = this.db,
  ): FeeApplicableConfiguration[] {
    try {
      const client = this.getClient(tx);
      const filters: FeeConfigurationFilters = {
        where: {
          feeConfigurations: {
            schoolId: { $eq: ctx.schoolId },
            yearId: { $eq: ctx.yearId },
          },
        },
        or: [
          { feeConfigurations: { optionId: { $eq: ctx.optionId } } },
          { feeConfigurations: { classroomId: { $eq: ctx.classroomId } } },
        ],
      };

      const configs = client.query.feeConfigurations.findMany({
        ...helpers.extractQueryPayload(this.getJoinTable(), filters),
        with: {
          feeType: {
            with: {
              schedules: true,
            },
          },
        },
      }) as unknown as FeeApplicableConfiguration[];

      if (configs.length === 0) return [];

      const getWeight = (c: (typeof configs)[0]) => {
        if (c.classroomId === ctx.classroomId) return 3;
        if (ctx.optionId && c.optionId === ctx.optionId) return 2;
        if (ctx.section && c.section === ctx.section) return 1;
        return 0;
      };

      const bestConfigsMap = new Map<string | null, (typeof configs)[0]>();

      for (const config of configs) {
        const currentWeight = getWeight(config);
        const existingConfig = bestConfigsMap.get(config.feeTypeId);

        if (!existingConfig || currentWeight > getWeight(existingConfig)) {
          bestConfigsMap.set(config.feeTypeId, config);
        }
      }

      return Array.from(
        bestConfigsMap.values(),
      ) as FeeApplicableConfiguration[];
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

const dailyExchangeJoinTables = {
  dailyExchangeRates,
} as const;

export type DailyExchangeRateFilters = helpers.FindManyOptions<
  typeof dailyExchangeJoinTables
>;

const DAILY_EXCHANGE_RATE_DEFAULT_SORT: DailyExchangeRateFilters = {
  orderBy: [{ table: "dailyExchangeRates", column: "date", order: "desc" }],
};

export class DailyExchangeRateRepository extends betterSqlite.BaseRepository<
  TableDailyExchangeRate,
  TDataBase
> {
  /**
   * Initializes a new instance of the DailyExchangeRateRepository.
   * @param database - Optional database connection instance.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: dailyExchangeRates,
      idColumn: dailyExchangeRates.rateId,
      baseTableName: "dailyExchangeRates",
      logger: getLogger,
      defaultFilters: DAILY_EXCHANGE_RATE_DEFAULT_SORT,
      joinTables: dailyExchangeJoinTables,
    });
  }

  /**
   * Retrieves the most recent daily exchange rate for a given currency pair.
   * @param filters - Filter options to locate the appropriate exchange rate.
   * @param tx - Optional database transaction instance.
   * @returns The latest daily exchange rate record or null if not found.
   */
  getLatestExchangeRate(
    filters: DailyExchangeRateFilters,
    tx: TDataBase = this.db,
  ) {
    try {
      const dailyRates = this.findMany(filters, tx);
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
      this.logError("getLatestExchangeRate", dbError, { filters });
      throw dbError;
    }
  }
}

export const dailyExchangeRateRepository = new DailyExchangeRateRepository(db);
