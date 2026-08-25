import {
  AbstractExportStrategy,
  type DataResolver,
} from "@/packages/electron-data-exporter";
import { schoolYearIdBaseSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { extensions } from "./extensions";
import { createPaymentReportExportForm } from "./form";
import {
  buildDynamicTemplateData,
  type DynamicTemplateData,
} from "./payment-transform";
import {
  PaymentDataResolver,
  type PaymentResolverData,
  type PaymentResolverPayload,
} from "./resolver";
import { DocumentCategory } from "../../constants";
import { mapResolver, withSchoolData } from "../base/resolver";

/**
 * Strategy defining configuration and pipeline for exporting student payment reports.
 */
export class PaymentTableExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  DynamicTemplateData
> {
  public readonly id = "PAYMENT_TABLE_EXPORT" as const;
  public readonly displayName = "Table de paiement";
  public readonly category = DocumentCategory.FINANCES;
  public readonly description =
    "Génère la table de paiement des élèves pour chaque type de frais avec ses echeances";
  public readonly validationSchema = schoolYearIdBaseSchema;

  /**
   * Initializes the student payment export strategy with default pipeline components.
   * @param paymentResolver - Custom resolver instance (defaults to PaymentDataResolver).
   */
  constructor(
    paymentResolver: DataResolver<
      PaymentResolverPayload,
      PaymentResolverData
    > = new PaymentDataResolver(),
  ) {
    super({
      extensions,
      schemaCreator: generateValidationSchema,
      resolver: mapResolver(
        withSchoolData(paymentResolver),
        buildDynamicTemplateData,
      ),
      extendWithFileTypeFormFields: createPaymentReportExportForm,
    });
  }
}
