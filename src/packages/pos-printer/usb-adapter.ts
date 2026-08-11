import os from "os";
import { Adapter } from "@node-escpos/adapter";
import { usb } from "usb";
import { Printer } from "@node-escpos/core";
import { CustomLogger as Logger } from "@/packages/logger";

/**
 * Standard USB Class codes defined by W3C / USB Implementers Forum.
 */
const IFACE_CLASS = {
  AUDIO: 0x01,
  HID: 0x03,
  PRINTER: 0x07,
  HUB: 0x09,
} as const;

/**
 * Chunk size in bytes for bulk USB transfers to prevent driver buffer overflow.
 */
const USB_CHUNK_SIZE = 1024;

/**
 * Represents a USB device instance conforming to node-usb/WebUSB bindings.
 */
export declare class UsbDevice {
  vendorId: number;
  productId: number;
  deviceVersionMajor: number;
  deviceVersionMinor: number;
  deviceVersionSubminor: number;
  usbVersionMajor: number;
  usbVersionMinor: number;
  usbVersionSubminor: number;
  deviceClass: number;
  deviceSubclass: number;
  deviceProtocol: number;
  bus: string;
  address: number;
  ports: Array<number>;
  speed?: string;
  get handle(): string;
  get manufacturerName(): string | null;
  get productName(): string | null;
  get serialNumber(): string | null;
  get opened(): boolean;
  get configuration(): unknown;
  get configurations(): Array<{
    interfaces: Array<{
      interfaceNumber: number;
      alternates: Array<{
        interfaceClass: number;
        endpoints: Array<{
          direction: "in" | "out";
          endpointNumber: number;
        }>;
      }>;
    }>;
  }>;
  open(): Promise<void>;
  close(): Promise<void>;
  forget(): Promise<void>;
  reset(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  selectAlternateInterface(
    interfaceNumber: number,
    alternateSetting: number,
  ): Promise<void>;
  nativeControlTransferIn(
    setup: unknown,
    timeout: number,
    length: number,
  ): Promise<Uint8Array | null>;
  nativeControlTransferOut(
    setup: unknown,
    timeout: number,
    data?: Uint8Array | undefined | null,
  ): Promise<number>;
  nativeTransferIn(
    endpointNumber: number,
    timeout: number,
    length: number,
  ): Promise<Uint8Array | null>;
  nativeTransferOut(
    endpointNumber: number,
    timeout: number,
    data: Uint8Array,
  ): Promise<number>;
  nativeIsochronousTransferIn(
    endpointNumber: number,
    packetLengths: Array<number>,
    timeout: number,
  ): Promise<unknown>;
  nativeIsochronousTransferOut(
    endpointNumber: number,
    data: Uint8Array,
    packetLengths: Array<number>,
    timeout: number,
  ): Promise<unknown>;
  clearHalt(direction: unknown, endpointNumber: number): Promise<void>;
  detachKernelDriver(interfaceNumber: number): Promise<void>;
  attachKernelDriver(interfaceNumber: number): Promise<void>;
  transferIn?(
    endpointNumber: number,
    length: number,
  ): Promise<{ data?: { buffer: ArrayBuffer } }>;
  transferOut?(
    endpointNumber: number,
    data: Buffer,
  ): Promise<{ bytesWritten: number }>;
}

/**
 * Extracted USB endpoint configuration for printer communication.
 */
interface PrinterEndpoints {
  interfaceNumber: number;
  inEndpointNumber?: number;
  outEndpointNumber?: number;
}

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
 * USB Adapter implementation for ESC/POS thermal printers using WebUSB API.
 * Includes chunked buffer transfers to support large payloads like logos and QR codes.
 */
export class USBAdapter extends Adapter<[]> {
  device: UsbDevice | null | undefined = null;
  vid?: number;
  pid?: number;

  outEndpointNumber?: number;
  inEndpointNumber?: number;

  /**
   * Constructs a USB adapter instance given a device or vendor/product identifiers.
   * @param vid - Vendor ID or an existing UsbDevice object.
   * @param pid - Product ID when VID is provided as a number.
   */
  constructor(vid?: number | UsbDevice, pid?: number) {
    super();
    this.detachDevice = this.detachDevice.bind(this);

    if (typeof vid === "number" && typeof pid === "number") {
      this.vid = vid;
      this.pid = pid;
    } else if (typeof vid === "object" && vid !== null) {
      this.device = vid;
    }

    usb.addEventListener("disconnect", this.detachDevice);
  }

