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
import { PaymentDataResolver } from "./resolver";
import { DocumentCategory } from "../../constants";

export class StudentPaymentExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  any
> {
  public readonly id = "STUDENT_PAYEMENT_EXPORT" as const;
  public readonly displayName = "Rapport de payment";
  public readonly category = DocumentCategory.FINANCES;

  public readonly description = "Genere le rapport de payment des eleves";

  public readonly validationSchema = schoolYearIdBaseSchema;

  constructor() {
    super({
      extensions,
      schemaCreator: generateValidationSchema,
      resolver: PaymentDataResolver,
      extendWithFileTypeFormFields: createSeatingPresenceExportForm,
    });
  }
}
