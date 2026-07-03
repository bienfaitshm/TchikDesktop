import { db } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  wallets,
  feeTypes,
  type TableWallet,
  type Wallet,
  type TableFeeType,
  type FeeType,
  type FindManyOptions,
} from "@/packages/@core/data-access/db/schemas";
import type {
  OptionProvider,
  SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import { BaseRepository, type DrizzleClient } from "@/packages/drizzle-queries";

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
}

/* =========================================================================
   2. FEE TYPE REPOSITORY (Le manquant)
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
