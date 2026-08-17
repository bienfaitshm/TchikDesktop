import { HttpStatus, HttpException } from "@/packages/electron-ipc-rest";
import {
  getLogger as createLogger,
  type CustomLogger as Logger,
} from "@/packages/logger";
import {
  printPdfReceipt,
  Payload,
  jobs,
  PrinterService,
  ActionResult,
} from "@/packages/pos-printer";
import { schoolInfoService } from "@/packages/@core/data-access/db/queries";
import { tchikAppStore } from "@/packages/@core/data-access/stores";
import type { ClassConstructor } from "@/packages/handler-factory";
import { PrintInvoiceService, IPrintInvoiceJob } from "./print-register";
import { EnrollmentInvoice } from "./enrollment-invoice-pos";
import { PaymentInvoice } from "./payment-invoice-pos";
import type { PrintInvoicePayload } from "@/packages/@core/data-access/schema-validations";

const defaultLogger = createLogger("PRINTING SERVICES");

/**
 * Service orchestrating thermal POS and PDF document printing operations.
 */
export class PrintingService {
  private readonly printerService: PrinterService;
  private readonly printInvoiceService: PrintInvoiceService;
  private readonly appStore: typeof tchikAppStore;

  /**
   * Initializes a new instance of PrintingService with injectable dependencies.
   * @param printerService - Hardware printer service instance.
   * @param printInvoiceService - Service responsible for processing invoice receipts.
   * @param appStore - Application store managing current configuration state.
   */
  constructor(
    printerService: PrinterService,
    printInvoiceService: PrintInvoiceService,
    appStore = tchikAppStore,
  ) {
    this.printerService = printerService;
    this.printInvoiceService = printInvoiceService;
    this.appStore = appStore;
  }

  /**
   * Retrieves all available OS-installed printers on the host system.
   * @returns Array of system printers detected on the host machine.
   */
  public async getPrinters(): Promise<unknown[]> {
    return this.printerService.getSystemPrinters();
  }

  /**
   * Checks connection status for a target printer by system name.
   * @param printerName - Target system printer identifier.
   * @returns Connection status outcome object.
   */
  public async checkPrinter(printerName: string): Promise<ActionResult> {
    return this.printerService.checkConnection(printerName);
  }

  /**
   * Fetches payment details and triggers a POS invoice receipt print job.
   * @param paymentPayload - Identifier and ticket reference for the payment.
   */
  public async printInvoice(
    paymentPayload: PrintInvoicePayload,
  ): Promise<void> {
    await this.printInvoiceService.printInvoice(
      paymentPayload,
      this.printerService,
      this.appStore,
    );
  }

  /**
   * Executes a test thermal print job using current school configuration.
   * @param printerName - Target printer name for the test.
   * @param logger - Diagnostic logger instance.
   * @returns Print result object indicating execution outcome.
   */
  public async testPrinter(
    printerName: string,
    logger: Logger = defaultLogger,
  ): Promise<ActionResult> {
    const { currentSchool, currentStudyYear, posPrint } =
      this.appStore.getCurrentConfig();

    if (!currentSchool || !currentStudyYear || !posPrint) {
      throw new HttpException(
        "School or printer configuration is incomplete.",
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      const result = await this.printerService.printReceipt(
        printerName,
        async (printer) => {
          await jobs.testThermalPrinterJob({
            printer,
            printerName,
            schoolName: currentSchool.name,
            yearName: currentStudyYear.yearName,
            schoolAddress: currentSchool.address ?? currentSchool.name,
            schoolTown: currentSchool.town ?? "",
            logger,
          });

          return true;
        },
      );

      if (!result.success) {
        throw new HttpException(
          result.message ?? "An error occurred during printer testing.",
          HttpStatus.CONFLICT,
        );
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message =
        error instanceof Error
          ? error.message
          : "An unknown error occurred during printer testing.";
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generates and prints a PDF ticket from a payload.
   * @param payload - Printable PDF dataset parameters.
   * @returns PDF print job execution result.
   */
  public async printTicket(payload: Payload): Promise<unknown> {
    try {
      return await printPdfReceipt(payload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unknown error occurred while printing PDF ticket.";
      throw new HttpException(message, HttpStatus.CONFLICT);
    }
  }
}

const defaultPrinterService = new PrinterService({
  logger: defaultLogger,
});

const invoices: ClassConstructor<IPrintInvoiceJob>[] = [
  PaymentInvoice,
  EnrollmentInvoice,
];

const printInvoiceService = new PrintInvoiceService(
  invoices,
  schoolInfoService,
);

export const printingService = new PrintingService(
  defaultPrinterService,
  printInvoiceService,
);
