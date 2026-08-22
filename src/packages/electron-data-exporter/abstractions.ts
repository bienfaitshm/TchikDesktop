import type { FileFilter, SaveDialogOptions } from "electron";
import type { ZodObject, ZodError, ZodTypeAny } from "zod";
import {
  DOCUMENT_EXTENSION,
  getFileDescription,
} from "@/packages/file-extension";
import { formatDate } from "@/packages/times";
import type { RawFileContent, ServiceResult, ContextParams } from "./types";

/**
 * Metadata contract required by the UI to render export dialogs and dynamic forms.
 */
export interface TMeta<TFormField = unknown> {
  title: string;
  category: string;
  description: string;
  extensions: FileFilter[];
  fields?: readonly TFormField[];
}

/**
 * Extension contract for format-specific renderers (Bridge Pattern).
 */
export interface IExportExtension<TData = unknown> {
  readonly extension: DOCUMENT_EXTENSION;
  readonly description?: string;
  getExtensionFilter(): FileFilter;
  process(data: TData): Promise<RawFileContent>;
}

/**
 * Abstract base class providing common behavior for format-specific exporters.
 */
export abstract class AbstractExportExtension<
  TData = unknown,
> implements IExportExtension<TData> {
  public abstract readonly extension: DOCUMENT_EXTENSION;
  public abstract readonly description?: string;

  /**
   * Generates Electron FileFilter metadata for desktop file dialogs.
   * @returns Formatted FileFilter object.
   */
  public getExtensionFilter(): FileFilter {
    return {
      name: getFileDescription(this.extension),
      extensions: [this.extension],
    };
  }

  /**
   * Transforms domain data into raw file payload.
   * @param data - Resolved domain data.
   * @returns Raw string or binary content wrapped in a promise.
   */
  public abstract process(data: TData): Promise<RawFileContent>;
}

/**
 * Contract defining domain-specific export strategies (Strategy Pattern).
 */
export interface IExportStrategy<
  TFormField = unknown,
  TPayload = unknown,
  TData = unknown,
> {
  readonly id: string;
  getFormFields<TParams extends ContextParams>(
    params?: TParams,
  ): Promise<readonly TFormField[]>;
  getMeta<TParams extends ContextParams>(
    params?: TParams,
  ): Promise<TMeta<TFormField>>;
  validateContext(params: unknown): ServiceResult<TPayload>;
  getSaveOptions(targetExtension?: DOCUMENT_EXTENSION): SaveDialogOptions;
  resolveData(payload: TPayload): Promise<TData>;
  handleResolveData(payload: TPayload): Promise<ServiceResult<TData>>;
  buildArtifact(
    targetExtension: DOCUMENT_EXTENSION,
    data: TData,
  ): Promise<ServiceResult<RawFileContent>>;
}

/**
 * Contract for data resolving logic attached to an export strategy.
 */
export interface ResolverData<TPayload, TData> {
  resolveData(payload: TPayload): Promise<TData>;
}

/**
 * Configuration payload supplied to strategy constructors.
 */
export interface ExportStrategyConfig<TFormField, TPayload, TData> {
  extensions: IExportExtension<TData>[];
  schemaCreator?: (
    fields: TFormField[],
  ) => ZodObject<Record<string, ZodTypeAny>>;
  extendWithFileTypeFormFields?: <TParams extends ContextParams>(
    params?: TParams,
  ) => Promise<readonly TFormField[]>;
  resolver: ResolverData<TPayload, TData>;
}

/**
 * Formats validation error issues into a single descriptive string.
 * @param error - Zod validation error object.
 * @returns Formatted error string.
 */
function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
}

/**
 * Sanitizes strings for safe file system usage.
 * @param name - Raw filename input.
 * @returns Sanitized string free of invalid path characters.
 */
function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, "_").trim();
}

/**
 * Core orchestrator managing export validation, metadata fetching, and engine dispatch.
 */
export abstract class AbstractExportStrategy<
  TFormField = unknown,
  TPayload = unknown,
  TData = unknown,
