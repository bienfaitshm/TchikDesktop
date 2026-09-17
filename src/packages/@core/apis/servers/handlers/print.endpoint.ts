import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { PrinteToutes } from "../../routes-constant";
import {
  PrintInvoiceSchema,
  PrinterValueSchema,
  type PrinterValuePayload,
  type PrintInvoicePayload,
} from "@/packages/@core/data-access/schema-validations";
import { printingService } from "@/packages/@core/printing";

/* =========================================================================
   CONTROLLER IMPLEMENTATION
   ========================================================================= */

/**
 * Controller handling inbound IPC requests for system printers and receipt printing operations.
 */
export class PrinterController {
  /**
   * Retrieves all system printers installed on the host machine.
   * @returns A promise resolving to the list of available system printers.
   */
  @IpcServer.register(HttpMethod.GET, PrinteToutes.GET_PRINTERS)
  static async getPrinters({}: IpcRequest<unknown>) {
    return printingService.getPrinters();
  }

  /**
   * Verifies the connection and operational status of a specific printer.
   * @param request - IPC request containing the target printer name payload.
   * @returns A promise resolving to the printer connection status result.
   */
  @IpcServer.register(HttpMethod.POST, PrinteToutes.CHECK_PRINTER, {
    body: PrinterValueSchema,
  })
  static async checkPrinter({ body }: IpcRequest<PrinterValuePayload>) {
    return printingService.checkPrinter(body.value);
  }

  /**
   * Processes and prints an invoice or payment receipt from ticket data.
   * @param request - IPC request containing validated ticket details.
   * @returns A promise resolving to the receipt printing execution result.
   */
  @IpcServer.register(HttpMethod.POST, PrinteToutes.PRINT_RECEIPT, {
    body: PrintInvoiceSchema,
  })
  static async printReceipt({ body }: IpcRequest<PrintInvoicePayload>) {
    return printingService.printInvoice(body);
  }

  /**
   * Dispatches a test page print job to a target thermal printer.
   * @param request - IPC request containing the target printer name payload.
   * @returns A promise resolving to the test printing execution result.
   */
  @IpcServer.register(HttpMethod.POST, PrinteToutes.PRINT_TEST, {
    body: PrinterValueSchema,
  })
  static async testPrinter({ body }: IpcRequest<PrinterValuePayload>) {
    return printingService.testPrinter(body.value);
  }
}
