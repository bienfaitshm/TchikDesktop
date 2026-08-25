import type { ColSpan } from "@/packages/dynamic-form";

/**
 * Defines column layout spans for export form fields mapped by context keys.
 */
export type DocumentExportLayout<
  TContext extends Record<string, unknown> = Record<string, unknown>,
> = Partial<Record<keyof TContext, ColSpan>>;

/**
 * Generic configuration parameters required to build an export form.
 */
export type BaseExportFormConfig<
  TContext extends Record<string, unknown> = Record<string, unknown>,
> = TContext & {
  readonly fileTypeFilters?: readonly Electron.FileFilter[];
  readonly schoolId: string;
  readonly yearId: string;
};

/**
 * Default layout spans applied when explicit layout values are omitted.
 */
export const DEFAULT_LAYOUT: Readonly<
  DocumentExportLayout<{ fileType: string }>
> = {
  fileType: 6,
};

/**
 * Error thrown when generic export form validation fails.
 */
export class ValidationError extends Error {
  /**
   * Initializes a new validation error instance.
   * @param field - Name of the context field causing the failure.
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
 * @returns A shallow copy of context with validated and trimmed string values.
 * @throws {ValidationError} If any required context key is missing or empty.
 */
export const validateContextKeys = <T extends Record<string, unknown>>(
  context: T,
  requiredKeys: (keyof T)[],
): T => {
  const sanitized = { ...context };

  for (const key of requiredKeys) {
    const value = sanitized[key];
    if (typeof value !== "string" || value.trim().length === 0) {
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
 * Validates context keys and extracts file extension filters.
 * @param config - Base export form configuration containing context and filters.
 * @param requiredKeys - Array of required keys to enforce in the context.
 * @returns Validated context object and associated file type filters.
 */
export function validateAndMergeContext<
  TContext extends Record<string, unknown>,
>(
  config: Readonly<BaseExportFormConfig<TContext>>,
  requiredKeys: (keyof TContext)[],
): {
  fileTypeFilters: readonly Electron.FileFilter[];
  validContext: TContext;
} {
  const validContext = validateContextKeys(config as TContext, requiredKeys);
  const fileTypeFilters = config.fileTypeFilters ?? [];

  return {
    fileTypeFilters,
    validContext,
  };
}
