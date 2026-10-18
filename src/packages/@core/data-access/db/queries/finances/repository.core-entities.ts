import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  wallets,
  feeTypes,
  feeSchedules,
  type Wallet,
  type TableFeeType,
  type FeeType,
  type TableFeeSchedule,
  type FeeSchedule,
} from "@/packages/@core/data-access/db/schemas";

import {
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";
import { eq, getTableColumns } from "drizzle-orm";

export type FeeTypeDTO = FeeType & {
  wallet: Wallet;
};

export type FeeTypeWithSchedulesDTO = FeeTypeDTO & {
  schedules: FeeSchedule[];
};

const _feeTypeJoinTables = {
  feeTypes,
  wallets,
} as const;

export type BaseFeeTypeOptionFilters = helpers.FindManyOptions<
  typeof _feeTypeJoinTables
>;

const FEE_TYPE_OPTION_DEFAULT_SORT: BaseFeeTypeOptionFilters = {
  orderBy: [{ table: "feeTypes", column: "name", order: "asc" }],
};

/**
 * Converts fee type filter options into a structured Drizzle query payload.
 * @param filters - Option filters to extract payloads from.
 * @returns Query payload object for data access helpers.
 */
export function extractFeeTypeFiltersQueryPayload(
  filters?: BaseFeeTypeOptionFilters,
) {
  return helpers.extractQueryPayload(_feeTypeJoinTables, filters);
}

/**
 * Repository providing operations for fee types and associated structures.
 */
export class FeeTypeRepository
  extends betterSqlite.BaseRepository<
    TableFeeType,
    TDataBase,
    FeeTypeDTO,
    BaseFeeTypeOptionFilters
  >
  implements OptionProvider<FeeTypeDTO>
{
  /**
   * Initializes the fee type repository with core configuration.
   * @param database - Optional database instance override.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: feeTypes,
      idColumn: feeTypes.feeTypeId,
      baseTableName: "feeTypes",
      logger: getLogger,
      defaultFilters: FEE_TYPE_OPTION_DEFAULT_SORT,
      joinTables: _feeTypeJoinTables,
    });
  }

  /**
   * Constructs a base dynamic query joining fee types with associated wallets.
   * @param tx - Optional transaction handle.
   * @returns Dynamic selection query builder.
   */
  protected getQuerySet(tx?: TDataBase | undefined) {
    return this.getClient(tx)
      .select({
        ...getTableColumns(this.table),
        wallet: getTableColumns(wallets),
      })
      .from(this.table)
      .leftJoin(wallets, eq(wallets.walletId, this.table.walletId))
      .$dynamic();
  }

  /**
   * Retrieves fee types enriched with nested schedules and wallet details.
   * @param filters - Query filters to apply during retrieval.
   * @returns List of fee types containing schedules and wallet associations.
   */
  getFeeTypeWithSchedules(filters?: BaseFeeTypeOptionFilters) {
    return this.getClient().query.feeTypes.findMany({
      ...extractFeeTypeFiltersQueryPayload(filters),
      with: {
        schedules: true,
        wallet: true,
      },
    });
  }

  /**
   * Fetches fee type options matching specified filters.
   * @param filters - Optional filters to filter fee types.
   * @returns List of FeeTypeDTO entities.
   */
  fetchOptions(filters?: BaseFeeTypeOptionFilters): FeeTypeDTO[] {
    return this.findMany(filters);
  }
}

export const feeTypeRepository = new FeeTypeRepository(db);

const _feeScheduleJoinTables = {
  feeSchedules,
} as const;

export type BaseFeeScheduleOptionFilters = helpers.FindManyOptions<
  typeof _feeScheduleJoinTables
>;

const FEE_SCHEDULE_OPTION_DEFAULT_SORT: BaseFeeScheduleOptionFilters = {
  orderBy: [{ table: "feeSchedules", column: "createdAt", order: "asc" }],
};

/**
 * Repository managing fee schedule records.
 */
export class FeeScheduleRepository
  extends betterSqlite.BaseRepository<
    TableFeeSchedule,
    TDataBase,
    FeeSchedule,
    BaseFeeScheduleOptionFilters
  >
  implements OptionProvider<FeeSchedule>
{
  /**
   * Initializes the fee schedule repository.
   * @param database - Optional database instance override.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: feeSchedules,
      idColumn: feeSchedules.scheduleId,
      baseTableName: "feeSchedules",
      logger: getLogger,
      defaultFilters: FEE_SCHEDULE_OPTION_DEFAULT_SORT,
      joinTables: _feeScheduleJoinTables,
    });
  }

  /**
   * Synchronously fetches fee schedule options for UI selection fields.
   * @param filters - Optional criteria to filter fee schedule records.
   * @returns List of fee schedule entities.
   */
  fetchOptions(filters?: BaseFeeScheduleOptionFilters): FeeSchedule[] {
    return this.findMany(filters);
  }
}

export const feeScheduleRepository = new FeeScheduleRepository(db);
