/**
 * @description Stratégie d'export pour la mise en place (seating).
 */

import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { SchoolYearSchema } from "@/packages/@core/data-access/schema-validations";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import {
  ClassroomIds,
  ShoolRouteIds,
} from "@/packages/@core/data-access/data-system-access";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { extensions } from "@/packages/@core/documents-exports/extensions/seating-presence";
import { createSeatingPresenceExportForm } from "./form";
import { SeatingSessionDataResolver } from "./resolver";

type ExportPayload = {
  schoolId: string;
  yearId: string;
  fileType: DOCUMENT_EXTENSION;
  sessionId: string;
  nDays: number;
};

export class SeatingPresenceExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public readonly id = "SEATING_PRESENCE_EXPORT" as const;
  public readonly displayName = "Fiche de présence des examens";
  public readonly description =
    "Génère la liste de présence pour la mise en place des examens.";

  public readonly validationSchema = SchoolYearSchema;

  public readonly dataSourceDefinition = {
    classrooms: ClassroomIds.findAllClassroomsWithEnrollment,
    school: ShoolRouteIds.findSchoolById,
  } as const;

  constructor() {
    super({
      extensions,
      getSchemasCreator: generateValidationSchema,
    });
  }

  public override async getFormFields(
    params,
  ): Promise<readonly FormFieldDef[]> {
    return createSeatingPresenceExportForm({
      fileTypeFilters: this.extensionFilters,
      ...params,
    });
  }

  public override async resolveData(
    contextParams: ExportPayload,
  ): Promise<any> {
    return SeatingSessionDataResolver.resolveData(contextParams);
  }
}
