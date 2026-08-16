import { PrinterThermal, ActionResult } from "@/packages/pos-printer";
import {
  EnrollmentDTO,
  enrollmentRepository,
  EnrollmentRepository,
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
 * Guardian contact details prepared for receipt output.
 */
export interface GuardianInvoiceData {
  name?: string;
  phone?: string;
  address?: string;
}

/**
 * Structured enrollment invoice data prepared for thermal receipt printing.
 */
export interface EnrollmentInvoiceData {
  schoolName: string;
  address?: string;
  schoolTown?: string;
  yearName: string;
  ticketRef: string;
  date: string;
  hour: string;
  studentName: string;
  studentCode: string;
  classroomName?: string;
  guardian?: GuardianInvoiceData;
  //   feeTypeName: string;
  //   scheduleName?: string;
  //   amountPaid: number;
  //   currency: string;
  //   paymentMethod: string;
  //   transactionReference: string | null;
}

/**
 * Handles thermal receipt printing strategy for student enrollment invoices.
 */
export class EnrollmentInvoice implements IPrintInvoiceJob {
  public readonly invoiceCode: string = "enrollment";
  private readonly enrollmentRepository: EnrollmentRepository;

  /**
   * Initializes the EnrollmentInvoice print job with an enrollment repository.
   * @param enrollmentRepo - Repository instance for retrieving enrollment details.
   */
  constructor(enrollmentRepo: EnrollmentRepository = enrollmentRepository) {
    this.enrollmentRepository = enrollmentRepo;
  }

  /**
   * Resolves student enrollment entity by its unique identifier.
   * @param enrollmentId - Unique enrollment record identifier.
   * @returns Resolved enrollment DTO.
   * @throws Error if enrollment record is not found.
   */
  public resolveData(enrollmentId: string): EnrollmentDTO {
    const enrollment = this.enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new Error(
        `Student enrollment record with ID "${enrollmentId}" not found.`,
      );
    }
    return enrollment;
  }

  /**
   * Renders and prints the thermal receipt for a student enrollment invoice.
   * @param printer - Active thermal printer instance.
   * @param invoiceRef - Unique receipt reference string.
   * @param payload - Payload containing enrollment DTO and school metadata.
   * @returns Result indicating success or failure of the printing job.
   */
  public async job(
    printer: PrinterThermal,
    invoiceRef: string,
    payload: Payload<EnrollmentDTO>,
  ): Promise<ActionResult> {
    const invoiceData = createInvoiceData(invoiceRef, payload);

    try {
      // 1. Header Section
      printTitle(printer, invoiceData.schoolName);
      if (invoiceData.address) {
        printText(printer, invoiceData.address);
      }
      if (invoiceData.schoolTown) {
        printText(printer, invoiceData.schoolTown);
      }
      printText(printer, invoiceData.yearName);
      printTitle(printer, "REÇU D'INSCRIPTION");
      printDivider(printer);

      // 2. Metadata Section
      printKeyValueRow(
        printer,
        `Date: ${invoiceData.date}`,
        `Heure: ${invoiceData.hour}`,
      );
      printText(printer, `Réf: ${invoiceData.ticketRef.toUpperCase()}`);
      printDivider(printer);

      // 3. Student Identity Section
      printText(printer, "IDENTITÉ DE L'ÉLÈVE");
      printKeyValueRow(printer, "NOM :", invoiceData.studentName);
      printKeyValueRow(printer, "CODE :", invoiceData.studentCode);
      if (invoiceData.classroomName) {
        printKeyValueRow(printer, "CLASSE :", invoiceData.classroomName);
      }

      // 4. Guardian Identity Section (Conditional)
      if (invoiceData.guardian) {
        printDivider(printer);
        printText(printer, "IDENTITÉ DU TUTEUR");
        if (invoiceData.guardian.name) {
          printKeyValueRow(printer, "NOM :", invoiceData.guardian.name);
        }
        if (invoiceData.guardian.phone) {
          printKeyValueRow(printer, "TÉL :", invoiceData.guardian.phone);
        }
        if (invoiceData.guardian.address) {
          printKeyValueRow(printer, "ADRESSE :", invoiceData.guardian.address);
        }
      }
      printDivider(printer);

      // 5. Fee and Payment Details Section
      //   printText(printer, "DÉSIGNATION");
      //   printKeyValueRow(
      //     printer,
      //     invoiceData.feeTypeName,
      //     `${invoiceData.amountPaid} ${invoiceData.currency}`
      //   );
      //   if (invoiceData.scheduleName) {
      //     printText(printer, `[${invoiceData.scheduleName}]`);
      //   }
      //   printDivider(printer);

      //   // 6. Total Paid Section
      //   printKeyValueRow(
      //     printer,
      //     "TOTAL PAYÉ",
      //     `${invoiceData.amountPaid} ${invoiceData.currency}`
      //   );
      printDivider(printer);

      // 7. Footer Notice
      printer.align("CT");
      printText(
        printer,
        "Merci d'avoir renouvelé votre confiance en notre établissement pour la formation de vos enfants.",
      );

      printer.feed(1);
      printer.cut();

      return {
        success: true,
        message: "Facture d'inscription imprimée avec succès.",
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
 * Normalizes enrollment record and school metadata into a structured invoice dataset.
 * @param ticketRef - Unique ticket reference identifier.
 * @param payload - Enrollment DTO payload containing student, tutor, and school metadata.
 * @returns Formatted enrollment invoice dataset.
 */
function createInvoiceData(
  ticketRef: string,
  payload: Payload<EnrollmentDTO>,
): EnrollmentInvoiceData {
  const { student, classroom, tutor, schoolInfo, ...enrollment } = payload;

  const guardian: GuardianInvoiceData | undefined = tutor
    ? {
        name: tutor.fullName ?? tutor.lastName,
        phone: tutor.phoneNumber ?? "-",
        address: tutor.address ?? "-",
      }
    : undefined;

  return {
    schoolName: schoolInfo.name,
    address: schoolInfo.address,
    schoolTown: schoolInfo.town,
    yearName: schoolInfo.studyYear.yearName,
    ticketRef: ticketRef,
    date: formatDate(enrollment.createdAt),
    hour: formatDate(enrollment.createdAt, "HH:mm"),
    studentName: student.fullName ?? student.lastName,
    studentCode: enrollment.studentCode ?? "-",
    classroomName: classroom?.shortIdentifier ?? "-",
    guardian: guardian,
    // feeTypeName: feeType?.name ?? "Frais d'inscription",
    // scheduleName: feeSchedule?.installmentName,
    // amountPaid: enrollment.amountReceived ?? enrollment.amountPaid ?? 0,
    // currency: enrollment.currencyReceived ?? "FC",
    // paymentMethod: enrollment.paymentMethod ?? "CASH",
    // transactionReference: enrollment.transactionReference ?? null,
  };
}
