/**
 * @description Stratégie d'export pour la mise en place (seating).
 */

import {
  AbstractExportStrategy,
  ServiceResult,
} from "@/packages/electron-data-exporter";
import { SchoolYearSchema } from "@/packages/@core/data-access/schema-validations";
import {
  ClassroomIds,
  ShoolRouteIds,
} from "@/packages/@core/data-access/data-system-access";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engines";

import {
  createSeatingFieldForm,
  type TCreateSeatingFormParams,
} from "./seatings.form-fields";
import { prependFileTypeField } from "./base.form-fields";
import { SeatingDataResolver } from "./seating.data-resolver";
import {
  type ExportPayload,
  SeatingPlanBySheetExcelExportExtension,
} from "../extensions/seatings";

export class SeatingExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  ExportPayload
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
      extensions: [
        new SeatingPlanBySheetExcelExportExtension(),
        new JsonExportExtension(),
        new CsvExportExtension(),
      ],
      getSchemasCreator: generateValidationSchema,
    });
  }

  public override async getFormFields(params): Promise<FormFieldDef[]> {
    try {
      const fields = await createSeatingFieldForm(params);
      return prependFileTypeField(fields, this.extensionFilters, {
        colSpan: 6,
      });
    } catch (error) {
      throw new Error(
        `[${this.id}] Impossible de charger les options d'export.`,
      );
    }
  }

  /**
   * Résolution des données. Ici, on transmet simplement les filtres validés.
   * Le processeur (Extension) se chargera de la transformation.
   */
  public override async resolveData(
    contextParams: TCreateSeatingFormParams,
  ): Promise<ServiceResult<any>> {
    try {
      const resolvedData = await SeatingDataResolver.resolveData(contextParams);

      return {
        success: true,
        data: resolvedData,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATA_FETCH_ERROR",
          message: error instanceof Error ? error.message : "Erreur inconnue",
          details: error instanceof Error ? error.message : "Erreur inconnue",
        },
      };
    }
  }
}
