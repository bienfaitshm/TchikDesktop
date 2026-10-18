import { db, type TDataBase } from "@/packages/@core/data-access/db/config";
import { CustomLogger, getLogger } from "@/packages/logger";
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
import {
  DatabaseError,
  helpers,
  betterSqlite,
  OptionProvider,
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

export type DailyExchangeRateDTO = TableDailyExchangeRate;

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

const CONFIGURATION_WEIGHTS = {
  CLASSROOM: 3,
  OPTION: 2,
  SECTION: 1,
  DEFAULT: 0,
} as const;

export type EvaluationContext = {
  schoolId: string;
  yearId: string;
  classroomId: string;
  optionId: string | null;
  section: SECTION_ENUM | null;
};

/**
 * Computes the specificity weight of a fee configuration against the current context.
 * @param config - The fee applicable configuration to evaluate.
 * @param ctx - Context object containing identifiers.
 * @returns Numeric weight representing specificity.
 */
function calculateConfigurationWeight(
  config: FeeApplicableConfiguration,
  ctx: Pick<EvaluationContext, "classroomId" | "optionId" | "section">,
): number {
  if (config.classroomId === ctx.classroomId) {
    return CONFIGURATION_WEIGHTS.CLASSROOM;
  }
  if (ctx.optionId && config.optionId === ctx.optionId) {
    return CONFIGURATION_WEIGHTS.OPTION;
  }
  if (ctx.section && config.section === ctx.section) {
    return CONFIGURATION_WEIGHTS.SECTION;
  }
  return CONFIGURATION_WEIGHTS.DEFAULT;
}

/**
 * Reduces configurations by keeping only the highest weighted match per fee type.
 * @param configs - List of fetched configurations.
 * @param ctx - Context object containing identifiers.
 * @returns Array of unique prioritized configurations.
 */
function reduceToBestConfigurations(
  configs: FeeApplicableConfiguration[],
  ctx: Pick<EvaluationContext, "classroomId" | "optionId" | "section">,
): FeeApplicableConfiguration[] {
  const bestConfigsMap = new Map<string | null, FeeApplicableConfiguration>();

  for (const config of configs) {
    if (!config.feeTypeId) continue;
    const currentWeight = calculateConfigurationWeight(config, ctx);
    const existingConfig = bestConfigsMap.get(config.feeTypeId);
    if (
      !existingConfig ||
      currentWeight >= calculateConfigurationWeight(existingConfig, ctx)
    ) {
      bestConfigsMap.set(config.feeTypeId, config);
    }
  }

  return Array.from(bestConfigsMap.values());
}

/**
 * Repository handling database operations for fee configurations.
 */
export class FeeConfigurationRepository
  extends betterSqlite.BaseRepository<
    TableFeeConfiguration,
    TDataBase,
    FeeConfigurationDTO,
    FeeConfigurationFilters
  >
  implements OptionProvider<FeeConfiguration>
{
  /**
   * Initializes a new instance of FeeConfigurationRepository.
   * @param database - Database connection instance.
   * @param customLogger - Custom logger instance.
   */
  constructor(
    database: TDataBase = db,
    private readonly customLogger: CustomLogger = getLogger(
      "FeeConfigurationRepository",
    ),
  ) {
    super({
      db: database,
      table: feeConfigurations,
      idColumn: feeConfigurations.feeConfigId,
      baseTableName: "feeConfigurations",
      logger: () => customLogger,
      defaultFilters: FEE_CONFIG_DEFAULT_SORT,
      joinTables: configJoinTables,
    });
  }

  /**
   * Constructs the base query set with necessary relations for fee configurations.
   * @param tx - Optional database transaction instance.
   * @returns The dynamic query builder populated with joined relations.
   */
  protected override getQuerySet(tx?: TDataBase) {
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
   * @param filters - Filters to apply when fetching records.
   * @returns An array of fee configurations.
   */
  public fetchOptions(filters?: FeeConfigurationFilters) {
    this.customLogger.info("Fetching fee configuration options.");
    return this.findMany(filters);
  }

  /**
   * Constructs query payload filters for extracting applicable configurations.
   * @param ctx - Evaluation context containing school, year, and identifiers.
   * @returns Fee configuration filter options.
   */
  private getExtractQueryPayload(
    ctx: EvaluationContext,
  ): FeeConfigurationFilters {
    return {
      where: {
        feeConfigurations: {
          schoolId: { $eq: ctx.schoolId },
          yearId: { $eq: ctx.yearId },
        },
      },
      or: [
        { feeConfigurations: { classroomId: { $eq: ctx.classroomId } } },
        { feeConfigurations: { optionId: { $eq: ctx.optionId } } },
        { feeConfigurations: { section: { $eq: ctx.section } } },
      ],
    };
  }

  /**
   * Finds all applicable configurations for a classroom or option based on specific context weightings.
   * @param ctx - Context object containing school, year, classroom, option, and section identifiers.
   * @param tx - Database transaction instance.
   * @returns An array of prioritized applicable fee configurations.
   */
  public findApplicableConfigurations(
    ctx: EvaluationContext,
    tx: TDataBase = this.db,
  ): FeeApplicableConfiguration[] {
    this.customLogger.info(
      `Finding applicable configurations for classroom ${ctx.classroomId} and school ${ctx.schoolId}`,
    );

    try {
      const client = this.getClient(tx);
      const filters = this.getExtractQueryPayload(ctx);
      const queryPayload = helpers.extractQueryPayload(
        this.getJoinTable(),
        filters,
      );

      const configs = client.query.feeConfigurations
        .findMany({
          ...queryPayload,
          with: {
            feeType: {
              with: {
                schedules: true,
              },
            },
          },
        })
        .sync() as FeeApplicableConfiguration[];

      if (configs.length === 0) {
        this.customLogger.info("No matching fee configurations found.");
        return [];
      }

      const resolvedConfigs = reduceToBestConfigurations(configs, ctx);
      this.customLogger.info(
        `Resolved ${resolvedConfigs.length} prioritized applicable configurations.`,
      );

      return resolvedConfigs;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Failed to find applicable fee configurations.",
      );
      this.customLogger.error(
        "Failed to find applicable fee configurations",
        error,
      );
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

/**
 * Repository handling daily exchange rate operations.
 */
export class DailyExchangeRateRepository extends betterSqlite.BaseRepository<
  TableDailyExchangeRate,
  TDataBase,
  DailyExchangeRateDTO,
  DailyExchangeRateFilters
> {
  /**
   * Initializes a new instance of DailyExchangeRateRepository.
   * @param database - Database connection instance.
   * @param customLogger - Custom logger instance.
   */
  constructor(
    database: TDataBase = db,
    private readonly customLogger: CustomLogger = getLogger(
      "DailyExchangeRateRepository",
    ),
  ) {
    super({
      db: database,
      table: dailyExchangeRates,
      idColumn: dailyExchangeRates.rateId,
      baseTableName: "dailyExchangeRates",
      logger: () => customLogger,
      defaultFilters: DAILY_EXCHANGE_RATE_DEFAULT_SORT,
      joinTables: dailyExchangeJoinTables,
    });
  }

  /**
   * Retrieves the most recent daily exchange rate for a given currency pair.
   * @param filters - Filter options to locate the appropriate exchange rate.
   * @param tx - Database transaction instance.
   * @returns The latest daily exchange rate record or null if not found.
   */
  public getLatestExchangeRate(
    filters: DailyExchangeRateFilters,
    tx: TDataBase = this.db,
  ): DailyExchangeRateDTO | null {
    this.customLogger.info("Fetching latest exchange rate.");

    try {
      const dailyRates = this.findMany(filters, tx);
      if (dailyRates.length > 0) {
        const [rate] = dailyRates;
        this.customLogger.info(`Exchange rate found: ${rate.rateId}`);
        return rate;
      }
      this.customLogger.info("No exchange rate found for given filters.");
      return null;
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        "Failed to retrieve the latest exchange rate.",
      );
      this.customLogger.error("Failed to retrieve latest exchange rate", error);
      throw dbError;
    }
  }
}

export const dailyExchangeRateRepository = new DailyExchangeRateRepository(db);
