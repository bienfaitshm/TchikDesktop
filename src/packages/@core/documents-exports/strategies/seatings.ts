/**
 * @description Stratégie d'export pour la mise en place (seating).
 */

import z from "zod";
import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import {
  ClassroomIds,
  ShoolRouteIds,
} from "@/packages/@core/data-access/data-system-access";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engins";

import {
  createSeatingFieldForm,
  type TCreateSeatingFormParams,
} from "./seatings.form-fields";

export class SeatingExportStrategy extends AbstractExportStrategy {
  public readonly id = "SEATING_EXPORT" as const;
  public readonly displayName = "Liste de la mise en place";
  public readonly description =
    "Génère un état détaillé de la répartition des élèves par salle. Cet export inclut les listes d'émargement, l'affectation aux pupitres et les métadonnées de l'établissement pour faciliter l'organisation physique des épreuves ou des cours.";

  public readonly validationSchema = z.object({});

  public readonly dataSourceDefinition = {
    classrooms: ClassroomIds.findAllClassroomsWithEnrollment,
    school: ShoolRouteIds.findSchoolById,
  } as const;

  constructor() {
    super({
      extensions: [new CsvExportExtension(), new JsonExportExtension()],
      getSchemasCreator: generateValidationSchema,
    });
  }

  public override async getFormFields(
    params: TCreateSeatingFormParams,
  ): Promise<FormFieldDef[]> {
    try {
      return await createSeatingFieldForm(params);
    } catch (error) {
      console.error("[SeatingExportStrategy] Error loading fields:", error);
      return [];
    }
  }
}
