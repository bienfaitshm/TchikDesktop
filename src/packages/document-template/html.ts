import Handlebars from "handlebars";
import {
  TemplateStorageService,
  defaultTemplateStorageService,
  ILogger,
} from "./template-reader";
import { additionalJsContext } from "./additional-context";

/** Maximum allowed compiled templates stored in memory cache. */
const MAX_CACHE_SIZE = 100;

/** Null Object implementation for safe fallback logging. */
const NULL_LOGGER: ILogger = {
  warn: () => {},
  error: () => {},
};

/** Bounded in-memory cache for compiled Handlebars template delegates. */
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

/**
 * Registers standard or custom helpers used across Handlebars templates.
 * @param helpers - Dictionary of helper functions to register (defaults to additionalJsContext).
 */
export function registerHandlebarsHelpers(
  helpers: Record<string, unknown> = additionalJsContext as Record<
    string,
    unknown
  >,
): void {
  for (const [key, helperFn] of Object.entries(helpers)) {
    if (typeof helperFn === "function" && !Handlebars.helpers[key]) {
      Handlebars.registerHelper(key, helperFn as Handlebars.HelperDelegate);
    }
  }
}

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
 * Stores a compiled template delegate in the cache maintaining bounded capacity.
 * @param key - Template file path identifier.
 * @param delegate - Compiled Handlebars template delegate function.
 */
const setCacheItem = (
  key: string,
  delegate: HandlebarsTemplateDelegate,
): void => {
  if (templateCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = templateCache.keys().next().value;
    if (oldestKey) {
      templateCache.delete(oldestKey);
    }
  }
  templateCache.set(key, delegate);
};

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

  registerHandlebarsHelpers();

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
      const storageFailureMessage = `Failed to read template "${templateRelativePath}" from storage: ${errorMsg}`;

      logger.error(storageFailureMessage);
      throw new Error(storageFailureMessage, { cause: storageError });
    }

    try {
      const templateSource = rawBuffer.toString("utf8");
      compiledTemplate = Handlebars.compile(templateSource, {
        knownHelpersOnly: false,
      });
      setCacheItem(templateRelativePath, compiledTemplate);
    } catch (compileError) {
      const errorMsg = formatErrorMessage(compileError);
      const runtimeExceptionMessage = `Failed to compile template "${templateRelativePath}": ${errorMsg}`;

      logger.error(runtimeExceptionMessage);
      throw new Error(runtimeExceptionMessage, { cause: compileError });
    }
  }

  try {
    return compiledTemplate(context);
  } catch (renderError) {
    const errorMsg = formatErrorMessage(renderError);
    const executionFailureMessage = `Failed to render template "${templateRelativePath}": ${errorMsg}`;

    logger.error(executionFailureMessage);
    throw new Error(executionFailureMessage, { cause: renderError });
  }
}
