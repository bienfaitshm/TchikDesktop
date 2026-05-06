/**
 * @file abstractions.ts
 * @description Contrats et classes de base pour le système d'exportation.
 * Implémente le pattern Strategy pour le métier et le pattern Bridge pour les formats.
 */

import type { FileFilter, SaveDialogOptions } from "electron";
import type { AnyZodObject, ZodError } from "zod";
import {
  DOCUMENT_EXTENSION,
  getFileDescription,
} from "@/packages/file-extension";
import type { RawFileContent, ServiceResult, ContextParams } from "./types";

export interface TMeta<TFormField = unknown> {
  title: string;
  description: string;
  extensions: FileFilter[];
  fields?: TFormField[];
}

/**
 * Interface pour un moteur de rendu de format spécifique.
 */
export interface IExportExtension<TData = unknown> {
  readonly extension: DOCUMENT_EXTENSION;
  getExtensionFilter(): FileFilter;
  process(data: TData): RawFileContent;
}

/**
 * Base pour l'implémentation de processeurs de formats (ex: PDF, CSV).
 */
export abstract class AbstractExportExtension<TData = unknown>
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
export interface IExportStrategy<TFormField> {
  readonly id: string;
  getFormFields<TParams extends ContextParams>(
    params?: TParams,
  ): Promise<TFormField[]>;
  getMeta<TParams extends ContextParams>(
    params?: TParams,
  ): Promise<TMeta<TFormField>>;
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
export abstract class AbstractExportStrategy<
  TFormField = unknown,
  TData = unknown,
> implements IExportStrategy<TFormField>
{
  public abstract readonly id: string;
  public abstract readonly displayName: string;
  public abstract readonly description: string;

  protected abstract readonly validationSchema: AnyZodObject;
  protected formFields: TFormField[] = [];

  /** Registre interne des moteurs de rendu supportés par cette stratégie. */
  private readonly extensionsRegistry = new Map<
    DOCUMENT_EXTENSION,
    IExportExtension<TData>
  >();

  protected getSchemasCreator?: (fields: TFormField[]) => AnyZodObject;

  constructor({
    extensions,
    getSchemasCreator,
  }: {
    extensions: IExportExtension<TData>[];
    getSchemasCreator?: (fields: TFormField[]) => AnyZodObject;
  }) {
    this.getSchemasCreator = getSchemasCreator;
    extensions.forEach((ext) =>
      this.extensionsRegistry.set(ext.extension, ext),
    );
  }

  /**
   * Métadonnées exposées pour la consommation côté UI.
   */
  public async getMeta<TParams extends ContextParams>(
    params?: TParams,
  ): Promise<TMeta<TFormField>> {
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

  /**
   * Doit être implémentée par les stratégies concrètes pour fetch les données spécifiques.
   * On force l'implémentation via `abstract` au lieu de retourner une erreur par défaut.
   */
  public abstract resolveData(
    dataContext: unknown,
  ): Promise<ServiceResult<TData>>;

  public getSaveOptions(
    targetExtension?: DOCUMENT_EXTENSION,
  ): SaveDialogOptions {
    const dateSuffix = this.generateDateSuffix();
    const fileName = targetExtension
      ? `${this.displayName}_${dateSuffix}.${targetExtension}`
      : `${this.displayName}_${dateSuffix}`;

    return {
      title: `Exporter - ${this.displayName}`,
      defaultPath: fileName,
      filters: this.resolveFilters(targetExtension),
    };
  }

  private resolveFilters(targetExtension?: DOCUMENT_EXTENSION): FileFilter[] {
    if (!targetExtension) return this.extensionFilters;

    const relevantFilters = this.extensionFilters.filter((filter) =>
      filter.extensions.includes(targetExtension),
    );

    return relevantFilters.length > 0 ? relevantFilters : this.extensionFilters;
  }

  public async getFormFields<TParams extends ContextParams>(
    _params?: TParams,
  ): Promise<TFormField[]> {
    return this.formFields;
  }

  protected getSchemas(): AnyZodObject {
    const extraSchemas = this.getSchemasCreator?.(this.formFields ?? []);
    return extraSchemas
      ? this.validationSchema.merge(extraSchemas)
      : this.validationSchema;
  }

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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: {
          code: "GENERATION_ERROR",
          message: "Une erreur est survenue lors du traitement du document.",
          details: errorMessage,
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
    return new Date().toISOString().split("T")[0];
  }
}
