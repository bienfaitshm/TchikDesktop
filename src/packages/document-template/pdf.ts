import { BrowserWindow } from "electron";
import { renderTemplate } from "./html";

/**
 * Options par défaut pour l'impression PDF.
 * Encapsulé proprement pour éviter de polluer le scope global.
 */
export const DEFAULT_LANDSCAPE_A4_OPTIONS: Electron.PrintToPDFOptions = {
  pageSize: "A4",
  landscape: true,
  printBackground: true,
  margins: { marginType: "none" },
};

/**
 * Génère un Buffer PDF de manière isolée et sécurisée à partir d'une chaîne HTML.
 * @param htmlContent Le contenu HTML brut à imprimer.
 * @param formatOptions Options d'impression Electron.
 * @returns Une promesse résolue avec le Buffer binaire du PDF.
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

      window.on("unresponsive", () =>
        reject(
          new Error("PDF Generation Timeout: Window became unresponsive."),
        ),
      );

      webContents.once("did-finish-load", async () => {
        try {
          const pdfBuffer = await webContents.printToPDF(formatOptions);
          resolve(pdfBuffer);
        } catch (printError) {
          reject(printError);
        }
      });

      webContents.once(
        "did-fail-load",
        (_event, errorCode, errorDescription) => {
          reject(
            new Error(
              `Failed to load HTML content into PDF engine: ${errorDescription} (Code: ${errorCode})`,
            ),
          );
        },
      );

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
 * @class PdfReportGenerator
 * Service responsable de l'orchestration : Rendu du template HTML -> Génération du PDF.
 */
export class PdfReportGenerator {
  private readonly formatOptions: Electron.PrintToPDFOptions;

  constructor(
    formatOptions: Electron.PrintToPDFOptions = DEFAULT_LANDSCAPE_A4_OPTIONS,
  ) {
    this.formatOptions = formatOptions;
  }

  /**
   * @param payload Informations de rendu (nom du template et données).
   */
  public async generate<T extends Record<string, unknown>>(payload: {
    templateName: string;
    templateData: T;
  }): Promise<Buffer> {
    // 1. Rendu du template HTML (Handlebars)
    const htmlRenderer = await renderTemplate(
      payload.templateName,
      payload.templateData,
    );

    // 2. Conversion HTML vers PDF via Electron
    return generatePdfFromHtml(htmlRenderer, this.formatOptions);
  }
}

/**
 * Instance Singleton par défaut pour faciliter l'utilisation.
 */
export const defaultPdfReportGenerator = new PdfReportGenerator();
