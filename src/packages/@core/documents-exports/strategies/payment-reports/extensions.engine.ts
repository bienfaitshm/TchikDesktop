import { ExportDocxExtension } from "@/packages/@core/documents-exports/extensions";
import { DocxReportGeneratorService } from "@/packages/document-template";
import type { SchoolInfo } from "@/packages/@core/data-access/db";

import type { StudentPaymentDTO } from "@/packages/@core/data-access/db";

export interface PaymentReportPayload {
  school: SchoolInfo;
  assignment: StudentPaymentDTO;
}

export class PaymentPresenceExportDocxExtension extends ExportDocxExtension<PaymentReportPayload> {
  constructor(reportGenerator?: DocxReportGeneratorService) {
    super(
      "payment-report.docx",
      "Génère les fiches de presences de mise en place par local",
      reportGenerator,
    );
  }
}
