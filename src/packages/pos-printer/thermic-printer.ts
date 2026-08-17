import { Printer } from "@node-escpos/core";
import { CustomLogger as Logger } from "@/packages/logger";
import USB from "./usb-adapter";
import type { UsbDevice } from "./usb-adapter";

/**
 * Represents system printer metadata retrieved from USB discovery.
 */
export type SystemPrinter = {
  name: string | null;
  vid: number;
  pid: number;
  serialNumber: string | null;
  address: number | null;
  manufacturerName: string | null;
  bus: string;
  value: string;
};

/**
 * Type alias for thermal ESC/POS printer instance.
 */
export type PrinterThermal = Printer<[]>;

/**
 * Standard operation action result structure.
 */
export type ActionResult = {
  success: boolean;
  message?: string;
};

/**
 * Configuration options for initializing PrinterService.
 */
export type PrinterServiceConfig = {
  logger: Logger;
  defaultPrinterType?: string;
  encoding?: string;
};

/**
 * Service providing high-level operations for USB thermal printers.
 */
export class PrinterService {
  private readonly logger: Logger;
  private defaultPrinterType: string = "EPSON";
  private readonly encoding: string = "win1252";

  /**
   * Constructs a PrinterService instance with specified logger and configurations.
   * @param config - Configuration settings including logger and default encoding.
   */
  constructor(config: PrinterServiceConfig) {
    this.logger = config.logger;
    this.defaultPrinterType =
      config.defaultPrinterType || this.defaultPrinterType;
    this.encoding = config.encoding || this.encoding;
  }

  /**
   * Retrieves all connected USB thermal printer devices.
   * @returns List of detected UsbDevice objects.
   */
  private async getPrinters(): Promise<UsbDevice[]> {
    return await USB.findPrinter();
  }

  /**
   * Resolves a USB adapter instance matching the given printer identifier value.
   * @param value - Vendor and Product ID combination string (VID-PID).
   * @returns Configured USB adapter instance.
   */
  private async getDeviceByValue(value: string): Promise<USB> {
    const printers = await this.getPrinters();
    const printer = printers.find((device) => getValue(device) === value);

    if (!printer) {
      throw new Error(`Printer with identifier '${value}' was not found.`);
    }

    return new USB(printer.vendorId, printer.productId);
  }

  /**
   * Helper executing a operation within a managed USB device lifecycle.
   * @param printerValue - Target printer identifier.
   * @param action - Async operation using open USB adapter.
   * @returns Result of execution or failure object.
   */
  private async executeWithDevice<T>(
    printerValue: string,
    action: (device: USB) => Promise<T>,
  ): Promise<T> {
    const device = await this.getDeviceByValue(printerValue);

    return new Promise<T>((resolve, reject) => {
      device.open(async (error: unknown) => {
        if (error) {
          const errMessage =
            error instanceof Error ? error.message : String(error);
          return reject(new Error(`Failed to open USB device: ${errMessage}`));
        }

        try {
          const result = await action(device);
          resolve(result);
        } catch (actionError) {
          reject(actionError);
        } finally {
          device.close(() => {
            // Cleanup complete
          });
        }
      });
    });
  }

  /**
   * Scans and retrieves all available system USB thermal printers.
   * @returns Array of mapped system printer definitions.
   */
  async getSystemPrinters(): Promise<SystemPrinter[]> {
    try {
      this.logger.info("Retrieving system printer list...");
      const devices = await this.getPrinters();
      this.logger.info(`Found ${devices.length} USB printer device(s)`);

      return mapDevices(devices);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to retrieve system printers: ${errorMessage}`);
      return [];
    }
  }

  /**
   * Initializes a thermal printer instance with proper character encoding.
   * @param printerValue - Target printer identifier value.
   * @returns Initialized thermal printer object ready for commands.
   */
  async initializePrinter(printerValue: string): Promise<PrinterThermal> {
    this.logger.info(`Initializing printer: ${printerValue}`);
    try {
      const device = await this.getDeviceByValue(printerValue);
      const options = { encoding: this.encoding };
      const printer = new Printer(device, options);

      this.logger.info(`Printer '${printerValue}' successfully initialized.`);
      return printer;
    } catch (error) {
      this.logger.error(
        `Error while initializing printer '${printerValue}':`,
        error,
      );
      throw error;
    }
  }

  /**
   * Checks whether the specified printer is currently connected and responsive.
   * @param printerValue - Target printer identifier value.
   * @returns ActionResult indicating online status.
   */
  async checkConnection(printerValue: string): Promise<ActionResult> {
    try {
      this.logger.info(`Checking connection status for: ${printerValue}`);

      await this.executeWithDevice(printerValue, async () => {
        return true;
      });

      this.logger.info(`Printer '${printerValue}' is online and connected.`);
      return {
        success: true,
        message: `Printer '${printerValue}' is connected.`,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(`Printer '${printerValue}' is offline: ${errorMessage}`);
      return {
        success: false,
        message: `Printer '${printerValue}' is offline.`,
      };
    }
  }

  /**
   * Executes a receipt printing job on the specified printer device.
   * @param printerValue - Target printer identifier value.
   * @param receiptJob - Callback receiving the initialized printer and performing print operations.
   * @returns ActionResult indicating whether print job succeeded.
   */
  async printReceipt(
    printerValue: string,
    receiptJob: (printer: PrinterThermal) => Promise<boolean> | boolean,
  ): Promise<ActionResult> {
    this.logger.info(`Starting print job for: ${printerValue}`);

    try {
      return await this.executeWithDevice(printerValue, async (device) => {
        const options = { encoding: this.encoding };
        const printer = new Printer(device, options);
        // printer.raw(Buffer.from([0x1b, 0x74, 0x10]));
        // printer.encode("win1252");
        printer.setCharacterCodeTable(16).encode("win1252");
        this.logger.info(`Executing receipt job on printer: ${printerValue}`);
        const result = await receiptJob(printer);

        if (result) {
          await printer.close();
          this.logger.info(
            `Print job completed successfully on: ${printerValue}`,
          );
          return {
            success: true,
            message: "Print job completed successfully.",
          };
        } else {
          await printer.close();
          this.logger.warn(`Print job returned false on: ${printerValue}`);
          return {
            success: false,
            message: "Print job returned false.",
          };
        }
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Critical error during print job on ${printerValue}: ${errorMessage}`,
      );
      return {
        success: false,
        message: `Print failed: ${errorMessage}`,
      };
    }
  }
}

/**
 * Maps raw USB device records into standardized SystemPrinter structures.
 * @param devices - List of detected UsbDevice instances.
 * @returns Mapped SystemPrinter array.
 */
export function mapDevices(devices: UsbDevice[]): SystemPrinter[] {
  return devices.map((device) => ({
    name: device.productName,
    vid: device.vendorId,
    pid: device.productId,
    serialNumber: device.serialNumber,
    address: device.address,
    manufacturerName: device.manufacturerName,
    bus: device.bus,
    value: getValue(device),
  }));
}

/**
 * Generates a unique identifier string for a given USB device.
 * @param device - Target USB device instance.
 * @returns Unique string in format VID-PID.
 */
export function getValue(device: UsbDevice): string {
  return `${device.vendorId}-${device.productId}`;
}