> implements IExportStrategy<TFormField, TPayload, TData> {
  public abstract readonly id: string;
  public abstract readonly category: string;
  public abstract readonly displayName: string;
  public abstract readonly description: string;

  protected abstract readonly validationSchema: ZodObject<
    Record<string, ZodTypeAny>
  >;
  protected formFields: TFormField[] = [];

  private readonly extensionsRegistry = new Map<
    DOCUMENT_EXTENSION,
    IExportExtension<TData>
  >();
  protected resolver: ResolverData<TPayload, TData>;
  private readonly schemaCreator?: (
    fields: TFormField[],
  ) => ZodObject<Record<string, ZodTypeAny>>;
  protected extendWithFileTypeFormFields?: <TParams extends ContextParams>(
    params?: TParams,
  ) => Promise<readonly TFormField[]>;

  constructor(config: ExportStrategyConfig<TFormField, TPayload, TData>) {
    this.schemaCreator = config.schemaCreator;
    this.resolver = config.resolver;
    this.extendWithFileTypeFormFields = config.extendWithFileTypeFormFields;

    for (const ext of config.extensions) {
      this.extensionsRegistry.set(ext.extension, ext);
    }
  }

  /**
   * Retrieves user interface metadata for dialogs and dynamic forms.
   * @param params - Optional context parameters.
   * @returns Aggregated metadata payload.
   */
  public async getMeta<TParams extends ContextParams>(
    params?: TParams,
  ): Promise<TMeta<TFormField>> {
    return {
      title: this.displayName,
      category: this.category,
      description: this.description,
      extensions: this.extensionFilters,
      fields: await this.getFormFields(params),
    };
  }

  /**
   * Gets all file filter descriptors registered to this strategy.
   */
  public get extensionFilters(): FileFilter[] {
    return Array.from(this.extensionsRegistry.values()).map((engine) =>
      engine.getExtensionFilter(),
    );
  }

  /**
   * Fetches domain data using the configured resolver implementation.
   * @param payload - Validated input parameters.
   * @returns Unwrapped domain data.
   */
  public async resolveData(payload: TPayload): Promise<TData> {
    return this.resolver.resolveData(payload);
  }

  /**
   * Safely wraps domain data fetching inside a ServiceResult container.
   * @param payload - Validated input parameters.
   * @returns Result wrapper containing resolved data or structured error.
   */
  public async handleResolveData(
    payload: TPayload,
  ): Promise<ServiceResult<TData>> {
    try {
      const data = await this.resolveData(payload);
      return { success: true, data };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return {
        success: false,
        error: {
          code: "DATA_FETCH_ERROR",
          message,
          details: message,
        },
      };
    }
  }

  /**
   * Retrieves form field definitions required for user inputs.
   * @param params - Optional contextual parameters.
   * @returns Array of form field definitions.
   */
  public async getFormFields<TParams extends ContextParams>(
    params?: TParams,
  ): Promise<readonly TFormField[]> {
    if (this.extendWithFileTypeFormFields) {
      return this.extendWithFileTypeFormFields({
        fileTypeFilters: this.extensionFilters,
        ...params,
      });
    }
    return this.formFields;
  }

  /**
   * Merges static base validation schema with dynamic form field schemas.
   * @returns Combined Zod schema.
   */
  protected getSchemas(): ZodObject<Record<string, ZodTypeAny>> {
    const extraSchema = this.schemaCreator?.(this.formFields);
    return extraSchema
      ? this.validationSchema.extend(extraSchema.shape)
      : this.validationSchema;
  }

  /**
   * Validates execution payload against combined Zod schemas.
   * @param params - Unvalidated input payload.
   * @returns Result wrapper with validated payload or validation error details.
   */
  public validateContext(params: unknown): ServiceResult<TPayload> {
    const result = this.getSchemas().safeParse(params);
    if (!result.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid export parameters",
          details: formatZodError(result.error),
        },
      };
    }
    return { success: true, data: result.data as TPayload };
  }

  /**
   * Delegates file generation to the extension matching the target format.
   * @param targetExtension - Desired file extension.
   * @param data - Domain data payload.
   * @returns Generated file content or generation error details.
   */
  public async buildArtifact(
    targetExtension: DOCUMENT_EXTENSION,
    data: TData,
  ): Promise<ServiceResult<RawFileContent>> {
    const engine = this.extensionsRegistry.get(targetExtension);

    if (!engine) {
      return {
        success: false,
        error: {
          code: "GENERATION_ERROR",
          message: `The format "${targetExtension}" is not supported for this export.`,
        },
      };
    }

    try {
      const content = await engine.process(data);
      return { success: true, data: content };
    } catch (error) {
      const details = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: {
          code: "GENERATION_ERROR",
          message: "An error occurred while building the document artifact.",
          details,
        },
      };
    }
  }

  /**
   * Constructs desktop Save Dialog configuration options for Electron.
   * @param targetExtension - Optional target document format filter.
   * @returns Electron SaveDialogOptions object.
   */
  public getSaveOptions(
    targetExtension?: DOCUMENT_EXTENSION,
  ): SaveDialogOptions {
    const sanitizedName = sanitizeFileName(this.displayName);
    const dateSuffix = formatDate(new Date(), "dd_MM_yyyy_HHmmss");
    const baseName = `${sanitizedName}_${dateSuffix}`;
    const defaultPath = targetExtension
      ? `${baseName}.${targetExtension}`
      : baseName;

    return {
      title: `Export - ${this.displayName}`,
      defaultPath,
      filters: this.resolveFilters(targetExtension),
    };
  }

  /**
   * Filters available file extension filters based on target selection.
   * @param targetExtension - Target format filter.
   * @returns Array of applicable Electron FileFilters.
   */
  private resolveFilters(targetExtension?: DOCUMENT_EXTENSION): FileFilter[] {
    if (!targetExtension) return this.extensionFilters;

    const relevant = this.extensionFilters.filter((filter) =>
      filter.extensions.includes(targetExtension),
    );
    return relevant.length > 0 ? relevant : this.extensionFilters;
  }
}
