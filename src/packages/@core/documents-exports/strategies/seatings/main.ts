/**
 * @description Stratégie d'export pour la mise en place (seating).
 */

import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { SchoolYearSchema } from "@/packages/@core/data-access/schema-validations";
import {
  ClassroomIds,
  ShoolRouteIds,
} from "@/packages/@core/data-access/data-system-access";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { extensions } from "@/packages/@core/documents-exports/extensions/seatings";
import { createSeatingSessionExportForm } from "./form";
import { SeatingSessionDataResolver } from "./resolver";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";

type ExportPayload = {
  schoolId: string;
  yearId: string;
  fileType: DOCUMENT_EXTENSION;
  sessionId: string;
};

export class SeatingExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public readonly id = "SEATING_EXPORT" as const;
  public readonly displayName = "Liste de la mise en place";
  public readonly description =
    "Génère un état détaillé de la répartition des élèves par salle. Cet export inclut les listes d'émargement, l'affectation aux pupitres et les métadonnées de l'établissement pour faciliter l'organisation physique des épreuves ou des cours.";

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
    return createSeatingSessionExportForm({
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
