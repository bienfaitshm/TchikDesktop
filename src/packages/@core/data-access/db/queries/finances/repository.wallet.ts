import { db, TDataBase } from "@/packages/@core/data-access/db/config";
import { getLogger } from "@/packages/logger";
import {
  wallets,
  feeTypes,
  feeConfigurations,
  feeAssignments,
  studentPayments,
  type TableWallet,
  type Wallet,
} from "@/packages/@core/data-access/db/schemas";
import { PAYMENT_STATUS_ENUM } from "../../options";

import {
  DatabaseError,
  helpers,
  betterSqlite,
  OptionProvider,
} from "@/packages/drizzle-queries";
import { eq, and, sql } from "drizzle-orm";

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
   * @param database - Database instance override, defaulting to core db connection.
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
   * @param filters - Filters to restrict and sort the retrieved records.
   * @returns Array of wallet entities.
   */
  fetchOptions(filters?: BaseWalletOptionFilters): Wallet[] {
    return this.findMany(filters);
  }

  /**
   * Builds the subquery to calculate the sum of validated payments linked to a wallet.
   * @param client - Database client instance to execute the query against.
   * @param walletId - Unique identifier of the target wallet.
   * @returns The constructed SQL subquery.
   */
  private createBalanceSubquery(client: TDataBase, walletId: string) {
    return client
      .select({
        total: sql<number>`coalesce(sum(${studentPayments.amountConverted}), 0)`,
      })
      .from(studentPayments)
      .innerJoin(
        feeAssignments,
        eq(studentPayments.assignmentId, feeAssignments.assignmentId),
      )
      .innerJoin(
        feeConfigurations,
        eq(feeAssignments.feeConfigId, feeConfigurations.feeConfigId),
      )
      .innerJoin(feeTypes, eq(feeConfigurations.feeTypeId, feeTypes.feeTypeId))
      .where(
        and(
          eq(feeTypes.walletId, walletId),
          eq(studentPayments.status, PAYMENT_STATUS_ENUM.VALIDATED),
        ),
      );
  }

  /**
   * Updates the wallet balance based on a subquery calculating the sum of valid student payments.
   * @param walletId - Unique identifier of the target wallet.
   * @param tx - Optional transaction instance for atomic execution.
   */
  updateWalletBalance(walletId: string, tx: TDataBase = this.db): void {
    try {
      const client = this.getClient(tx);
      const balanceSubquery = this.createBalanceSubquery(client, walletId);

      client
        .update(this.table)
        .set({
          currency: sql<number>`(${balanceSubquery})`,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        })
        .where(eq(this.table.walletId, walletId))
        .run();
    } catch (error) {
      const dbError = DatabaseError.from(
        error,
        `Failed to update balance for wallet ID: ${walletId}`,
      );
      this.logError("updateWalletBalance", dbError, { walletId });
      throw dbError;
    }
  }
}

export const walletRepository = new WalletRepository(db);