  /**
   * Internal handler triggered when a USB device is disconnected.
   * @param event - Event containing the disconnected device reference.
   */
  private detachDevice(event: { device: UsbDevice }): void {
    if (event.device === this.device) {
      this.emit("detach", this.device);
      this.emit("disconnect", this.device);
      this.device = null;
    }
  }

  /**
   * Listens for global USB connection or disconnection events.
   * @param event - Event type ("connect" or "disconnect").
   * @param listener - Callback receiving the affected USB device.
   * @returns Unsubscribe function to remove the listener.
   */
  static on(
    event: "connect" | "disconnect",
    listener: (device: UsbDevice) => void,
  ): () => void {
    const handler = (evt: { device: UsbDevice }) => listener(evt.device);
    usb.addEventListener(event, handler);
    return () => usb.removeEventListener(event, handler);
  }

  /**
   * Extracts printer interface and endpoint numbers from a USB device descriptor.
   * @param device - USB device to inspect.
   * @returns Extracted printer endpoints or null if not found.
   */
  private static extractPrinterEndpoints(
    device: UsbDevice,
  ): PrinterEndpoints | null {
    if (!device.configurations) return null;

    for (const config of device.configurations) {
      for (const iface of config.interfaces) {
        for (const alt of iface.alternates) {
          if (alt.interfaceClass === IFACE_CLASS.PRINTER) {
            const endpoints: PrinterEndpoints = {
              interfaceNumber: iface.interfaceNumber,
            };
            for (const ep of alt.endpoints) {
              if (
                ep.direction === "out" &&
                endpoints.outEndpointNumber === undefined
              ) {
                endpoints.outEndpointNumber = ep.endpointNumber;
              }
              if (
                ep.direction === "in" &&
                endpoints.inEndpointNumber === undefined
              ) {
                endpoints.inEndpointNumber = ep.endpointNumber;
              }
            }
            return endpoints;
          }
        }
      }
    }
    return null;
  }

