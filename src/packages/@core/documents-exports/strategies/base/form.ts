import type { ColSpan } from "@/packages/dynamic-form";

/**
 * Defines column layout spans for export form fields.
 */
export type DocumentExportLayout<TKeys extends string = string> = Record<
  TKeys,
  ColSpan
>;

/**
 * Generic configuration parameters required to build an export form.
 */
export interface BaseExportFormConfig<
  TContext extends Record<string, unknown> = Record<string, unknown>,
  TKeys extends string = string,
> {
  readonly context: TContext;
  readonly fileTypeFilters?: readonly Electron.FileFilter[];
  readonly layout?: Partial<DocumentExportLayout<TKeys>>;
}

/**
 * Default layout spans applied when explicit layout values are omitted.
 */
export const DEFAULT_LAYOUT: Readonly<
  DocumentExportLayout<"fileType" | "session">
> = {
  fileType: 6,
  session: 6,
} as const;

/**
 * Error thrown when generic export form validation fails.
 */
export class ValidationError extends Error {
  /**
   * Initializes a new validation error instance.
   * @param field - Name of the field causing the failure.
   * @param message - Descriptive failure message.
   */
  constructor(
    public readonly field: string,
    message: string,
  ) {
    super(`Validation error [${field}]: ${message}`);
    this.name = "ValidationError";
  }
}

/**
 * Validates basic required string parameters inside context objects.
 * @param context - Key-value pair context map to validate.
 * @param requiredKeys - Array of key names that must be present and non-empty.
 * @returns Validated context object with trimmed string values.
 * @throws {ValidationError} If any required context key is missing or empty.
 */
export const validateContextKeys = <T extends Record<string, unknown>>(
  context: T,
  requiredKeys: (keyof T)[],
): T => {
  const sanitized = { ...context };

  for (const key of requiredKeys) {
    const value = sanitized[key];
    if (typeof value !== "string" || !value.trim()) {
      throw new ValidationError(
        String(key),
        `${String(key)} is required and cannot be empty`,
      );
    }
    sanitized[key] = value.trim() as T[keyof T];
  }

  return sanitized;
};

/**
 * Validates context keys and merges form layout with default fallback values.
 * @param config - Base configuration containing context, filters, and layout options.
 * @param requiredKeys - Array of required keys to enforce in the context.
 * @returns Validated context, filters, and merged layout configuration.
 */
export function validateAndMergeContext<
  TContext extends Record<string, unknown>,
  TKeys extends string = "fileType",
>(
  config: Readonly<BaseExportFormConfig<TContext, TKeys>>,
  requiredKeys: (keyof TContext)[],
): {
  fileTypeFilters: readonly Electron.FileFilter[];
  validContext: TContext;
  mergedLayout: DocumentExportLayout<TKeys>;
} {
  const { context, fileTypeFilters = [], layout = {} } = config;
  const validContext = validateContextKeys(context, requiredKeys);

  const mergedLayout = {
    ...(DEFAULT_LAYOUT as unknown as DocumentExportLayout<TKeys>),
    ...layout,
  };

  return {
    fileTypeFilters,
    validContext,
    mergedLayout,
  };
}
