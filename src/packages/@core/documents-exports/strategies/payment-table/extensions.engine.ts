import type {
  SchoolInfo,
  StudentPaymentDTO,
} from "@/packages/@core/data-access/db";
import { ExportPdfExtension } from "@/packages/@core/documents-exports/extensions/pdf";

/**
 * Payload data structure required by the payment report PDF template.
 */
export interface PaymentReportPayload {
  school: SchoolInfo;
  payments: StudentPaymentDTO[];
}

/**
 * Handles PDF document generation for student payment reports.
 */
export class PaymentReportExportPdfExtension extends ExportPdfExtension {
  /**
   * Initializes the PDF export extension with its template path and localized description.
   */
  constructor() {
    super(
      "table-payment-report.hbs",
      "Génère le rapport de paiement des élèves au format PDF",
    );
  }
}
