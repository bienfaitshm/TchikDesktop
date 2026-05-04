/**
 * @description Stratégie unique pour l'export des inscriptions supportant plusieurs formats.
 */

import {
  AbstractExportStrategy,
  ServiceResult,
} from "@/packages/electron-data-exporter";
import { EnrolementFilterSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engins";
import {
  type TCreateEnrollmentsgFormParams,
  createEnrollmentsgFieldForm,
} from "./enrollments.form-fields";

export class EnrollmentExportStrategy extends AbstractExportStrategy {
  public readonly id = "ENROLLMENT_EXPORT";
  public readonly displayName = "Liste des Inscriptions";
  public readonly description =
    "Export complet des données d'inscription (élèves, classes, dates).";
  public readonly validationSchema = EnrolementFilterSchema;

  constructor() {
    super({
      extensions: [new CsvExportExtension(), new JsonExportExtension()],
      getSchemasCreator: generateValidationSchema,
    });
  }

  public override async getFormFields(
    params: TCreateEnrollmentsgFormParams,
  ): Promise<FormFieldDef[]> {
    try {
      return await createEnrollmentsgFieldForm(params);
    } catch (error) {
      console.error("[EnrollmentExportStrategy] Error loading fields:", error);
      return [];
    }
  }

  public override async resolveData(
    contextParams,
  ): Promise<ServiceResult<unknown>> {
    return {
      success: true,
      data: contextParams,
    };
  }
}
