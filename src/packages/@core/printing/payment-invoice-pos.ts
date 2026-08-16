import { PrinterThermal, ActionResult } from "@/packages/pos-printer";
import {
  StudentPaymentDTO,
  studentPaymentRepository,
  StudentPaymentRepository,
} from "@/packages/@core/data-access/db/queries";
import { formatDate } from "@/packages/times";
import type { IPrintInvoiceJob, Payload } from "./print-register";
import {
  printDivider,
  printKeyValueRow,
  printText,
  printTitle,
} from "./invoice-pos";

/**
 * Structured payment invoice data prepared for thermal receipt printing.
 */
export interface PaymentInvoiceData {
  classroomName: string;
  studentCode: string;
  ticketRef: string;
  schoolName: string;
  address?: string;
  schoolTown?: string;
  studentName: string;
  feeTypeName: string;
  scheduleName: string;
  status: string;
  currency: string;
  amountPaid: number;
  totalDue: number;
  yearName: string;
  paymentMethod: string;
  transactionReference: string | null;
  date: string;
  hour: string;
}

/**
 * Handles thermal receipt printing strategy for student payment invoices.
 */
export class PaymentInvoice implements IPrintInvoiceJob {
  public readonly invoiceCode: string = "payment";
  private readonly paymentRepository: StudentPaymentRepository;

  /**
   * Initializes the PaymentInvoice print job with a student payment repository.
   * @param paymentRepository - Repository instance for retrieving student payment details.
   */
  constructor(
    paymentRepository: StudentPaymentRepository = studentPaymentRepository,
  ) {
    this.paymentRepository = paymentRepository;
  }

  /**
   * Resolves student payment entity by its unique identifier.
   * @param paymentId - Unique payment record identifier.
   * @returns Resolved student payment DTO.
   * @throws Error if payment record is not found.
   */
  public resolveData(paymentId: string): StudentPaymentDTO {
    const payment = this.paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error(
        `Student payment record with ID "${paymentId}" not found.`,
      );
    }
    return payment;
  }

  /**
   * Renders and prints the thermal receipt for a student payment invoice.
   * @param printer - Active thermal printer instance.
   * @param invoiceRef - Unique receipt reference string.
   * @param payload - Payload containing student payment DTO and school metadata.
   * @returns Result indicating success or failure of the printing job.
   */
  public async job(
    printer: PrinterThermal,
    invoiceRef: string,
    payload: Payload<StudentPaymentDTO>,
  ): Promise<ActionResult> {
    const invoiceData = createInvoiceData(invoiceRef, payload);

    try {
      // 1. Header Section

      printTitle(printer, invoiceData.schoolName);
      printer.align("CT");
      if (invoiceData.address) {
        printText(printer, invoiceData.address);
      }
      if (invoiceData.schoolTown) {
        printText(printer, invoiceData.schoolTown);
      }
      printer.align("CT");
      printText(printer, invoiceData.yearName);
      printTitle(printer, "REÇU DE PAIEMENT");
      printer.align("LT");

      printDivider(printer);

      // 2. Metadata Section
      printKeyValueRow(
        printer,
        `Date: ${invoiceData.date}`,
        `Heure: ${invoiceData.hour}`,
      );
      printText(printer, `Réf: ${invoiceData.ticketRef.toUpperCase()}`);
      printDivider(printer);

      // 3. Student Information Section
      printKeyValueRow(printer, "NOM :", invoiceData.studentName);
      printKeyValueRow(printer, "CODE :", invoiceData.studentCode);
      printKeyValueRow(printer, "CLASSE :", invoiceData.classroomName);
      printDivider(printer);

      // 4. Fee and Payment Details Section
      printText(printer, "DÉSIGNATION");
      printKeyValueRow(
        printer,
        invoiceData.feeTypeName,
        `${invoiceData.amountPaid} ${invoiceData.currency}`,
      );
      printText(printer, `[${invoiceData.scheduleName}]`);
      printDivider(printer);

      // 5. Total Paid Section
      printKeyValueRow(
        printer,
        "TOTAL PAYÉ",
        `${invoiceData.amountPaid} ${invoiceData.currency}`,
      );
      printDivider(printer);

      // 6. Footer Notice
      printer.align("CT");
      printText(printer, "- MERCI DE VOTRE VISITE -");

      printer.feed(1);
      printer.cut();

      return {
        success: true,
        message: "Facture imprimée avec succès.",
      };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Échec de l'impression de la facture : ${detail}`,
      };
    }
  }
}

/**
 * Normalizes payment record and school metadata into a structured invoice dataset.
 * @param ticketRef - Unique ticket reference identifier.
 * @param payload - Student payment DTO with embedded school information.
 * @returns Formatted payment invoice dataset.
 */
function createInvoiceData(
  ticketRef: string,
  {
    student,
    feeSchedule,
    classroom,
    feeAssigment,
    enrollment,
    schoolInfo,
    ...studentPayment
  }: Payload<StudentPaymentDTO>,
): PaymentInvoiceData {
  return {
    address: schoolInfo.address,
    schoolName: schoolInfo.name,
    yearName: schoolInfo.studyYear.yearName,
    schoolTown: schoolInfo.town,
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
