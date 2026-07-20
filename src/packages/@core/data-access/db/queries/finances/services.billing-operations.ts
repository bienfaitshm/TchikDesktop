import { CURRENCY_ENUM } from "@/packages/@core/data-access/db/options";
import type { TDataBase } from "@/packages/@core/data-access/db/config";
import {
  DailyExchangeRateRepository,
  DailyExchangeRateFilters,
  dailyExchangeRateRepository,
} from "@/packages/@core/data-access/db/queries/finances";

import { SelectOptionFacade } from "@/packages/@core/data-access/db/queries/select-option.transformer";
import type { FeeConfiguration } from "@/packages/@core/data-access/db/schemas";
import {
  FeeConfigurationRepository,
  feeConfigurationRepository,
  type FeeConfigurationFilters,
} from "./repository";

/**
 * Service managing fee configuration options for UI components.
 */
export class FeeConfigurationService {
  public readonly selectOptions: SelectOptionFacade<FeeConfiguration>;

  /**
   * Initializes a new instance of FeeConfigurationService with injected repository.
   * @param feeConfigRepo - Repository for accessing fee configuration data.
   */
  constructor(
    private readonly feeConfigRepo: FeeConfigurationRepository = feeConfigurationRepository,
  ) {
    this.selectOptions = new SelectOptionFacade<FeeConfiguration>(
      this.feeConfigRepo,
      {
        valueKey: "feeConfigId",
        labelKeyLong: "name",
        labelKeyShort: "name",
        labelFormat: "long",
      },
    );
  }

  /**
   * Retrieves formatted select options for fee configurations according to filters.
   * @param filters - Filter conditions to scope fee configurations.
   * @returns List of formatted select options.
   */
  getOptions(filters?: FeeConfigurationFilters) {
    return this.selectOptions.loadOptions(filters);
  }
}

export const feeConfigurationService = new FeeConfigurationService();

export interface ExchangeRateResult {
  amountConverted: number;
  exchangeRateMultiplied: number;
}

/**
 * Service handling currency conversion operations and rate calculations.
 */
export class DailyExchangeRateService {
  /**
   * Initializes a new instance of DailyExchangeRateService.
   * @param dailyExchangeRateRepo - Repository for accessing exchange rate data.
   */
  constructor(
    private readonly dailyExchangeRateRepo: DailyExchangeRateRepository,
  ) {}

  /**
   * Converts an amount from one currency to another using the latest exchange rate.
   * @param amount - The numeric value to be converted.
   * @param currencyFrom - The source currency enum.
   * @param currencyTo - The target currency enum.
   * @param schoolId - Unique identifier of the school context.
   * @param tx - Optional database transaction instance.
   * @returns An object containing the converted amount and the effective rate applied.
   */
  computeExchangeRate(
    amount: number,
    currencyFrom: CURRENCY_ENUM,
    currencyTo: CURRENCY_ENUM,
    schoolId: string,
    tx?: TDataBase,
  ): ExchangeRateResult {
    if (currencyFrom === currencyTo) {
      return {
        amountConverted: amount,
        exchangeRateMultiplied: 1,
      };
    }

    const filters: DailyExchangeRateFilters = {
      where: { dailyExchangeRates: { schoolId: { $eq: schoolId } } },
      or: [
        {
          dailyExchangeRates: {
            currencyTo: { $eq: currencyTo },
            currencyFrom: { $eq: currencyFrom },
          },
        },
        {
          dailyExchangeRates: {
            currencyTo: { $eq: currencyFrom },
            currencyFrom: { $eq: currencyTo },
          },
        },
      ],
    };

    const dailyExchange = this.dailyExchangeRateRepo.getLatestExchangeRate(
      filters,
      tx,
    );

    if (!dailyExchange || !dailyExchange.rate || dailyExchange.rate <= 0) {
      return {
        amountConverted: amount,
        exchangeRateMultiplied: 1,
      };
    }

    if (
      dailyExchange.currencyFrom === currencyFrom &&
      dailyExchange.currencyTo === currencyTo
    ) {
      return {
        amountConverted: amount * dailyExchange.rate,
        exchangeRateMultiplied: dailyExchange.rate,
      };
    }

    const effectiveRate = 1 / dailyExchange.rate;
    return {
      amountConverted: amount * effectiveRate,
      exchangeRateMultiplied: effectiveRate,
    };
  }
}

export const dailyExchangeRateService = new DailyExchangeRateService(
  dailyExchangeRateRepository,
);
