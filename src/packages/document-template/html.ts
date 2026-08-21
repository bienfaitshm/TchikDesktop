import Handlebars from "handlebars";
import {
  TemplateStorageService,
  defaultTemplateStorageService,
  ILogger,
} from "./template-reader";

/** Null Object implementation for safe fallback logging. */
const NULL_LOGGER: ILogger = {
  warn: () => {},
  error: () => {},
};

/** In-memory cache for compiled Handlebars template delegates. */
const templateCache = new Map<string, HandlebarsTemplateDelegate>();

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
      compiledTemplate = Handlebars.compile(templateSource);
      templateCache.set(templateRelativePath, compiledTemplate);
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
