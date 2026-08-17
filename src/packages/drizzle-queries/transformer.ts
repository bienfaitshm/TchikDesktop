import { CustomLogger } from "@/packages/logger";
import { FindManyOptions } from "./helpers";
import type { Table } from "drizzle-orm";

/**
 * Standardized structure representing a UI select option item.
 */
export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  description?: string;
}

/**
 * Options used to search, filter, and paginate database query results.
 */
export interface SearchOptions extends FindManyOptions<Record<string, Table>> {}

/**
 * Strategy names controlling how long and short labels are combined.
 */
export type LabelFormatterStrategy = "short" | "long" | "combined";

/**
 * Recursive type builder supporting dot-notation paths for nested object properties.
 */
export type PropertyPath<T> =
  T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: T[K] extends Record<string, unknown>
          ? K | `${K}.${PropertyPath<T[K]>}`
          : K;
      }[keyof T & string]
    : string;

/**
 * Flexible property extractor supporting direct keys, dot-notation paths, or custom functions.
 */
export type ValueExtractor<T> = PropertyPath<T> | ((item: T) => unknown);

/**
 * Configuration mapping domain model fields or functions to select option attributes.
 */
export interface DataToOptionConfig<T, R extends SelectOption = SelectOption> {
  valueKey: ValueExtractor<T>;
  labelKeyLong: ValueExtractor<T>;
  labelKeyShort: ValueExtractor<T>;
  labelFormat?: LabelFormatterStrategy;
  transform?: (baseOption: SelectOption, originalItem: T) => R;
}

/**
 * Contract for data providers supplying domain items for selection lists.
 */
export interface OptionProvider<T, TSearch = SearchOptions> {
  fetchOptions(args?: TSearch): Promise<T[]> | T[];
}

/**
 * Stateless transformer utility converting domain objects to UI select options.
 */
export class SelectOptionTransformer {
  private static readonly DEFAULT_FORMAT: LabelFormatterStrategy = "combined";

  /**
   * Transforms an array of domain objects into an array of SelectOptions.
   * @param data - Array of domain items to convert.
   * @param config - Mapping and formatting configuration rules.
   * @returns Array of formatted select option objects.
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
   * Transforms a single domain object into a formatted SelectOption.
   * @param item - Target domain item.
   * @param config - Mapping and formatting configuration rules.
   * @returns Formatted select option object.
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

    const value = this.resolveValue(item, valueKey);
    const longLabel = this.resolveValue(item, labelKeyLong);
    const shortLabel = this.resolveValue(item, labelKeyShort);

    const label = this.formatLabel(longLabel, shortLabel, labelFormat);
    const baseOption: SelectOption = { value, label };

    if (transform) {
      return transform(baseOption, item);
    }

    return baseOption as R;
  }

  /**
   * Safely resolves a string value from an item using a key, dot-notation path, or extractor function.
   * @param item - Target domain item instance.
   * @param extractor - Field path string, property key, or extraction function.
   * @returns Trimmed string representation of the resolved value.
   */
  public static resolveValue<T>(item: T, extractor: ValueExtractor<T>): string {
    if (typeof extractor === "function") {
      const result = extractor(item);
      return result !== null && result !== undefined
        ? String(result).trim()
        : "";
    }

    if (!item || typeof item !== "object") {
      return "";
    }

    const path = String(extractor);
    const keys = path.split(".");
    let current: unknown = item;

    for (const key of keys) {
      if (
        current !== null &&
        typeof current === "object" &&
        key in (current as Record<string, unknown>)
      ) {
        current = (current as Record<string, unknown>)[key];
      } else {
        return "";
      }
    }

    return current !== null && current !== undefined
      ? String(current).trim()
      : "";
  }

  /**
   * Formats long and short text options into a single string based on chosen strategy.
   * @param long - Primary long text label.
   * @param short - Secondary short text label.
   * @param format - Desired label formatting strategy.
   * @returns Formatted output label.
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
 * Coordination facade managing option fetching, error logging, and data transformation.
 */
export class SelectOptionFacade<
  T,
  R extends SelectOption = SelectOption,
  TSearch = SearchOptions,
> {
  /**
   * Initializes a new instance of SelectOptionFacade.
   * @param provider - Option provider implementation.
   * @param config - Transformation and mapping rules.
   * @param logger - Optional custom logging service.
   */
  constructor(
    private readonly provider: OptionProvider<T, TSearch>,
    private readonly config: DataToOptionConfig<T, R>,
    private readonly logger?: CustomLogger,
  ) {}

  /**
   * Loads raw records from provider and safely converts them into SelectOption objects.
   * @param args - Search options and query filters.
   * @returns Promise resolving to an array of formatted select options.
   */
  public async loadOptions(args?: TSearch): Promise<R[]> {
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
