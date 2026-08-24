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
  transformPaymentReport,
  type TransformedPaymentReport,
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
export class StudentPaymentExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  TransformedPaymentReport
> {
  public readonly id = "STUDENT_PAYMENT_EXPORT" as const;
  public readonly displayName = "Rapport de paiement";
  public readonly category = DocumentCategory.FINANCES;
  public readonly description = "Génère le rapport de paiement des élèves";
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
        transformPaymentReport,
      ),
      extendWithFileTypeFormFields: createPaymentReportExportForm,
    });
  }
}
