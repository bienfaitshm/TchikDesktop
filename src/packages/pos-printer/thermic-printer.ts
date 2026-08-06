import { ThermalPrinter, PrinterTypes } from "node-thermal-printer";
import { getPrinters, PrinterDetails } from "printer";
import { CustomLogger as Logger } from "@/packages/logger";

const printerDriver = require("printer");

export type PrinterThermal = ThermalPrinter;
export type SystemPrinter = PrinterDetails;
export type ActionResult = { success: boolean; message?: string };

export type PrinterServiceConfig = {
  logger: Logger;
  defaultPrinterType?: PrinterTypes;
};

/**
 * Service responsible for managing thermal printer connections and executing print jobs.
 * Provides system printer discovery, connection health checks, and robust error logging.
 */
export class PrinterService {
  private logger: Logger;
  private defaultPrinterType: PrinterTypes;

  constructor(config: PrinterServiceConfig) {
    this.logger = config.logger;
    this.defaultPrinterType = config.defaultPrinterType || PrinterTypes.EPSON;
  }

  /**
   * Retrieves all available printers installed on the host operating system.
   * @returns An array of system printer details available on the machine.
   */
  getSystemPrinters(): SystemPrinter[] {
    return getPrinters();
  }

  /**
   * Initializes a thermal printer instance and attempts to connect to it.
   * @param printerName - The OS-level identifier of the printer.
   * @returns An object containing the connection boolean and the printer instance if successful.
   */
  async initializePrinter(
    printerName: string,
  ): Promise<{ isConnected: boolean; printer: PrinterThermal | null }> {
    this.logger.info(`Attempting to initialize printer: ${printerName}`);

    const printer = new ThermalPrinter({
      type: this.defaultPrinterType,
      interface: `printer:${printerName}`,
      driver: printerDriver,
      options: {
        timeout: 5000,
      },
    });

    const isConnected = await printer.isPrinterConnected();

    if (isConnected) {
      this.logger.info(`Printer ${printerName} connected successfully.`);
      return { isConnected, printer };
    }

    this.logger.warn(
      `Failed to establish connection with printer: ${printerName}.`,
    );
    return { isConnected: false, printer: null };
  }

  /**
   * Checks if a specified printer is currently connected and reachable.
   * @param printerName - The OS-level identifier of the printer.
   * @returns A promise resolving to an ActionResult with the connection status.
   */
  async checkConnection(printerName: string): Promise<ActionResult> {
    const { isConnected } = await this.initializePrinter(printerName);
    return {
      success: isConnected,
      message: isConnected
        ? "Printer is online and connected."
        : "Printer is offline or unreachable.",
    };
  }

  /**
   * Executes a safe print job on the specified printer with error handling and logging.
   * @param printerName - The OS-level identifier of the printer.
   * @param receiptJob - A callback function containing the sequence of print commands.
   * @returns A promise resolving to an ActionResult indicating the final job status.
   */
  async printReceipt(
    printerName: string,
    receiptJob: (printer: PrinterThermal) => Promise<boolean> | boolean,
  ): Promise<ActionResult> {
    this.logger.info(`Starting print job workflow for: ${printerName}`);

    try {
      const { isConnected, printer } =
        await this.initializePrinter(printerName);

      if (!isConnected || !printer) {
        const message = `Print job aborted. Printer ${printerName} is disconnected.`;
        this.logger.error(message);
        return { success: false, message };
      }

      await receiptJob(printer);

      this.logger.info(`Print job successfully executed on ${printerName}.`);
      return { success: true, message: "Print job completed successfully." };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Critical error during print job on ${printerName}: ${errorMessage}`,
      );
      return { success: false, message: `Print failed: ${errorMessage}` };
    }
  }
}
