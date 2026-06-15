import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { SchoolYearSchema } from "@/packages/@core/data-access/schema-validations";
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
  public readonly id = "SEATING_BADGE_EXPORT" as const;
  public readonly displayName = "Exportation des badges d'examen";
  public readonly description =
    "Générez et exportez les badges de participation pour les candidats aux examens.";

  public readonly validationSchema = SchoolYearSchema;
  constructor() {
    super({
      extensions,
      getSchemasCreator: generateValidationSchema,
    });
  }

  public override async getFormFields(
    params,
  ): Promise<readonly FormFieldDef[]> {
    return createSeatingBadgeExportForm({
      fileTypeFilters: this.extensionFilters,
      ...params,
    });
  }

  public override async resolveData(
    contextParams: ExportPayload,
  ): Promise<any> {
    return SeatingPresenceSessionDataResolver.resolveData(contextParams);
  }
}
