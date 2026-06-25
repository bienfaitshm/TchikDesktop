import { CustomLogger } from "@/packages/logger";

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
  description?: string;
}

export interface SearchOptions<TFields extends Record<string, unknown> = {}> {
  search?: string;
  filters?: TFields;
}

export type LabelFormatterStrategy = "short" | "long" | "combined";

/**
 * Configuration purement axée sur la donnée et son formatage (Pure Domain/UI).
 */
export interface DataToOptionConfig<T, R extends SelectOption = SelectOption> {
  valueKey: keyof T;
  labelKeyLong: keyof T;
  labelKeyShort: keyof T;
  labelFormat?: LabelFormatterStrategy;
  transform?: (baseOption: SelectOption, originalItem: T) => R;
}

export interface OptionProvider<T> {
  fetchOptions(args: SearchOptions): Promise<T[]>;
}

/**
 * Service utilitaire purement fonctionnel et stateless (SRP).
 */
export class SelectOptionTransformer {
  private static readonly DEFAULT_FORMAT: LabelFormatterStrategy = "combined";

  public static transformMany<T, R extends SelectOption = SelectOption>(
    data: T[],
    config: DataToOptionConfig<T, R>,
  ): R[] {
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((item) => this.transformSingle(item, config));
  }

  public static transformSingle<T, R extends SelectOption = SelectOption>(
    item: T,
    config: DataToOptionConfig<T, R>,
  ): R {
    const {
      valueKey,
      labelKeyLong,
      labelKeyShort,
      labelFormat = this.DEFAULT_FORMAT,
      transform = (option, item) => ({ ...option, ...item }),
    } = config;

    const longLabel = String(item[labelKeyLong] ?? "").trim();
    const shortLabel = String(item[labelKeyShort] ?? "").trim();
    const value = String(item[valueKey] ?? "");

    const label = this.formatLabel(longLabel, shortLabel, labelFormat);
    const baseOption: SelectOption = { value, label };

    return transform ? (transform(baseOption, item) as R) : (baseOption as R);
  }

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
 * Façade de coordination.
 * Le logger est injecté ici, car la gestion des erreurs d'infrastructure est de sa responsabilité.
 */
export class SelectOptionFacade<T, R extends SelectOption = SelectOption> {
  constructor(
    private readonly provider: OptionProvider<T>,
    private readonly config: DataToOptionConfig<T, R>,
    private readonly logger?: CustomLogger,
  ) {}

  /**
   * Récupère et transforme les options de manière sécurisée.
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
