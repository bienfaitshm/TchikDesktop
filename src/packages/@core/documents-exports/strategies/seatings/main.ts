/**
 * @description Stratégie d'export pour la mise en place (seating).
 */

import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { schoolYearIdBaseSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { extensions } from "@/packages/@core/documents-exports/extensions/seatings";
import { createSessionExportForm } from "./form";
import { SeatingSessionDataResolver } from "./resolver";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { DocumentCategory } from "../../constants";

type ExportPayload = {
  schoolId: string;
  yearId: string;
  fileType: DOCUMENT_EXTENSION;
  sessionId: string;
};

export class SeatingExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  ExportPayload,
  any
> {
  public readonly id = "SEATING_EXPORT" as const;
  public readonly category = DocumentCategory.DATA_SCHOOL;

  public readonly displayName = "Fiche de mise en place des examens";
  public readonly description =
    "Génère un état détaillé de la répartition des élèves par salle. Cet export inclut les listes d'émargement, l'affectation aux pupitres et les métadonnées de l'établissement pour faciliter l'organisation physique des épreuves ou des cours.";

  public readonly validationSchema = schoolYearIdBaseSchema;

  constructor() {
    super({
      extensions,
      schemaCreator: generateValidationSchema,
      resolver: SeatingSessionDataResolver,
      extendWithFileTypeFormFields: createSessionExportForm,
    });
  }
}
