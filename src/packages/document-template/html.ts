import Handlebars from "handlebars";
import {
  TemplateStorageService,
  defaultTemplateStorageService,
  ILogger,
} from "./template-reader";
import { additionalJsContext } from "./additional-context";

/** Null Object implementation for safe fallback logging. */
const NULL_LOGGER: ILogger = {
  warn: () => {},
  error: () => {},
};

/** In-memory cache for compiled Handlebars template delegates. */
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Registers standardHandlebars helpers used across application templates.
 */
export function registerHandlebarsHelpers(): void {
  if (!Handlebars.helpers["formatDate"]) {
    Handlebars.registerHelper("formatDate", (value: unknown) => {
      if (!value) return "";
      const date =
        typeof value === "string" || typeof value === "number"
          ? new Date(value)
          : value;
      if (!(date instanceof Date) || isNaN(date.getTime()))
        return String(value);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
    });
  }

  if (!Handlebars.helpers["formatNumber"]) {
    Handlebars.registerHelper("formatNumber", (value: unknown) => {
      const amount = typeof value === "number" ? value : Number(value);
      if (isNaN(amount)) return "0";
      return new Intl.NumberFormat("fr-FR").format(amount);
    });
  }

  if (!Handlebars.helpers["formatCurrency"]) {
    Handlebars.registerHelper("formatCurrency", (value: unknown) => {
      const amount = typeof value === "number" ? value : Number(value);
      if (isNaN(amount)) return "0 CDF";
      return `${new Intl.NumberFormat("fr-FR").format(amount)} CDF`;
    });
  }
}

// Automatically register helpers upon module initialization
registerHandlebarsHelpers();

/**
 * Safely extracts a string error message from an unknown error type.
 * @param error - The caught error instance.
 * @returns Standardized message string.
 */
const formatErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Options configuration contract for template execution.
 */
export interface TemplateRenderOptions {
  /** Custom storage service instance used to retrieve raw templates. */
  storageService?: TemplateStorageService;

  /** Custom logger implementation for tracking render lifecycle events. */
  logger?: ILogger;
}

/**
 * Flushes the in-memory Handlebars template cache.
 */
export function clearTemplateCache(): void {
  templateCache.clear();
}

/**
 * Compiles and renders a Handlebars template with the provided context data.
 * @template T - Context object structure injected into the template.
 * @param templateRelativePath - Relative file path to the Handlebars template.
 * @param context - Data object to hydrate into the template layout.
 * @param options - Execution options including custom storage or logger.
 * @returns Promise resolving to the rendered HTML content string.
 * @throws {Error} When template fetching, compilation, or execution fails.
 */
export async function renderTemplate<T extends object>(
  templateRelativePath: string,
  context: T,
  options: TemplateRenderOptions = {},
): Promise<string> {
  const logger = options.logger ?? NULL_LOGGER;
  const storageService =
    options.storageService ?? defaultTemplateStorageService;

  let compiledTemplate = templateCache.get(templateRelativePath);

  if (!compiledTemplate) {
    let rawBuffer: Buffer;
    try {
      rawBuffer = await storageService.readTemplateContent(
        templateRelativePath,
        { encoding: null },
      );
    } catch (storageError) {
      const errorMsg = formatErrorMessage(storageError);
      logger.error(
        `Storage read failure for "${templateRelativePath}": ${errorMsg}`,
      );
      throw storageError;
    }

    try {
      const templateSource = rawBuffer.toString("utf8");
      compiledTemplate = Handlebars.compile(templateSource, {
        knownHelpersOnly: false,
      });
      templateCache.set(templateRelativePath, compiledTemplate);
    } catch (compileError) {
      const errorMsg = formatErrorMessage(compileError);
      const runtimeExceptionMessage = `Failed to compile template "${templateRelativePath}": ${errorMsg}`;

      logger.error(runtimeExceptionMessage);
      throw new Error(runtimeExceptionMessage, { cause: compileError });
    }
  }

  try {
    const mergedContext = {
      ...additionalJsContext,
      ...context,
    };

    return compiledTemplate(mergedContext);
  } catch (renderError) {
    const errorMsg = formatErrorMessage(renderError);
    const executionFailureMessage = `Failed to render template "${templateRelativePath}": ${errorMsg}`;

    logger.error(executionFailureMessage);
    throw new Error(executionFailureMessage, { cause: renderError });
  }
}
