/**
 * @description Stratégie d'export pour la mise en place (seating).
 */

import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { schoolYearIdBaseSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { createCotationDocumentExportForm } from "./form";
import { CotationDataResolver } from "./resolver";
import { extensions } from "./extension";
import { DocumentCategory } from "../../constants";

export class FicheCotationExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public readonly id = "FICHE_COTATION_EXPORT" as const;
  public readonly category = DocumentCategory.DATA_SCHOOL;

  public readonly displayName = "Fiche de cotation des eleves";
  public readonly description = "Génère les fiches de cotations par classe";

  public readonly validationSchema = schoolYearIdBaseSchema;

  constructor() {
    super({
      extensions,
      schemaCreator: generateValidationSchema,
      resolver: CotationDataResolver,
      extendWithFileTypeFormFields: createCotationDocumentExportForm,
    });
  }
}
