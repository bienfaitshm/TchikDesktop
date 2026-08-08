import z from "zod";
import {
  HttpMethod,
  IpcServer,
  type IpcRequest,
} from "@/packages/electron-ipc-rest";
import { PrinteToutes } from "../../routes-constant";
import {
  Ticket,
  TicketSchema,
} from "@/packages/@core/data-access/schema-validations";
import { Printing } from "@/packages/@core/printing";
import { defaultPrinterManagementService } from "@/packages/electron-utility";

/**
 * Validation schema for checking printer connectivity status.
 */
export const PrinterNameSchema = z.object({
  printerName: z.string().min(1, "Printer name is required"),
});

export type PrinterNamePayload = z.infer<typeof PrinterNameSchema>;

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
  static async getPrinters({ context: { window } }: IpcRequest<unknown>) {
    return Printing.getPrinters();
  }

  /**
   * Verifies the connection and operational status of a specific printer.
   * @param request - IPC request containing the target printer name payload.
   * @returns A promise resolving to the printer connection status result.
   */
  @IpcServer.register(HttpMethod.POST, PrinteToutes.CHECK_PRINTER, {
    body: PrinterNameSchema,
  })
  static async checkPrinter({ body }: IpcRequest<PrinterNamePayload>) {
    return Printing.checkPrinter(body.printerName);
  }

  /**
   * Processes and prints an invoice or payment receipt from ticket data.
   * @param request - IPC request containing validated ticket details.
   * @returns A promise resolving to the receipt printing execution result.
   */
  @IpcServer.register(HttpMethod.POST, PrinteToutes.PRINT_RECEIPT, {
    body: TicketSchema,
  })
  static async printReceipt({ body }: IpcRequest<Ticket>) {
    return Printing.printInvoice(body);
  }

  /**
   * Dispatches a test page print job to a target thermal printer.
   * @param request - IPC request containing the target printer name payload.
   * @returns A promise resolving to the test printing execution result.
   */
  @IpcServer.register(HttpMethod.POST, PrinteToutes.PRINT_TEST, {
    body: PrinterNameSchema,
  })
  static async testPrinter({ body }: IpcRequest<PrinterNamePayload>) {
    return Printing.testPrinter(body.printerName);
  }
}
