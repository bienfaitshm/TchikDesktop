/**
 * @file abstract-document-strategy.ts
 * @description Classe de base pour les stratégies d'exportation.
 * Fournit l'implémentation par défaut pour la validation Zod et la gestion des métadonnées.
 */

import { ZodSchema, ZodError } from "zod";
import {
  DOCUMENT_EXTENSION,
  DOCUMENT_EXTENSION_TRANSLATIONS,
} from "@/commons/constants/file-extension";
import {
  IDocumentExportStrategy,
  DataSourceQueryDefinition,
  ServiceOperationResult,
  ExportArtifact,
} from "@/main/apps/documents/document-export.service";

/**
 * Base abstract class for all document export strategies.
 * Enforces strict typing and standardization of the export workflow.
 *
 * @template TParams - Type of the input parameters (inferred from Zod schema).
 * @template TData - Type of the data fetched from the DataSystem.
 */
export abstract class AbstractExportStrategy<TParams = unknown, TData = unknown>
  implements IDocumentExportStrategy
{
  // ==========================================
  // Abstract Configuration (To be defined by subclasses)
  // ==========================================

  /** Unique identifier for the strategy (e.g., 'INVOICE_V2'). */
  public abstract readonly strategyId: string;

  /** Human-readable title for the UI. */
  public abstract readonly displayName: string;

  /** Technical or functional description. */
  public abstract readonly description: string;

  /** The file extension associated with the output. */
  public abstract readonly fileExtension: DOCUMENT_EXTENSION;

  /** Definition of the data required from the DataSystem. */
  public abstract readonly dataSourceDefinition: DataSourceQueryDefinition;

  /** Zod schema used to validate and parse input parameters. */
  public abstract readonly validationSchema: ZodSchema<TParams>;

  // ==========================================
  // Interface Implementation (Boilerplate reduction)
  // ==========================================

  public getStrategyId(): string {
    return this.strategyId;
  }

  public getDisplayName(): string {
    return this.displayName;
  }

  public getDescription(): string {
    return this.description;
  }

  public getFileExtension(): DOCUMENT_EXTENSION {
    // Fallback to DOCX is unsafe in enterprise code; explicit definition is better.
    // If optional, we return a default, but here strictness is preferred.
    return this.fileExtension;
  }

  public getDataSourceDefinition(): DataSourceQueryDefinition {
    return this.dataSourceDefinition;
  }

  /**
   * Génère un suffixe de date standardisé pour les noms de fichiers ou les identifiants temporels.
   * Le format YYYY-MM-DD est universellement accepté et ne cause pas de confusion d'ordre.
   * * @returns La date du jour au format YYYY-MM-DD (ex: '2025-11-26').
   */
  public generateDateSuffix(): string {
    // Utilisation directe de Intl.DateTimeFormat ou de méthodes natives simples.
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  }
  /**
   * Helper to generate Electron file filters based on the extension.
   * Useful for the SaveDialog options.
   */
  protected getElectronFileFilters(): Electron.FileFilter[] {
    const ext = this.getFileExtension();
    const name = DOCUMENT_EXTENSION_TRANSLATIONS[ext] ?? ext.toUpperCase();

    return [
      {
        name,
        extensions: [ext],
      },
    ];
  }

  /**
   * 🛡️ Validates input parameters using the defined Zod schema.
   * Transforms Zod errors into a human-readable format for the service layer.
   */
  public validateContext(params: unknown): ServiceOperationResult<void> {
    const result = this.validationSchema.safeParse(params);

    if (result.success) {
      return { success: true, payload: undefined };
    }

    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: this.formatZodError(result.error),
        details: result.error.format(),
      },
    };
  }

  /**
   * Formats Zod errors into a single string for logging or UI toasts.
   */
  private formatZodError(error: ZodError): string {
    const issues = error.errors.map((err) => {
      const path = err.path.join(".");
      return `${path ? path + ": " : ""}${err.message}`;
    });
    return `Invalid parameters: ${issues.join("; ")}`;
  }

  /**
   * 🏭 Core Logic: Generates the artifact.
   *
   * @param data - The raw data fetched from the system.
   * Subclasses should cast this to TData if not strictly typed by the infrastructure.
   */
  public abstract generateArtifact(
    data: TData
  ): Promise<ServiceOperationResult<ExportArtifact>>;
}
