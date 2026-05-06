import { z } from "zod";
import type { ServiceResult } from "@/packages/electron-data-exporter";
import { AbstractExportStrategy } from "@/packages/electron-data-exporter";
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

/**
 * Stratégie concrète pour l'export des inscriptions.
 * @extends AbstractExportStrategy<{ data: TEnrollmentFilters }>
 */
export class EnrollmentExportStrategy extends AbstractExportStrategy<TEnrollmentFilters> {
  public readonly id = "ENROLLMENT_EXPORT";
  public readonly displayName = "Liste des Inscriptions";
  public readonly description =
    "Export complet des données d'inscription (élèves, classes, dates).";

  // On utilise le schéma de domaine comme base de validation
  protected readonly validationSchema = EnrolementFilterSchema;

  constructor() {
    super({
      extensions: [new CsvExportExtension(), new JsonExportExtension()],
      getSchemasCreator: (fields) => generateValidationSchema(fields as any),
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
    contextParams: TEnrollmentFilters,
  ): Promise<ServiceResult<TEnrollmentFilters>> {
    // Comme validationSchema est défini, contextParams est déjà typé et validé ici
    return {
      success: true,
      data: contextParams,
    };
  }
}
