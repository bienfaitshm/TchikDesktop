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
import { extentions } from "@/packages/@core/documents-exports/extensions/cotations";
import { createCotationDocumentExportForm } from "./form";
import { CotationDataResolver } from "./resolver";
import type { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";

type ExportPayload = {
  schoolId: string;
  yearId: string;
  classId: string[];
  section: SECTION_ENUM;
  fileType: DOCUMENT_EXTENSION;
};

export class FicheCotationExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public readonly id = "FICHE_COTATION_EXPORT" as const;
  public readonly displayName = "Fiche de cotation des eleves";
  public readonly description = "Génère les fiches de cotations par classe";

  public readonly validationSchema = SchoolYearSchema;

  public readonly dataSourceDefinition = {
    classrooms: ClassroomIds.findAllClassroomsWithEnrollment,
    school: ShoolRouteIds.findSchoolById,
  } as const;

  constructor() {
    super({
      extensions: extentions,
      getSchemasCreator: generateValidationSchema,
    });
  }

  public override async getFormFields(
    params,
  ): Promise<readonly FormFieldDef[]> {
    return createCotationDocumentExportForm({
      fileTypeFilters: this.extensionFilters,
      ...params,
    });
  }

  /**
   * Résolution des données. Ici, on transmet simplement les filtres validés.
   * Le processeur (Extension) se chargera de la transformation.
   */
  public override async resolveData(payload: ExportPayload) {
    if (payload.classId.length === 0) {
      throw new Error("Aucune classe sélectionnée pour l'export.");
    }
    return CotationDataResolver.resolveData(payload);
  }
}
