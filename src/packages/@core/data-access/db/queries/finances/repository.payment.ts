import { db } from "@/packages/@core/data-access/db/config";
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
} from "@/packages/@core/data-access/db/schemas";
import type {
  OptionProvider,
  SearchOptions,
} from "@/packages/@core/data-access/db/queries/select-option.transformer";
import { BaseRepository, type DrizzleClient } from "@/packages/drizzle-queries";

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
  extends BaseRepository<TableFeeConfiguration, DrizzleClient>
  implements OptionProvider<FeeConfiguration>
{
  constructor(database: DrizzleClient = db) {
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

  /**
   * Permet de lister les configurations de frais disponibles pour un Select/Combobox.
   */
  async fetchOptions(
    params: SearchOptions<FeeConfigurationFilters> = {},
  ): Promise<FeeConfiguration[]> {
    return this.findForSelect(params);
  }
}

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
}

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

    /** Permet de chercher un taux par sa chaîne de date ISO (ex: "2026-03-01") */
    this.searchFiltersColumns = [dailyExchangeRates.date];
  }
}
