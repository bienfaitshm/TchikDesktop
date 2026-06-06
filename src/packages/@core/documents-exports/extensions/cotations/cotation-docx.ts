import {
  AbstractExportExtension,
  RawFileContent,
} from "@/packages/electron-data-exporter";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { generateDocxReport } from "@/packages/document-template";
import type {
  TEnrolement,
  TSchool,
  TUser,
  TStudyYear,
  TClassroom,
} from "@/packages/@core/data-access/db/schemas/types";

type EnrollmentWithStudent = TEnrolement & { student: TUser };

export interface CotationReportPayload extends TSchool {
  studyYear: TStudyYear;
  classrooms: (TClassroom & { enrollments: EnrollmentWithStudent[] })[];
}

/**
 * Extension responsable de la génération des fiches de cotation.
 */
export class CotationReportExportDocxExtension extends AbstractExportExtension<CotationReportPayload> {
  readonly extension = DOCUMENT_EXTENSION.DOCX;
  readonly description = "Génère les fiches de cotation par salle";

  private readonly TEMPLATE_NAME = "cotations-secondary.docx";

  public async process(
    payload: CotationReportPayload,
  ): Promise<RawFileContent> {
    return generateDocxReport({
      templateName: this.TEMPLATE_NAME,
      templateData: payload,
    });
  }
}
