import { z } from "zod";
import type { ServiceResult } from "@/packages/electron-data-exporter";
import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
import { SchoolYearSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type FormFieldDef,
  generateValidationSchema,
} from "@/packages/dynamic-form";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engines";
import {
  type TCreateEnrollmentFormParams,
  createEnrollmentFieldForm,
} from "./enrollments.form-fields";
import { prependFileTypeField } from "./base.form-fields";

type TEnrollementExportData = z.infer<typeof SchoolYearSchema>;

/**
 * Stratégie concrète pour l'export des inscriptions.
 */
export class EnrollmentExportStrategy extends AbstractExportStrategy<
  FormFieldDef,
  TEnrollementExportData
> {
  public readonly id = "ENROLLMENT_EXPORT";
  public readonly displayName = "Liste des Inscriptions";
  public readonly description =
    "Export complet des données d'inscription (élèves, classes, dates).";

  protected readonly validationSchema = SchoolYearSchema;

  constructor() {
    super({
      extensions: [new CsvExportExtension(), new JsonExportExtension()],
      getSchemasCreator: (fields) => generateValidationSchema(fields as any),
    });
  }

  /**
   * Génère les champs du formulaire dynamiquement.
   */
  public override async getFormFields(params) {
    try {
      const fields = await createEnrollmentFieldForm(params);
      return prependFileTypeField(fields, this.extensionFilters);
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
    contextParams: TCreateEnrollmentFormParams,
  ): Promise<ServiceResult<any>> {
    return {
      success: true,
      data: contextParams,
    };
  }
}
