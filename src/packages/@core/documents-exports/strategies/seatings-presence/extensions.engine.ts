import {
  ExportDocxExtension,
  // SheetExportExtension,
} from "@/packages/@core/documents-exports/extensions";
import { DocxReportGeneratorService } from "@/packages/document-template";
import type { SchoolInfo } from "@/packages/@core/data-access/db";

import type {
  SeatingSessionGrouped,
  Assignment,
} from "@/packages/@core/data-access/db";

export type Student = Assignment;

export interface SeatingReportPayload {
  school: SchoolInfo;
  assignment: SeatingSessionGrouped;
}

export class SeatingPresenceExportDocxExtension extends ExportDocxExtension<SeatingReportPayload> {
  /**
   * Initializes the DOCX extension with default template settings.
   * @param reportGenerator - Optional custom report generator service for testing or overrides.
   */
  constructor(reportGenerator?: DocxReportGeneratorService) {
    super(
      "seating-presence.docx",
      "Génère les fiches de presences de mise en place par local",
      reportGenerator,
    );
  }
}
