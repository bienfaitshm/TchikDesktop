import { db } from "@/packages/@core/data-access/db/config";
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
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import type {
  OptionProvider,
  SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import {
  BaseRepository,
  DatabaseError,
  type DrizzleClient,
} from "@/packages/drizzle-queries";
import { eq, sql } from "drizzle-orm";

/* =========================================================================
   1. WALLET REPOSITORY
   ========================================================================= */

export type WalletOptionFilters = Partial<FindManyOptions<TableWallet>>;

const WALLET_OPTION_DEFAULT_SORT: WalletOptionFilters = {
  orderBy: [{ column: "name", order: "asc" }],
};

export class WalletRepository
  extends BaseRepository<TableWallet, DrizzleClient>
  implements OptionProvider<Wallet>
{
  constructor(database: DrizzleClient = db) {
    super({
      db: database,
      table: wallets,
      idColumn: wallets.walletId,
      entityName: "Wallet",
      logger: getLogger,
      defaultSort: WALLET_OPTION_DEFAULT_SORT,
    });

    this.searchFiltersColumns = [wallets.name];
  }

  /**
   * Récupère les portefeuilles pour les composants Select / Combobox.
   */
  async fetchOptions(
    params: SearchOptions<WalletOptionFilters> = {},
  ): Promise<Wallet[]> {
    return this.findForSelect(params);
  }

  /**
   * Mettre à jour le solde d'un portefeuille (Incrémentation atomique sur la DB)
   */
  async incrementWalletBalance(
    walletId: string,
    amount: number,
    tx: DrizzleClient = this.db,
  ) {
    try {
      await this.getClient(tx)
        .update(wallets)
        .set({
          currentBalance: sql`${wallets.currentBalance} + ${amount}`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(wallets.walletId, walletId));
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

/* =========================================================================
   2. FEE TYPE REPOSITORY
   ========================================================================= */

export type FeeTypeOptionFilters = Partial<FindManyOptions<TableFeeType>>;

const FEE_TYPE_OPTION_DEFAULT_SORT: FeeTypeOptionFilters = {
  orderBy: [{ column: "name", order: "asc" }],
};

export class FeeTypeRepository
  extends BaseRepository<TableFeeType, DrizzleClient>
  implements OptionProvider<FeeType>
{
  constructor(database: DrizzleClient = db) {
    super({
      db: database,
      table: feeTypes,
      idColumn: feeTypes.feeTypeId,
      entityName: "FeeType",
      logger: getLogger,
      defaultSort: FEE_TYPE_OPTION_DEFAULT_SORT,
    });

    this.searchFiltersColumns = [feeTypes.name];
  }

  /**
   * Récupère les types de frais pour les composants Select / Combobox.
   */
  async fetchOptions(
    params: SearchOptions<FeeTypeOptionFilters> = {},
  ): Promise<FeeType[]> {
    return this.findForSelect(params);
  }
}

export const feeTypeRepository = new FeeTypeRepository(db);

/* =========================================================================
   3. FEE SCHEDULE REPOSITORY
   ========================================================================= */

export type FeeScheduleOptionFilters = Partial<
  FindManyOptions<TableFeeSchedule>
>;

const FEE_SCHEDULE_OPTION_DEFAULT_SORT: FeeScheduleOptionFilters = {
  orderBy: [{ column: "createdAt", order: "asc" }],
};

export class FeeScheduleRepository
  extends BaseRepository<TableFeeSchedule, DrizzleClient>
  implements OptionProvider<FeeSchedule>
{
  constructor(database: DrizzleClient = db) {
    super({
      db: database,
      table: feeSchedules,
      idColumn: feeSchedules.scheduleId,
      entityName: "FeeSchedule",
      logger: getLogger,
      defaultSort: FEE_SCHEDULE_OPTION_DEFAULT_SORT,
    });

    this.searchFiltersColumns = [feeSchedules.installmentName];
  }

  /**
   * Récupère les échéances de paiement pour les composants Select / Combobox.
   */
  async fetchOptions(
    params: SearchOptions<FeeScheduleOptionFilters> = {},
  ): Promise<FeeSchedule[]> {
    return this.findForSelect(params);
  }

  /**
   * Récupère toutes les échéances liées à un type de frais spécifique.
   */
  async findByFeeType(
    feeTypeId: string,
    tx: DrizzleClient = this.db,
  ): Promise<FeeSchedule[]> {
    try {
      return await this.getClient(tx)
        .select()
        .from(feeSchedules)
        .where(eq(feeSchedules.feeTypeId, feeTypeId))
        .execute();
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to fetch schedules for fee type ID: ${feeTypeId}`,
      );
      this.logError("findByFeeType", dbError, { feeTypeId });
      throw dbError;
    }
  }
}

export const feeScheduleRepository = new FeeScheduleRepository(db);
