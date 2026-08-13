import { CustomLogger } from "@/packages/logger";

/**
 * Standard option structure for user interface selection components.
 */
export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  description?: string;
}

/**
 * Criteria for filtering and searching options.
 */
export interface SearchOptions<
  TFields extends Record<string, unknown> = Record<string, unknown>,
> {
  search?: string;
  filters?: TFields;
}

/**
 * Strategy names for formatting display labels.
 */
export type LabelFormatterStrategy = "short" | "long" | "combined";

/**
 * Recursive type path builder supporting dot notation for nested properties.
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
 * Configuration mapping domain model keys to select option fields.
 */
export interface DataToOptionConfig<T, R extends SelectOption = SelectOption> {
  valueKey: PropertyPath<T>;
  labelKeyLong: PropertyPath<T>;
  labelKeyShort: PropertyPath<T>;
  labelFormat?: LabelFormatterStrategy;
  transform?: (baseOption: SelectOption, originalItem: T) => R;
}

/**
 * Data fetcher interface supplying raw items for option generation.
 */
export interface OptionProvider<T> {
  fetchOptions<TFields = unknown>(args?: TFields): Promise<T[]> | T[];
}

/**
 * Safely retrieves a nested property value using a dot-separated string path.
 * @param obj - Target object to evaluate.
 * @param path - Dot-separated property path (e.g. "user.firstName").
 * @returns Resolved property value or undefined if unreachable.
 */
export function getNestedValue<T>(obj: T, path: string): unknown {
  if (!obj || typeof obj !== "object") {
    return undefined;
  }

  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (
      current &&
      typeof current === "object" &&
      key in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Stateless utility transformer converting domain items into select options.
 */
export class SelectOptionTransformer {
  private static readonly DEFAULT_FORMAT: LabelFormatterStrategy = "combined";

  /**
   * Transforms an array of domain items into structured select options.
   * @param data - Array of domain items to convert.
   * @param config - Field mapping and formatting rules.
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
   * Transforms a single domain item into a structured select option.
   * @param item - Domain item to convert.
   * @param config - Field mapping and formatting rules.
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

    const longRaw = getNestedValue(item, valueKey ? String(labelKeyLong) : "");
    const shortRaw = getNestedValue(
      item,
      valueKey ? String(labelKeyShort) : "",
    );
    const valueRaw = getNestedValue(item, valueKey ? String(valueKey) : "");

    const longLabel = String(longRaw ?? "").trim();
    const shortLabel = String(shortRaw ?? "").trim();
    const value = String(valueRaw ?? "");

    const label = this.formatLabel(longLabel, shortLabel, labelFormat);
    const baseOption: SelectOption = { value, label };

    return transform ? transform(baseOption, item) : (baseOption as R);
  }

  /**
   * Formats long and short labels into a single display string based on strategy.
   * @param long - Primary descriptive label.
   * @param short - Secondary compact label.
   * @param format - Desired formatting strategy.
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
 * Orchestrating facade combining option provider fetching and transformation with error handling.
 */
export class SelectOptionFacade<T, R extends SelectOption = SelectOption> {
  /**
   * Initializes the option facade instance.
   * @param provider - Source data provider implementation.
   * @param config - Field mapping and formatting configuration.
   * @param logger - Optional logging service instance.
   */
  constructor(
    private readonly provider: OptionProvider<T>,
    private readonly config: DataToOptionConfig<T, R>,
    private readonly logger?: CustomLogger,
  ) {}

  /**
   * Fetches raw options from provider and converts them to formatted select options safely.
   * @param args - Arguments passed down to data provider fetch operation.
   * @returns Resolved array of UI select options or empty array on failure.
   */
  public async loadOptions<TFields>(args?: TFields): Promise<R[]> {
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
