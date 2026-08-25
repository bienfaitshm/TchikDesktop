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

export class WalletRepository
  extends betterSqlite.BaseRepository<
    TableWallet,
    TDataBase,
    Wallet,
    BaseWalletOptionFilters
  >
  implements OptionProvider<Wallet>
{
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

  fetchOptions(filters?: BaseWalletOptionFilters) {
    return this.findMany(filters);
  }

  /**
   * Mettre à jour le solde d'un portefeuille (Incrémentation atomique sur la DB)
   * Synchrone.
   */
  incrementWalletBalance(
    walletId: string,
    amount: number,
    tx: TDataBase = this.db,
  ) {
    try {
      this.getClient(tx)
        .update(this.table)
        .set({
          currentBalance: sql`${this.table.currentBalance} + ${Number(amount)}`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(this.table.walletId, walletId))
        .run();
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to increment balance for wallet ID: ${walletId}`,
      );
      this.logError("incrementWalletBalance", dbError, { walletId, amount });
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

export function extractFeeTypeFiltersQueryPayload(
  filters?: BaseFeeTypeOptionFilters,
) {
  return helpers.extractQueryPayload(_feeTypeJoinTables, filters);
}

export class FeeTypeRepository
  extends betterSqlite.BaseRepository<
    TableFeeType,
    TDataBase,
    FeeTypeDTO,
    BaseFeeTypeOptionFilters
  >
  implements OptionProvider<FeeTypeDTO>
{
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
   * Récupère les types de frais pour les composants Select / Combobox.
   * Synchrone.
   */
  fetchOptions(filters?: BaseFeeTypeOptionFilters) {
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

export class FeeScheduleRepository
  extends betterSqlite.BaseRepository<
    TableFeeSchedule,
    TDataBase,
    FeeSchedule,
    BaseFeeScheduleOptionFilters
  >
  implements OptionProvider<FeeSchedule>
{
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
   * Récupère les échéances de paiement pour les composants Select / Combobox.
   * Synchrone.
   */
  async fetchOptions(filters?: BaseFeeScheduleOptionFilters) {
    return this.findMany(filters);
  }
}

export const feeScheduleRepository = new FeeScheduleRepository(db);
