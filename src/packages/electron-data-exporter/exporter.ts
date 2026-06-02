/**
 * @file exporter.ts
 * @description Service d'orchestration pour l'exportation de documents.
 * Centralise la logique de récupération de données et de génération d'artefacts.
 */

import { getLogger } from "@/packages/logger";
import { getFileExtension } from "@/packages/file-extension";
import type { IExportStrategy } from "./abstractions";
import type { IFileSystem } from "./types";
import type {
  ServiceResult,
  DocumentMetadata,
  ServiceError,
  ContextParams,
} from "./types";

export class DataExport {
  private readonly logger = getLogger("DataExport");
  private readonly strategyRegistry = new Map<string, IExportStrategy<any>>();

  /**
   * @param strategies Liste des stratégies d'export injectées.
   * @param fileSystem Interface abstraite pour les opérations I/O (Injection de dépendance).
   */
  constructor(
    strategies: IExportStrategy<any>[],
    private readonly fileSystem: IFileSystem,
  ) {
    this.registerStrategies(strategies);
  }

  private registerStrategies(strategies: IExportStrategy<any>[]): void {
    strategies.forEach((strategy) => {
      if (this.strategyRegistry.has(strategy.id)) {
        this.logger.warn(`Duplicate strategy ID detected: ${strategy.id}.`);
        return;
      }
      this.strategyRegistry.set(strategy.id, strategy);
    });
    this.logger.info(
      `Ready with ${this.strategyRegistry.size} export strategies.`,
    );
  }

  public async getAvailableExports<TParams extends Record<string, unknown>>(
    params?: TParams,
  ): Promise<ReadonlyArray<DocumentMetadata>> {
    const metadata: DocumentMetadata[] = [];

    for (const strategy of this.strategyRegistry.values()) {
      const data = await strategy.getMeta(params);
      metadata.push({
        id: strategy.id, // Correction de 'key' vers 'id' pour la cohérence
        ...data,
      });
    }
    return Object.freeze(metadata);
  }

  /**
   * Orchestre le workflow d'exportation.
   */
  public async executeExport(
    strategyId: string,
    contextParams: ContextParams,
  ): Promise<ServiceResult<string>> {
    const strategy = this.strategyRegistry.get(strategyId);

    if (!strategy) {
      return this.fail("NOT_FOUND", `Stratégie introuvable : ${strategyId}`);
    }

    const log = getLogger(`Export:${strategyId}`);
    log.info("Workflow initiated", { contextParams });

    try {
      // 1. Validation
      const validation = strategy.validateContext(contextParams);
      if (!validation.success) return validation;

      // 2. Sélection du chemin via l'abstraction IFileSystem
      const savedPath = await this.fileSystem.promptSavePath(
        strategy.getSaveOptions(contextParams?.fileType),
      );

      if (!savedPath) {
        log.info("Operation cancelled by user via dialog.");
        return this.fail("CANCELLED", "Exportation annulée.");
      }

      // 3. Identification de l'extension
      const fileExtension = getFileExtension(savedPath);
      if (!fileExtension) {
        return this.fail(
          "VALIDATION_ERROR",
          "Extension de fichier non supportée.",
        );
      }

      // 4. Récupération des données
      log.info("Fetching required data...");
      const dataResult = await strategy.handlerResolveData(contextParams);
      if (!dataResult.success) return dataResult;

      // 5. Génération de l'artefact
      log.info(`Generating ${fileExtension} artifact...`);
      const artifactResult = await strategy.buildArtifact(
        fileExtension,
        dataResult.data,
      );
      if (!artifactResult.success) return artifactResult;

      // 6. Persistance via l'abstraction IFileSystem
      log.info("Writing file to disk...");
      await this.fileSystem.persistToDisk(savedPath, artifactResult.data);

      log.info("Export completed successfully");
      return { success: true, data: savedPath };
    } catch (error) {
      log.error("Critical error during export pipeline", error as Error);
      return this.fail(
        "GENERATION_ERROR",
        "Une erreur système est survenue.",
        error,
      );
    }
  }

  /**
   * Utilisation de never pour garantir le respect de l'union type ServiceResult.
   */
  private fail(
    code: ServiceError["code"],
    message: string,
    details?: unknown,
  ): ServiceResult<never> {
    return { success: false, error: { code, message, details } };
  }
}
