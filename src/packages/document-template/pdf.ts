import { BrowserWindow } from "electron";
import { renderTemplate } from "./html";

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

/**
 * Generates a PDF binary Buffer from a raw HTML string using a headless Electron window.
 * @param htmlContent - The raw HTML string content to be rendered.
 * @param formatOptions - Print configuration options for Electron.
 * @returns Promise resolving to the generated PDF Buffer.
 */
export async function generatePdfFromHtml(
  htmlContent: string,
  formatOptions: Electron.PrintToPDFOptions,
): Promise<Buffer> {
  let window: BrowserWindow | null = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  try {
    return await new Promise<Buffer>((resolve, reject) => {
      if (!window) {
        return reject(
          new Error("PDF Generation Error: BrowserWindow instance is null."),
        );
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
        reject(
          new Error("PDF Generation Timeout: Window became unresponsive."),
        );
      };

      const handleFinishLoad = async () => {
        try {
          const pdfBuffer = await webContents.printToPDF(formatOptions);
          cleanup();
          resolve(pdfBuffer);
        } catch (printError) {
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
        reject(
          new Error(
            `Failed to load HTML content into PDF engine: ${errorDescription} (Code: ${errorCode})`,
          ),
        );
      };

      window.on("unresponsive", handleUnresponsive);
      webContents.once("did-finish-load", handleFinishLoad);
      webContents.once("did-fail-load", handleFailLoad);

      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      window.loadURL(dataUrl);
    });
  } finally {
    if (window) {
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

  /**
   * Initializes a new instance of PdfReportGenerator.
   * @param formatOptions - Printing configuration options.
   * @param templateRenderer - Custom HTML renderer implementation (defaults to base renderTemplate).
   */
  constructor(
    formatOptions: Electron.PrintToPDFOptions = DEFAULT_LANDSCAPE_A4_OPTIONS,
    templateRenderer: HtmlTemplateRenderer = renderTemplate,
  ) {
    this.formatOptions = formatOptions;
    this.templateRenderer = templateRenderer;
  }

  /**
   * Generates a PDF report from a template name and context payload.
   * @param payload - Object containing the template name and context data.
   * @returns Promise resolving to the binary PDF Buffer.
   */
  public async generate<T extends Record<string, unknown>>(
    payload: PdfGenerationPayload<T>,
  ): Promise<Buffer> {
    const htmlContent = await this.templateRenderer(
      payload.templateName,
      payload.templateData,
    );

    return generatePdfFromHtml(htmlContent, this.formatOptions);
  }
}

/** Default singleton instance for general application usage. */
export const defaultPdfReportGenerator = new PdfReportGenerator();
