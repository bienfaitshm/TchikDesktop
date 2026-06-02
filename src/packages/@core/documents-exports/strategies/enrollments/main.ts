import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { SchoolYearSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { extensions } from "@/packages/@core/documents-exports/extensions/enrollments";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { EnrollmentDataResolver } from "./resolver";
import { createEnrollmentDocumentExportForm } from "./form";

type ExportPayload = {
  schoolId: string;
  yearId: string;
  fileType: DOCUMENT_EXTENSION;
  classId: string[];
};

/**
 * Stratégie concrète pour l'export des inscriptions.
 */
export class EnrollmentExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public readonly id = "ENROLLMENT_EXPORT";
  public readonly displayName = "Liste des Inscriptions";
  public readonly description =
    "Export complet des données d'inscription (élèves, classes, dates).";

  protected readonly validationSchema = SchoolYearSchema;

  constructor() {
    super({
      extensions,
      getSchemasCreator: (fields) => generateValidationSchema(fields as any),
    });
  }

  public override async getFormFields(
    params,
  ): Promise<readonly FormFieldDef[]> {
    return createEnrollmentDocumentExportForm({
      fileTypeFilters: this.extensionFilters,
      ...params,
    });
  }

  /**
   * Résolution des données. Ici, on transmet simplement les filtres validés.
   * Le processeur (Extension) se chargera de la transformation.
   */
  public override async resolveData({
    schoolId,
    yearId,
    classId,
  }: ExportPayload) {
    return EnrollmentDataResolver.resolveData({ classId, schoolId, yearId });
  }
}
