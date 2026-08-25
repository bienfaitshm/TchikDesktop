import createReport from "docx-templates";
import {
  TemplateStorageService,
  defaultTemplateStorageService,
  ILogger,
} from "./template-reader";
import { additionalJsContext as defaultJsContext } from "./additional-context";

/**
 * Options required to execute DOCX report generation.
 */
export interface GenerateDocxReportOptions {
  /** Name or path identifier of the target template. */
  templateName: string;
  /** Context data payload to inject into the template. */
  templateData: Record<string, unknown>;
}

/**
 * Configuration contract for dependency injection (Storage, Logger, Context).
 */
export interface ReportGeneratorConfig {
  /** Storage service used to fetch raw template content. */
  storageService?: TemplateStorageService;
  /** Logger implementation instance. */
  logger?: ILogger;
  /** JavaScript context to inject into the template engine. */
  jsContext?: Record<string, unknown>;
}

/**
 * Null Object pattern implementation for fallback logging.
 */
const NULL_LOGGER: ILogger = {
  warn: () => {},
  error: () => {},
};

/**
 * Safely extracts a human-readable message string from an unknown error type.
 * @param error - The caught error instance or thrown value.
 * @returns Standardized error message string.
 */
const formatErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Service responsible for resolving templates and compiling DOCX binary reports.
 */
export class DocxReportGeneratorService {
  private readonly storageService: TemplateStorageService;
  private readonly logger: ILogger;
  private readonly jsContext: Record<string, unknown>;

  /**
   * Initializes a new instance of DocxReportGeneratorService with injected dependencies.
   * @param config - Optional configurations for storage, logging, and JS context.
   */
  constructor(config: ReportGeneratorConfig = {}) {
    this.storageService =
      config.storageService ?? defaultTemplateStorageService;
    this.logger = config.logger ?? NULL_LOGGER;
    this.jsContext = config.jsContext ?? defaultJsContext;
  }

  /**
   * Generates a binary DOCX report given a template name and context data.
   * @param options - Object containing template identifier and rendering data.
   * @returns Generated DOCX file content as a Uint8Array.
   */
  public async generate(
    options: GenerateDocxReportOptions,
  ): Promise<Uint8Array> {
    const { templateName, templateData } = options;
    let templateBuffer: Buffer;

    try {
      templateBuffer =
        await this.storageService.readTemplateContent(templateName);
    } catch (storageError) {
      const errorMsg = formatErrorMessage(storageError);
      const executionFailureMessage = `Failed to retrieve template "${templateName}": ${errorMsg}`;

      this.logger.error(`Aborting generation. ${executionFailureMessage}`);
      throw new Error(executionFailureMessage, { cause: storageError });
    }

    try {
      return await createReport({
        template: templateBuffer,
        data: templateData,
        additionalJsContext: this.jsContext,
        maximumWalkingDepth: Infinity,
      });
    } catch (engineError) {
      const errorMsg = formatErrorMessage(engineError);
      const executionFailureMessage = `Failed to assemble DOCX report for template "${templateName}": ${errorMsg}`;

      this.logger.error(executionFailureMessage);
      throw new Error(executionFailureMessage, { cause: engineError });
    }
  }
}

/**
 * Default singleton instance for general application usage.
 */
export const defaultDocxReportGeneratorService =
  new DocxReportGeneratorService();

/**
 * Generates a DOCX report using the default or provided configuration.
 * @deprecated Prefer using `defaultDocxReportGeneratorService.generate()` directly.
 * @param options - Generation options containing template and payload data.
 * @param config - Optional configuration override.
 * @returns Generated DOCX file content as a Uint8Array.
 */
export async function generateDocxReport(
  options: GenerateDocxReportOptions,
  config?: ReportGeneratorConfig,
): Promise<Uint8Array> {
  const service = config
    ? new DocxReportGeneratorService(config)
    : defaultDocxReportGeneratorService;

  return service.generate(options);
}
