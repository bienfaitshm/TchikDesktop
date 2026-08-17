import { BrowserWindow, WebContentsPrintOptions, PrinterInfo } from "electron";

/**
 * Interface pour l'injection du logger.
 */
export interface ILogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

const NULL_LOGGER: ILogger = {
  info: () => {},
  warn: () => {},
  error: () => {},
};

/**
 * @class PrinterManagementService
 * Gère les interactions avec le matériel d'impression via l'API Electron.
 */
export class PrinterManagementService {
  private readonly logger: ILogger;

  constructor(logger: ILogger = NULL_LOGGER) {
    this.logger = logger;
  }

  /**
   * Récupère la liste des imprimantes matérielles disponibles sur le système.
   */
  public async getSystemPrinters(
    window: BrowserWindow,
  ): Promise<PrinterInfo[]> {
    if (!window || window.isDestroyed()) {
      throw new Error(
        "System Error: A valid BrowserWindow is required to query printers.",
      );
    }

    try {
      return await window.webContents.getPrintersAsync();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to retrieve system printers: ${errorMessage}`);
      throw new Error(`Printer query pipeline failed: ${errorMessage}`, {
        cause: error,
      });
    }
  }

  /**
   * Imprime le contenu actuellement affiché dans la fenêtre cible.
   */
  public async printWindowContent(
    window: BrowserWindow,
    printOptions: WebContentsPrintOptions = {},
  ): Promise<void> {
    if (!window || window.isDestroyed()) {
      throw new Error(
        "Print Error: The provided BrowserWindow is invalid or destroyed.",
      );
    }

    return new Promise((resolve, reject) => {
      try {
        window.webContents.print(
          printOptions,
          (success: boolean, failureReason: string) => {
            if (success) {
              this.logger.info("Hardware print job completed successfully.");
              resolve();
            } else {
              const errorMsg = `Hardware print job rejected by OS. Reason: ${failureReason}`;
              this.logger.error(errorMsg);
              reject(new Error(errorMsg));
            }
          },
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Exception triggered during print job initialization: ${errorMessage}`,
        );
        reject(new Error(`Print execution failed: ${errorMessage}`));
      }
    });
  }

  /**
   * Imprime silencieusement une chaîne HTML brute.
   * Idéal pour les tickets de caisse, factures rapides ou étiquettes.
   * @param htmlContent Le code HTML à imprimer.
   * @param printOptions Options matérielles (silencieux, marges, imprimante cible).
   */
  public async printHtmlContent(
    htmlContent: string,
    printOptions: WebContentsPrintOptions = {},
  ): Promise<void> {
    if (!htmlContent || htmlContent.trim() === "") {
      throw new Error("Print Error: HTML content cannot be empty.");
    }

    this.logger.info("Initializing ephemeral window for HTML string printing.");

    let hiddenWindow: BrowserWindow | null = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    });

    // Fonction utilitaire pour nettoyer la fenêtre en toute sécurité
    const destroyWindow = () => {
      if (hiddenWindow && !hiddenWindow.isDestroyed()) {
        hiddenWindow.destroy();
        hiddenWindow = null;
      }
    };

    try {
      return await new Promise<void>((resolve, reject) => {
        if (!hiddenWindow) {
          return reject(
            new Error("Failed to allocate hidden window resource."),
          );
        }

        const { webContents } = hiddenWindow;

        hiddenWindow.on("unresponsive", () => {
          destroyWindow();
          reject(
            new Error("Print Timeout: Ephemeral window became unresponsive."),
          );
        });

        webContents.once("did-finish-load", () => {
          try {
            webContents.print(
              printOptions,
              (success: boolean, failureReason: string) => {
                console.log({ success, failureReason, printOptions });

                // On détruit la fenêtre une fois que l'imprimante a fini son travail
                destroyWindow();

                if (success) {
                  this.logger.info(
                    "HTML content successfully spooled to printer.",
                  );
                  resolve();
                } else {
                  this.logger.error(
                    `HTML print spooling failed. Reason: ${failureReason}`,
                  );
                  reject(
                    new Error(`HTML hardware print failed: ${failureReason}`),
                  );
                }
              },
            );
          } catch (printError) {
            destroyWindow();
            const errorMessage =
              printError instanceof Error
                ? printError.message
                : String(printError);
            reject(
              new Error(
                `Failed to execute print command on HTML: ${errorMessage}`,
              ),
            );
          }
        });

        webContents.once("did-fail-load", (_event, code, description) => {
          destroyWindow();
          reject(
            new Error(
              `Failed to load HTML content into print engine: ${description} (Code: ${code})`,
            ),
          );
        });

        const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
        hiddenWindow.loadURL(dataUrl);
      });
    } catch (error) {
      destroyWindow();
      throw error;
    }
  }
  /**
   * Imprime silencieusement un Buffer PDF binaire existant.
   */
  public async printPdfBuffer(
    pdfBuffer: Buffer,
    printOptions: WebContentsPrintOptions = {},
  ): Promise<void> {
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error(
        "Print Error: Provided PDF buffer is empty or undefined.",
      );
    }

    this.logger.info("Initializing ephemeral window for PDF buffer printing.");

    let hiddenWindow: BrowserWindow | null = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        plugins: true,
      },
    });

    try {
      return await new Promise<void>((resolve, reject) => {
        if (!hiddenWindow)
          return reject(
            new Error("Failed to allocate hidden window resource."),
          );

        const { webContents } = hiddenWindow;

        webContents.once("did-finish-load", () => {
          webContents.print(
            printOptions,
            (success: boolean, failureReason: string) => {
              if (success) {
                this.logger.info(
                  "PDF buffer successfully spooled to hardware printer.",
                );
                resolve();
              } else {
                this.logger.error(
                  `PDF buffer spooling failed. Reason: ${failureReason}`,
                );
                reject(
                  new Error(`PDF hardware print failed: ${failureReason}`),
                );
              }
            },
          );
        });

        webContents.once("did-fail-load", (_event, code, description) => {
          reject(
            new Error(
              `Failed to load PDF buffer into print engine: ${description} (Code: ${code})`,
            ),
          );
        });

        const base64Pdf = pdfBuffer.toString("base64");
        const dataUrl = `data:application/pdf;base64,${base64Pdf}`;
        hiddenWindow.loadURL(dataUrl);
      });
    } finally {
      if (hiddenWindow) {
        hiddenWindow.destroy();
        hiddenWindow = null;
      }
    }
  }
}

export const defaultPrinterManagementService = new PrinterManagementService();