  /**
   * Checks whether the specified USB device has a printer interface.
   * @param device - USB device to test.
   * @returns True if the device is a printer, false otherwise.
   */
  static isPrinter(device: UsbDevice): boolean {
    try {
      return USBAdapter.extractPrinterEndpoints(device) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Searches connected USB devices and filters for printers.
   * @returns Promise resolving to an array of detected printer devices.
   */
  static async findPrinter(): Promise<UsbDevice[]> {
    const devices = (await usb.getDevices()) as unknown as UsbDevice[];
    return devices.filter((device) => USBAdapter.isPrinter(device));
  }

  /**
   * Resolves and opens a USB device matching the specified VID and PID.
   * @param vid - Vendor ID.
   * @param pid - Product ID.
   * @returns Promise resolving to the opened UsbDevice or undefined if missing.
   */
  static async getDevice(
    vid: number,
    pid: number,
  ): Promise<UsbDevice | undefined> {
    const device = (await usb.findDeviceByIds(vid, pid)) as unknown as
      UsbDevice | undefined;
    if (device) await device.open();
    return device;
  }

  /**
   * Resolves and opens a USB device matching the specified serial number.
   * @param serialNumber - Device serial number.
   * @returns Promise resolving to the opened UsbDevice or undefined if missing.
   */
  static async getDeviceBySerial(
    serialNumber: string,
  ): Promise<UsbDevice | undefined> {
    const device = (await usb.findDeviceBySerial(serialNumber)) as unknown as
      UsbDevice | undefined;
    if (device) await device.open();
    return device;
  }

  /**
   * Opens communication with the printer device and claims the required interface.
   * @param callback - Optional completion callback receiving errors if any.
   * @returns Current adapter instance for chaining.
   */
  open(callback?: (error: Error | null) => void): this {
    (async () => {
      try {
        if (!this.device) {
          if (this.vid !== undefined && this.pid !== undefined) {
            this.device = (await usb.findDeviceByIds(
              this.vid,
              this.pid,
            )) as unknown as UsbDevice;
          } else {
            const devices = await USBAdapter.findPrinter();
            if (devices.length > 0) this.device = devices[0];
          }
        }

        if (!this.device) throw new Error("Can not find printer");

        if (!this.device.opened) {
          await this.device.open();
        }

        if (!this.device.configuration) {
          await this.device.selectConfiguration(1);
        }

        const printerEndpoints = USBAdapter.extractPrinterEndpoints(
          this.device,
        );
        if (!printerEndpoints) {
          throw new Error("Can not find printer interface");
        }

        this.outEndpointNumber = printerEndpoints.outEndpointNumber;
        this.inEndpointNumber = printerEndpoints.inEndpointNumber;

        if (os.platform() !== "win32") {
          try {
            if (typeof this.device.detachKernelDriver === "function") {
              await this.device.detachKernelDriver(
                printerEndpoints.interfaceNumber,
              );
            }
          } catch (e: unknown) {
            console.error("[ERROR] Could not detach kernel driver:", e);
          }
        }

        await this.device.claimInterface(printerEndpoints.interfaceNumber);

        if (this.outEndpointNumber !== undefined) {
          this.emit("connect", this.device);
          if (callback) callback(null);
        } else {
          if (callback)
            callback(new Error("Can not find OUT endpoint from printer"));
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (callback) callback(error);
      }
    })();

    return this;
  }

  /**
   * Reads data asynchronously from the printer IN endpoint.
   * @param callback - Optional callback receiving the data Buffer.
   */
  read(callback?: (data: Buffer) => void): void {
    if (!this.device || this.inEndpointNumber === undefined) return;

    if (typeof this.device.transferIn === "function") {
      this.device
        .transferIn(this.inEndpointNumber, 64)
        .then((result) => {
          if (result?.data && callback) {
            callback(Buffer.from(result.data.buffer));
          }
        })
        .catch((err: unknown) => {
          console.error("Read error:", err);
        });
    }
  }

  /**
   * Writes data payload to the printer OUT endpoint using chunking to prevent transfer cancellations.
   * @param data - String or Buffer payload to send.
   * @param callback - Optional callback receiving error and written byte count.
   * @returns Current adapter instance for chaining.
   */
  write(
    data: string | Buffer,
    callback?: (error: Error | null, actual?: number) => void,
  ): this {
    this.emit("data", data);

    if (!this.device || this.outEndpointNumber === undefined) {
      if (callback) callback(new Error("Device not configured"));
      return this;
    }

    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const endpoint = this.outEndpointNumber;
    const device = this.device;

    (async () => {
      let totalBytesWritten = 0;
      try {
        for (let offset = 0; offset < buffer.length; offset += USB_CHUNK_SIZE) {
          const chunk = buffer.subarray(offset, offset + USB_CHUNK_SIZE);
          if (typeof device.transferOut === "function") {
            const result = await device.transferOut(endpoint, chunk);
            totalBytesWritten += result.bytesWritten;
          }
        }
        if (callback) callback(null, totalBytesWritten);
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        if (callback) callback(error);
      }
    })();

    return this;
  }

  /**
   * Closes active connection and unregisters event listeners.
   * @param callback - Optional completion callback.
   * @returns Current adapter instance for chaining.
   */
  close(callback?: (error: Error | null) => void): this {
    if (!this.device) {
      if (callback) callback(new Error("Device not found"));
      return this;
    }

    this.device
      .close()
      .then(() => {
        usb.removeEventListener("disconnect", this.detachDevice);
        this.emit("close", this.device);
        if (callback) callback(null);
      })
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        if (callback) callback(error);
      });

    return this;
  }
}

export default USBAdapter;

/**
 * Service providing high-level operations for USB thermal printers.
 */
export class PrinterService {
  private readonly logger: Logger;
  private defaultPrinterType: string = "EPSON";
  private encoding: string = "ISO8859_15";

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
    return await USBAdapter.findPrinter();
  }

  /**
   * Resolves a USB adapter instance matching the given printer identifier value.
   * @param value - Vendor and Product ID combination string (VID-PID).
   * @returns Configured USB adapter instance.
   */
  private async getDeviceByValue(value: string): Promise<USBAdapter> {
    const printers = await this.getPrinters();
    const printer = printers.find((device) => getValue(device) === value);

    if (!printer) {
      throw new Error(`Printer with identifier '${value}' was not found.`);
    }

    return new USBAdapter(printer.vendorId, printer.productId);
  }

  /**
   * Helper executing an operation within a managed USB device lifecycle.
   * @param printerValue - Target printer identifier.
   * @param action - Async operation using open USB adapter.
   * @returns Result of execution.
   */
  private async executeWithDevice<T>(
    printerValue: string,
    action: (device: USBAdapter) => Promise<T>,
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
   * Executes a receipt printing job on the specified printer device with full async flush support.
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
