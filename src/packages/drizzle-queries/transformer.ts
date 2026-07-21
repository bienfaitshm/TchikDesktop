import { CustomLogger } from "@/packages/logger";
import { FindManyOptions } from "./helpers";
import type { Table } from "drizzle-orm";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  description?: string;
}

export interface SearchOptions extends FindManyOptions<Record<string, Table>> {}

export type LabelFormatterStrategy = "short" | "long" | "combined";

export type LabelExtractor<T> = keyof T | ((item: T) => string);

/**
 * Data transformation configuration mapping domain objects to UI SelectOption format.
 */
export interface DataToOptionConfig<T, R extends SelectOption = SelectOption> {
  valueKey: keyof T;
  labelKeyLong: LabelExtractor<T>;
  labelKeyShort: LabelExtractor<T>;
  labelFormat?: LabelFormatterStrategy;
  transform?: (baseOption: SelectOption, originalItem: T) => R;
}

/**
 * Interface for components or repositories capable of providing option items.
 */
export interface OptionProvider<T, SearchOptions = unknown> {
  fetchOptions(args?: SearchOptions): Promise<T[]> | T[];
}

/**
 * Pure, stateless transformer utility for converting domain objects to UI select options.
 */
export class SelectOptionTransformer {
  private static readonly DEFAULT_FORMAT: LabelFormatterStrategy = "combined";

  /**
   * Transforms an array of domain objects into an array of SelectOptions.
   * @param data - Array of items to convert.
   * @param config - Transformation rules and keys configuration.
   * @returns Array of transformed SelectOption items.
   */
  public static transformMany<T, R extends SelectOption = SelectOption>(
    data: T[],
    config: DataToOptionConfig<T, R>,
  ): R[] {
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((item) => this.transformSingle(item, config));
  }

  /**
   * Transforms a single domain object into a SelectOption item.
   * @param item - Domain object to convert.
   * @param config - Transformation rules and keys configuration.
   * @returns Transformed SelectOption item.
   */
  public static transformSingle<T, R extends SelectOption = SelectOption>(
    item: T,
    config: DataToOptionConfig<T, R>,
  ): R {
    const {
      valueKey,
      labelKeyLong,
      labelKeyShort,
      labelFormat = this.DEFAULT_FORMAT,
      transform,
    } = config;

    const longLabel = this.resolveLabelValue(item, labelKeyLong);
    const shortLabel = this.resolveLabelValue(item, labelKeyShort);
    const value = String(item[valueKey] ?? "");

    const label = this.formatLabel(longLabel, shortLabel, labelFormat);
    const baseOption: SelectOption = { value, label };

    if (transform) {
      return transform(baseOption, item);
    }

    return baseOption as R;
  }

  /**
   * Resolves the label string value using a property key or an extractor function.
   * @param item - Target object instance.
   * @param extractor - Property key or extraction function.
   * @returns Extracted string value.
   */
  private static resolveLabelValue<T>(
    item: T,
    extractor: LabelExtractor<T>,
  ): string {
    if (typeof extractor === "function") {
      return String(extractor(item) ?? "").trim();
    }
    return String(item[extractor] ?? "").trim();
  }

  /**
   * Formats long and short label representations based on the chosen strategy.
   * @param long - Long label text.
   * @param short - Short label text.
   * @param format - Label formatting strategy.
   * @returns Formatted label string.
   */
  private static formatLabel(
    long: string,
    short: string,
    format: LabelFormatterStrategy,
  ): string {
    switch (format) {
      case "long":
        return long || short || "N/A";
      case "short":
        return short || long || "N/A";
      case "combined":
      default:
        if (long && short) return `${long} (${short})`;
        return long || short || "N/A";
    }
  }
}

/**
 * Coordination facade that manages option loading, error logging, and transformation.
 */
export class SelectOptionFacade<T, R extends SelectOption = SelectOption> {
  /**
   * Initializes a new instance of SelectOptionFacade.
   * @param provider - Option provider supplying raw records.
   * @param config - Transformation configuration rules.
   * @param logger - Optional custom logger instance.
   */
  constructor(
    private readonly provider: OptionProvider<T>,
    private readonly config: DataToOptionConfig<T, R>,
    private readonly logger?: CustomLogger,
  ) {}

  /**
   * Loads options from the provider and transforms them safely into SelectOption objects.
   * @param args - Search options and query filters.
   * @returns Promise resolving to an array of SelectOption objects.
   */
  public async loadOptions(args: SearchOptions = {}): Promise<R[]> {
    try {
      const rawData = await this.provider.fetchOptions(args);
      return SelectOptionTransformer.transformMany(rawData, this.config);
    } catch (error) {
      if (this.logger?.error) {
        this.logger.error("Failed to load select options:", error);
      } else {
        console.error(
          "[SelectOptionFacade] Failed to load select options:",
          error,
        );
      }
      return [];
    }
  }
}
