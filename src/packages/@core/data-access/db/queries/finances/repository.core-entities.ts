import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  wallets,
  feeTypes,
  feeSchedules,
  type TableWallet,
  type Wallet,
  type TableFeeType,
  type FeeType,
  type TableFeeSchedule,
  type FeeSchedule,
} from "@/packages/@core/data-access/db/schemas";

import {
  DatabaseError,
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";
import { eq, getTableColumns, sql } from "drizzle-orm";

const _walletJoinTables = {
  wallets,
} as const;

export type BaseWalletOptionFilters = helpers.FindManyOptions<
  typeof _walletJoinTables
>;

const WALLET_OPTION_DEFAULT_SORT: BaseWalletOptionFilters = {
  orderBy: [{ table: "wallets", column: "name", order: "asc" }],
};

/**
 * Repository providing access to wallet records in SQLite.
 */
export class WalletRepository
  extends betterSqlite.BaseRepository<
    TableWallet,
    TDataBase,
    Wallet,
    BaseWalletOptionFilters
  >
  implements OptionProvider<Wallet>
{
  /**
   * Initializes the wallet repository with default table configurations and default filters.
   * @param database - Optional database instance override, defaulting to core db connection.
   */
  constructor(database: TDataBase = db) {
    super({
      db: database,
      table: wallets,
      idColumn: wallets.walletId,
      baseTableName: "wallets",
      logger: getLogger,
      defaultFilters: WALLET_OPTION_DEFAULT_SORT,
      joinTables: _walletJoinTables,
    });
  }

  /**
   * Fetches wallet options matching the given filter criteria.
   * @param filters - Optional filters to restrict and sort the retrieved records.
   * @returns Array of wallet entities.
   */
  fetchOptions(filters?: BaseWalletOptionFilters): Wallet[] {
    return this.findMany(filters);
  }

  /**
   * Atomically updates a wallet balance in the database.
   * @param walletId - Unique identifier of the target wallet.
   * @param amount - Numerical amount to increase or decrease.
   * @param type - Adjustment direction, either "INCREASE" or "DECREASE".
   * @param tx - Optional transaction handle for atomic execution.
   */
  updateWalletBalance(
    walletId: string,
    amount: number,
    type: "INCREASE" | "DECREASE" = "INCREASE",
    tx: TDataBase = this.db,
  ): void {
    try {
      const balanceExpression =
        type === "INCREASE"
          ? sql`${this.table.currentBalance} + ${amount}`
          : sql`${this.table.currentBalance} - ${amount}`;

      this.getClient(tx)
        .update(this.table)
        .set({
          currentBalance: balanceExpression,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(this.table.walletId, walletId))
        .run();
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to update balance for wallet ID: ${walletId}`,
      );
      this.logError("updateWalletBalance", dbError, { walletId, amount, type });
      throw dbError;
    }
  }
}

export const walletRepository = new WalletRepository(db);

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
