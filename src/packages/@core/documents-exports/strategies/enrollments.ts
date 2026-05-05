import { z } from "zod"; // Supposant que tu utilises Zod pour tes schémas
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
import { prependFileTypeField } from "./base.form-fields";

type TEnrollmentFilters = z.infer<typeof EnrolementFilterSchema>;

export class EnrollmentExportStrategy extends AbstractExportStrategy {
  public readonly id = "ENROLLMENT_EXPORT";
  public readonly displayName = "Liste des Inscriptions";
  public readonly description =
    "Export complet des données d'inscription (élèves, classes, dates).";

  public readonly validationSchema = z.object({});

  constructor() {
    super({
      extensions: [new CsvExportExtension(), new JsonExportExtension()],
      getSchemasCreator: generateValidationSchema,
    });
  }

  /**
   * Génère les champs du formulaire dynamiquement.
   */
  public override async getFormFields(
    params: TCreateEnrollmentsgFormParams,
  ): Promise<FormFieldDef[]> {
    try {
      const fields = await createEnrollmentsgFieldForm(params);
      return prependFileTypeField(fields, this.extensionFilters);
    } catch (error) {
      console.error(`[${this.id}] Failed to load form fields:`, error);
      throw new Error("Impossible de charger les options d'export.");
    }
  }

  /**
   * Résolution des données avant export.
   * @param contextParams - Paramètres validés issus du formulaire.
   */
  public override async resolveData(
    contextParams: TEnrollmentFilters,
  ): Promise<ServiceResult<TEnrollmentFilters>> {
    try {
      return {
        success: true,
        data: contextParams,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "DATA_FETCH_ERROR",
          message: "Erreur lors de la récupération des données d'inscription.",
          details: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }
}
