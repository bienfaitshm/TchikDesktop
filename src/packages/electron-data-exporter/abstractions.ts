/**
 * @file abstractions.ts
 * @description Contrats et classes de base pour le système d'exportation.
 * Implémente le pattern Strategy pour le métier et le pattern Bridge pour les formats.
 */

import { FileFilter, SaveDialogOptions } from "electron";
import { AnyZodObject, ZodError } from "zod";
import {
  DOCUMENT_EXTENSION,
  getFileDescription,
} from "@/packages/file-extension";
import { RawFileContent, ServiceResult } from "./types";

export type TMeta = {
  title: string;
  description: string;
  extensions: FileFilter[];
  fields?: object[];
};
/**
 * Interface pour un moteur de rendu de format spécifique.
 */
export interface IExportExtension<TData = any> {
  readonly extension: DOCUMENT_EXTENSION;
  getExtensionFilter(): FileFilter;
  process(data: TData): RawFileContent;
}

/**
 * Base pour l'implémentation de processeurs de formats (ex: PDF, CSV).
 */
export abstract class AbstractExportExtension<TData = any>
  implements IExportExtension<TData>
{
  abstract readonly extension: DOCUMENT_EXTENSION;

  public getExtensionFilter(): FileFilter {
    return {
      name: getFileDescription(this.extension),
      extensions: [this.extension],
    };
  }

  public abstract process(data: TData): RawFileContent;
}

/**
 * Contrat définissant une stratégie d'exportation de document.
 */
export interface IExportStrategy {
  readonly id: string;
  getFormFields<TParams extends {}>(params?: TParams): Promise<object[]>;
  getMeta<TParams extends {}>(params?: TParams): Promise<TMeta>;
  validateContext(params: unknown): ServiceResult<void>;
  getSaveOptions(targetExtension?: DOCUMENT_EXTENSION): SaveDialogOptions;
  resolveData(dataContext: unknown): Promise<ServiceResult<unknown>>;
  buildArtifact(
    targetExtension: DOCUMENT_EXTENSION,
    data: unknown,
  ): Promise<ServiceResult<RawFileContent>>;
}

/**
 * Orchestrateur abstrait pour les exports.
 * Gère la validation des paramètres, les métadonnées et délègue au format approprié.
 */
export abstract class AbstractExportStrategy<TData = any>
  implements IExportStrategy
{
  public abstract readonly id: string;
  public abstract readonly displayName: string;
  public abstract readonly description: string;

  protected abstract readonly validationSchema: AnyZodObject;

  protected formFields: object[] = [];
  /** Registre interne des moteurs de rendu supportés par cette stratégie. */
  private readonly extensionsRegistry = new Map<
    DOCUMENT_EXTENSION,
    IExportExtension<TData>
  >();

  getSchemasCreator: ((fields: object[]) => AnyZodObject) | undefined;

  constructor({
    extensions,
    getSchemasCreator,
  }: {
    extensions: IExportExtension<TData>[];
    getSchemasCreator?(fields: object[]): AnyZodObject;
  }) {
    this.getSchemasCreator = getSchemasCreator;
    extensions.forEach((ext) =>
      this.extensionsRegistry.set(ext.extension, ext),
    );
  }

  /**
   * Métadonnées exposées pour la consommation côté UI.
   */
  public async getMeta(params): Promise<TMeta> {
    return {
      title: this.displayName,
      description: this.description,
      extensions: this.extensionFilters,
      fields: await this.getFormFields(params),
    };
  }

  /**
   * Récupère tous les filtres de fichiers supportés par cette stratégie.
   */
  public get extensionFilters(): FileFilter[] {
    return Array.from(this.extensionsRegistry.values()).map((engine) =>
      engine.getExtensionFilter(),
    );
  }

  public async resolveData(_): Promise<ServiceResult<unknown>> {
    return {
      success: false,
      error: {
        code: "DATA_FETCH_ERROR",
        message:
          "Impossible de charger les données. Service temporairement indisponible.",
      },
    };
  }

  /**
   * Prépare les options de la boîte de dialogue Electron.
   * @param targetExtension - Extension suggérée par défaut.
   */
  public getSaveOptions(
    targetExtension?: DOCUMENT_EXTENSION,
  ): SaveDialogOptions {
    return {
      title: `Exporter - ${this.displayName}`,
      defaultPath: `${this.id}_${this.generateDateSuffix()}${
        targetExtension ? `.${targetExtension}` : ""
      }`,
      filters: this.extensionFilters,
    };
  }

  /**
   * getFormFields
   */
  public async getFormFields(_) {
    return this.formFields;
  }

  public getSchemas() {
    const extraSchemas = this.getSchemasCreator?.(this.formFields ?? {});

    return extraSchemas
      ? this.validationSchema.merge(extraSchemas)
      : this.validationSchema;
  }

  /**
   * Valide les paramètres d'entrée contre le schéma Zod.
   */
  public validateContext(params: unknown): ServiceResult<void> {
    const result = this.getSchemas().safeParse(params);
    if (!result.success) {
      return {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Paramètres d'export invalides",
          details: this.formatZodError(result.error),
        },
      };
    }
    return { success: true, data: undefined };
  }

  /**
   * Délègue la génération de l'artefact au moteur d'extension correspondant.
   */
  public async buildArtifact(
    targetExtension: DOCUMENT_EXTENSION,
    data: unknown,
  ): Promise<ServiceResult<RawFileContent>> {
    const engine = this.extensionsRegistry.get(targetExtension);

    if (!engine) {
      return {
        success: false,
        error: {
          code: "GENERATION_ERROR",
          message: `Le format "${targetExtension}" n'est pas supporté pour cet export.`,
        },
      };
    }

    try {
      const content = engine.process(data as TData);
      return { success: true, data: content };
    } catch (error) {
      return {
        success: false,
        error: {
          code: "GENERATION_ERROR",
          message: "Une erreur est survenue lors du traitement du document.",
          details: error,
        },
      };
    }
  }

  private formatZodError(error: ZodError): string {
    return error.errors
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
  }

  private generateDateSuffix(): string {
    return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  }
}
