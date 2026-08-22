import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { schoolYearIdBaseSchema } from "@/packages/@core/data-access/schema-validations";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { extensions } from "@/packages/@core/documents-exports/extensions/seatings-badge";
import { createSeatingBadgeExportForm } from "./form";
import {
  SeatingPresenceSessionDataResolver,
  SeatingResolverParams,
} from "./resolver";
import { DocumentCategory } from "../../constants";

type ExportPayload = SeatingResolverParams & {
  schoolId: string;
  yearId: string;
  fileType: DOCUMENT_EXTENSION;
  sessionId: string;
  nDays: number;
};

export class SeatingBadgeExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public category: string = DocumentCategory.DATA_SCHOOL;
  public readonly id = "SEATING_BADGE_EXPORT" as const;
  public readonly displayName = "Exportation des badges d'examen";
  public readonly description =
    "Générez et exportez les badges de participation pour les candidats aux examens.";

  public readonly validationSchema = schoolYearIdBaseSchema;
  constructor() {
    super({
      extensions,
      schemaCreator: generateValidationSchema,
      resolver: SeatingPresenceSessionDataResolver,
      extendWithFileTypeFormFields: createSeatingBadgeExportForm,
    });
  }
}
