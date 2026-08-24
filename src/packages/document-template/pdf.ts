import { BrowserWindow } from "electron";
import { renderTemplate } from "./html";
import { getLogger as createLogger, type Logger } from "@/packages/logger";

/** Type contract for template rendering functions. */
export type HtmlTemplateRenderer = (
  templateName: string,
  templateData: Record<string, unknown>,
) => Promise<string>;

/**
 * Interface payload structure for PDF generation requests.
 */
export interface PdfGenerationPayload<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Identifier or file path of the template to render. */
  templateName: string;
  /** Context data injected into the template. */
  templateData: T;
}

/**
 * Default landscape A4 configuration for Electron PDF printing.
 */
export const DEFAULT_LANDSCAPE_A4_OPTIONS: Electron.PrintToPDFOptions = {
  pageSize: "A4",
  landscape: true,
  printBackground: true,
  margins: { marginType: "none" },
};

const pdfGeneratorLogger = createLogger("Pdf Generator");

/**
 * Generates a PDF binary Buffer from a raw HTML string using a headless Electron window.
 * @param htmlContent - The raw HTML string content to be rendered.
 * @param formatOptions - Print configuration options for Electron.
 * @param logger - Logger instance used for operational tracking (defaults to pdfGeneratorLogger).
 * @returns Promise resolving to the generated PDF Buffer.
 */
export async function generatePdfFromHtml(
  htmlContent: string,
  formatOptions: Electron.PrintToPDFOptions,
  logger: Logger = pdfGeneratorLogger,
): Promise<Buffer> {
  logger.debug("Creating headless BrowserWindow for PDF rendering.");

  let window: BrowserWindow | null = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const startTime = Date.now();

  try {
    return await new Promise<Buffer>((resolve, reject) => {
      if (!window) {
        const err = new Error(
          "PDF Generation Error: BrowserWindow instance is null.",
        );
        logger.error(err.message);
        return reject(err);
      }

      const { webContents } = window;

      const cleanup = () => {
        if (window) {
          window.removeAllListeners("unresponsive");
          webContents.removeAllListeners("did-finish-load");
          webContents.removeAllListeners("did-fail-load");
        }
      };

      const handleUnresponsive = () => {
        cleanup();
        const err = new Error(
          "PDF Generation Timeout: Window became unresponsive.",
        );
        logger.error(err.message);
        reject(err);
      };

      const handleFinishLoad = async () => {
        try {
          logger.debug("HTML content loaded successfully. Printing to PDF.");
          const pdfBuffer = await webContents.printToPDF(formatOptions);
          const duration = Date.now() - startTime;
          logger.info(
            `PDF generated successfully (${pdfBuffer.byteLength} bytes) in ${duration}ms.`,
          );
          cleanup();
          resolve(pdfBuffer);
        } catch (printError) {
          logger.error(
            "Error encountered while printing window to PDF.",
            printError,
          );
          cleanup();
          reject(printError);
        }
      };

      const handleFailLoad = (
        _event: Electron.Event,
        errorCode: number,
        errorDescription: string,
      ) => {
        cleanup();
        const err = new Error(
          `Failed to load HTML content into PDF engine: ${errorDescription} (Code: ${errorCode})`,
        );
        logger.error(err.message);
        reject(err);
      };

      window.on("unresponsive", handleUnresponsive);
      webContents.once("did-finish-load", handleFinishLoad);
      webContents.once("did-fail-load", handleFailLoad);

      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

      window.loadURL(dataUrl).catch((loadError) => {
        cleanup();
        logger.error("Failed to execute loadURL on BrowserWindow.", loadError);
        reject(loadError);
      });
    });
  } finally {
    if (window) {
      logger.debug("Destroying BrowserWindow instance.");
      window.destroy();
      window = null;
    }
  }
}

/**
 * Service orchestrating HTML template rendering and PDF binary compilation.
 */
export class PdfReportGenerator {
  private readonly formatOptions: Electron.PrintToPDFOptions;
  private readonly templateRenderer: HtmlTemplateRenderer;
  private readonly logger: Logger;

  /**
   * Initializes a new instance of PdfReportGenerator.
   * @param formatOptions - Printing configuration options.
   * @param templateRenderer - Custom HTML renderer implementation (defaults to base renderTemplate).
   * @param logger - Logger instance for operational logging (defaults to pdfGeneratorLogger).
   */
  constructor(
    formatOptions: Electron.PrintToPDFOptions = DEFAULT_LANDSCAPE_A4_OPTIONS,
    templateRenderer: HtmlTemplateRenderer = renderTemplate,
    logger: Logger = pdfGeneratorLogger,
  ) {
    this.formatOptions = formatOptions;
    this.templateRenderer = templateRenderer;
    this.logger = logger;
  }

  /**
   * Generates a PDF report from a template name and context payload.
   * @param payload - Object containing the template name and context data.
   * @returns Promise resolving to the binary PDF Buffer.
   */
  public async generate<T extends Record<string, unknown>>(
    payload: PdfGenerationPayload<T>,
  ): Promise<Buffer> {
    this.logger.info(
      `Starting PDF report generation for template: ${payload.templateName}`,
    );

    try {
      const htmlContent = await this.templateRenderer(
        payload.templateName,
        payload.templateData,
      );

      return await generatePdfFromHtml(
        htmlContent,
        this.formatOptions,
        this.logger,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF report for template: ${payload.templateName}`,
        error,
      );
      throw error;
    }
  }
}

/** Default singleton instance for general application usage. */
export const defaultPdfReportGenerator = new PdfReportGenerator();
