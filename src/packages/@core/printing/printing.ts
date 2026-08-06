import { HttpStatus, createErrorResponse } from "@/packages/electron-ipc-rest";
import { getLogger as createLogger } from "@/packages/logger";
import {
  printPdfReceipt,
  Payload,
  jobs,
  PrinterService,
} from "@/packages/pos-printer";
import { tchikAppStore } from "@/packages/@core/data-access/stores";

const defaultLogger = createLogger("PRINTING SERVICES");
const defaultPrinterService = new PrinterService({
  logger: defaultLogger,
});

/**
 * High-level service facade managing POS and document printing operations.
 */
export class Printing {
  /**
   * Retrieves all available OS-level installed printers.
   * @param service - POS printer service instance.
   * @returns List of system printers detected on the host machine.
   */
  static async getPrinters(service: PrinterService = defaultPrinterService) {
    return service.getSystemPrinters();
  }

  /**
   * Checks the connectivity status of a target printer by its system name.
   * @param printerName - The identifier name of the system printer.
   * @param service - POS printer service instance.
   * @returns Connection status result.
   */
  static async checkPrinter(
    printerName: string,
    service: PrinterService = defaultPrinterService,
  ) {
    return service.checkConnection(printerName);
  }

  /**
   * Dispatches an invoice receipt printing job using the configured POS printer.
   * @param invoiceData - Data payload required to render the invoice receipt.
   * @param service - POS printer service instance.
   * @param store - Application configuration store instance.
   * @returns Result of the print execution job or an error response if unconfigured.
   */
  static async printInvoice(
    invoiceData: jobs.InvoiceReceiptData,
    service: PrinterService = defaultPrinterService,
    store = tchikAppStore,
  ) {
    const { posPrint } = store.getCurrentConfig();

    if (!posPrint?.posPrinter?.name) {
      return createErrorResponse(
        "POS Printer is not configured",
        HttpStatus.CONFLICT,
      );
    }

    return service.printReceipt(posPrint.posPrinter.name, async (printer) => {
      const result = await jobs.printInvoiceJob({
        printer,
        invoiceData,
      });

      return result.success;
    });
  }

  /**
   * Runs a test thermal print job using active school configuration details.
   * @param printerName - Name of the target printer to test.
   * @param service - POS printer service instance.
   * @param store - Application configuration store instance.
   * @param logger - Logger service instance for printing diagnostics.
   * @returns Execution result or structured IPC error response on failure.
   */
  static async testPrinter(
    printerName: string,
    service: PrinterService = defaultPrinterService,
    store = tchikAppStore,
    logger = defaultLogger,
  ) {
    const { currentSchool, currentStudyYear, posPrint } =
      store.getCurrentConfig();

    if (currentSchool && currentStudyYear && posPrint) {
      const result = await service.printReceipt(
        printerName,
        async (printer) => {
          await jobs.testThermalPrinterJob({
            printer,
            printerName,
            schoolName: currentSchool.name,
            yearName: currentStudyYear.yearName,
            schoolAddress: currentSchool.address,
            schoolTown: currentSchool.town,
            logger,
          });

          return true;
        },
      );

      if (result.success) {
        return result;
      }

      return createErrorResponse(result.message ?? "", HttpStatus.CONFLICT);
    }

    return createErrorResponse("Not configured", HttpStatus.CONFLICT);
  }

  /**
   * Generates and prints a PDF ticket from a generic payload.
   * @param payload - Receipt dataset and rendering parameters.
   * @returns PDF print execution result or structured error payload.
   */
  static printTicket(payload: Payload) {
    try {
      return printPdfReceipt(payload);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      return createErrorResponse(message, HttpStatus.CONFLICT);
    }
  }
}

/**
 * Backward-compatible export for standalone PDF ticket printing.
 * @param payload - Receipt dataset and rendering parameters.
 * @returns PDF print execution result or structured error payload.
 */
export function printTicket(payload: Payload) {
  return Printing.printTicket(payload);
}
