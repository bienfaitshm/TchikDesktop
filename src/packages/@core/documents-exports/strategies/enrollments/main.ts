import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { schoolYearIdBaseSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { DocumentCategory } from "@/packages/@core/documents-exports/constants";
import { EnrollmentDataResolver } from "./resolver";
import { extensions } from "./extensions";
import { createEnrollmentDocumentExportForm } from "./form";

/**
 * Stratégie concrète pour l'export des inscriptions.
 */
export class EnrollmentExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public readonly id = "ENROLLMENT_EXPORT";
  public readonly category = DocumentCategory.DATA_SCHOOL;
  public readonly displayName = "Liste des Inscriptions";
  public readonly description =
    "Export complet des données d'inscription (élèves, classes, dates).";

  protected readonly validationSchema = schoolYearIdBaseSchema;

  constructor() {
    super({
      extensions,
      schemaCreator: generateValidationSchema,
      resolver: EnrollmentDataResolver,
      extendWithFileTypeFormFields: createEnrollmentDocumentExportForm,
    });
  }
}
