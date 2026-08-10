import { HttpStatus, HttpException } from "@/packages/electron-ipc-rest";
import { getLogger as createLogger } from "@/packages/logger";
import {
  printPdfReceipt,
  Payload,
  jobs,
  PrinterService,
} from "@/packages/pos-printer";
import { tchikAppStore } from "@/packages/@core/data-access/stores";
import {
  type StudentPaymentRepository,
  type StudentPaymentDTO,
  studentPaymentRepository,
} from "@/packages/@core/data-access/db";
import { formatDate } from "@/packages/times";

const defaultLogger = createLogger("PRINTING SERVICES");
const defaultPrinterService = new PrinterService({
  logger: defaultLogger,
});

/**
 * Service orchestrating POS and PDF document printing operations.
 */
export class PrintingService {
  private readonly printerService: PrinterService;
  private readonly paymentRepository: StudentPaymentRepository;
  private readonly appStore: typeof tchikAppStore;

  /**
   * Initializes a new instance of PrintingService with injectable dependencies.
   * @param printerService - Hardware printer service instance.
   * @param paymentRepository - Repository for accessing payment data.
   * @param appStore - Application store managing current configuration state.
   */
  constructor(
    printerService: PrinterService = defaultPrinterService,
    paymentRepository: StudentPaymentRepository = studentPaymentRepository,
    appStore = tchikAppStore,
  ) {
    this.printerService = printerService;
    this.paymentRepository = paymentRepository;
    this.appStore = appStore;
  }

  /**
   * Retrieves all available OS-installed printers on the host system.
   * @returns Array of system printers detected on the machine.
   */
  async getPrinters() {
    return this.printerService.getSystemPrinters();
  }

  /**
   * Checks connection status for a target printer by system name.
   * @param printerName - Target system printer identifier.
   * @returns Connection status outcome object.
   */
  async checkPrinter(printerName: string) {
    return this.printerService.checkConnection(printerName);
  }

  /**
   * Fetches payment details and triggers a POS invoice receipt print job.
   * @param paymentPayload - Identifier and ticket reference for the payment.
   * @returns True if the print job succeeded.
   */
  async printInvoice(paymentPayload: {
    paymentId: string;
    tickRef: string;
  }): Promise<boolean> {
    const { posPrint, currentSchool, currentStudyYear } =
      this.appStore.getCurrentConfig();

    if (!currentSchool || !currentStudyYear) {
      throw new HttpException(
        "La configuration de l'école n'est pas faite !",
        HttpStatus.NOT_FOUND,
      );
    }

    if (!posPrint?.posPrinter) {
      throw new HttpException(
        "L'imprimante POS n'est pas configurée !",
        HttpStatus.NOT_FOUND,
      );
    }

    const payment = this.paymentRepository.findById(paymentPayload.paymentId);
    if (!payment) {
      throw new HttpException("Paiement non trouvé !", HttpStatus.NOT_FOUND);
    }

    try {
      const invoiceData: jobs.InvoiceReceiptData = createInvoiceData(
        paymentPayload.tickRef,
        payment,
        {
          name: currentSchool.name,
          town: currentSchool.town,
          address: currentSchool.address,
          yearName: currentStudyYear.yearName,
        },
      );

      const result = await this.printerService.printReceipt(
        posPrint.posPrinter.value,
        async (printer) => {
          const printJobResult = await jobs.printInvoiceJob({
            printer,
            invoiceData,
          });
          return printJobResult.success;
        },
      );

      return result.success;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const message =
        error instanceof Error
          ? error.message
          : "Il y a eu une erreur lors de l'impression";
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Executes a test thermal print job using current school configuration.
   * @param printerName - Target printer name for the test.
   * @param logger - Diagnostic logger instance.
   * @returns Print result object.
   */
  async testPrinter(printerName: string, logger = defaultLogger) {
    const { currentSchool, currentStudyYear, posPrint } =
      this.appStore.getCurrentConfig();

    if (!currentSchool || !currentStudyYear || !posPrint) {
      throw new HttpException(
        "La configuration de l'école ou de l'imprimante est incomplète !",
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
          result.message ?? "Erreur lors du test de l'imprimante",
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
          : "Il y a eu une erreur lors du test de l'imprimante";
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Generates and prints a PDF ticket from a payload.
   * @param payload - Printable PDF dataset parameters.
   * @returns PDF print job execution result.
   */
  printTicket(payload: Payload) {
    try {
      return printPdfReceipt(payload);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue";
      throw new HttpException(message, HttpStatus.CONFLICT);
    }
  }
}

/**
 * Normalizes payment record and school metadata into an invoice payload.
 * @param ticketRef - Ticket reference identifier.
 * @param paymentDto - Source student payment object.
 * @param school - Active school parameter details.
 * @returns Formatted thermal invoice dataset.
 */
function createInvoiceData(
  ticketRef: string,
  {
    student,
    feeSchedule,
    classroom,
    feeAssigment,
    enrollment,
    ...studentPayment
  }: StudentPaymentDTO,
  school: { address?: string; name: string; town: string; yearName: string },
): jobs.InvoiceReceiptData {
  return {
    address: school.address ?? school.name,
    schoolName: school.name,
    yearName: school.yearName,
    schoolTown: school.town,
    studentCode: enrollment.studentCode,
    studentName: student.fullName,
    classroomName: classroom.shortIdentifier,
    currency: studentPayment.currencyReceived,
    amountPaid: studentPayment.amountReceived,
    totalDue: feeAssigment.totalAmount,
    feeTypeName: studentPayment.feeType.name,
    scheduleName: feeSchedule.installmentName,
    paymentMethod: studentPayment.paymentMethod,
    status: feeAssigment.status,
    ticketRef: ticketRef,
    date: formatDate(studentPayment.createdAt),
    hour: formatDate(studentPayment.createdAt, "HH:mm"),
    transactionReference: studentPayment.transactionReference,
  };
}

export const printingService = new PrintingService();
