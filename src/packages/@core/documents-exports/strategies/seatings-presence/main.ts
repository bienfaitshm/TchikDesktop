/**
 * @description Stratégie d'export pour la mise en place (seating).
 */

import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { schoolYearIdBaseSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { extensions } from "./extensions";
import { createSeatingPresenceExportForm } from "./form";
import { SeatingPresenceSessionDataResolver } from "./resolver";
import { DocumentCategory } from "../../constants";

export class SeatingPresenceExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public readonly id = "SEATING_PRESENCE_EXPORT" as const;
  public readonly displayName = "Fiche de présence des examens";
  public readonly category = DocumentCategory.DATA_SCHOOL;

  public readonly description =
    "Génère la liste de présence pour la mise en place des examens.";

  public readonly validationSchema = schoolYearIdBaseSchema;

  constructor() {
    super({
      extensions,
      schemaCreator: generateValidationSchema,
      resolver: SeatingPresenceSessionDataResolver,
      extendWithFileTypeFormFields: createSeatingPresenceExportForm,
    });
  }
}
