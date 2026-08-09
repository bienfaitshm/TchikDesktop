import {
  HttpStatus,
  createErrorResponse,
  HttpException,
} from "@/packages/electron-ipc-rest";
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
   * Fetches payment details and triggers a POS invoice receipt print job.
   * @param paymentPayload - Payment identifier and ticket reference details.
   * @param paymentRepo - Repository instance for student payment access.
   * @param service - POS printer service instance.
   * @param store - Application store instance.
   * @returns True if the print job succeeded.
   */
  static async printInvoice(
    paymentPayload: { paymentId: string; tickRef: string },
    paymentRepo: StudentPaymentRepository = studentPaymentRepository,
    service: PrinterService = defaultPrinterService,
    store = tchikAppStore,
  ) {
    const { posPrint, currentSchool, currentStudyYear } =
      store.getCurrentConfig();

    if (!currentSchool || !currentStudyYear) {
      throw new HttpException(
        "La configuration de l'école n'est pas faite !",
        HttpStatus.NOT_FOUND,
      );
    }

    if (!posPrint?.posPrinter?.name) {
      throw new HttpException(
        "L'imprimante POS n'est pas configurée !",
        HttpStatus.NOT_FOUND,
      );
    }

    const payment = paymentRepo.findById(paymentPayload.paymentId);
    if (!payment) {
      throw new HttpException("Paiement non trouvé !", HttpStatus.NOT_FOUND);
    }

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
   * @returns Execution result object.
   */
  static async testPrinter(
    printerName: string,
    service: PrinterService = defaultPrinterService,
    store = tchikAppStore,
    logger = defaultLogger,
  ) {
    const { currentSchool, currentStudyYear, posPrint } =
      store.getCurrentConfig();

    if (!currentSchool || !currentStudyYear || !posPrint) {
      throw new HttpException(
        "La configuration de l'école ou de l'imprimante est incomplète !",
        HttpStatus.NOT_FOUND,
      );
    }

    const result = await service.printReceipt(printerName, async (printer) => {
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
    });

    if (result.success) {
      return result;
    }

    return createErrorResponse(result.message ?? "", HttpStatus.CONFLICT);
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
        error instanceof Error
          ? error.message
          : "Une erreur inconnue est survenue";
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

/**
 * Constructs invoice payload structure from student payment DTO and school settings.
 * @param ticketRef - Unique ticket reference string.
 * @param paymentDto - Payment source details DTO.
 * @param school - Active school parameters object.
 * @returns Formatted invoice data object for thermal printer jobs.
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
    isPrinted: true,
  };
}
