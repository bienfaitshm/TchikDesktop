/**
 * @file DataExport.ts
 * @description Service d'orchestration pour l'exportation de documents.
 * Centralise la logique de récupération de données et de génération d'artefacts.
 */

import { getLogger } from "@/packages/logger";
import { FileSystem } from "@/packages/electron-file-system";
import { getFileExtension } from "@/packages/file-extension";
import { IExportStrategy } from "./abstractions";
import {
  IDataFetchingService,
  ServiceResult,
  DocumentMetadata,
  ServiceError,
  DataSourceQueryDefinition,
} from "./types";

export class DataExport {
  private readonly logger = getLogger("DataExport");
  private readonly strategyRegistry = new Map<string, IExportStrategy>();
  private readonly metadataCache: DocumentMetadata[] = [];

  constructor(
    strategies: IExportStrategy[],
    private readonly dataFetcher: IDataFetchingService
  ) {
    this.registerStrategies(strategies);
  }

  private registerStrategies(strategies: IExportStrategy[]): void {
    strategies.forEach((strategy) => {
      if (this.strategyRegistry.has(strategy.id)) {
        this.logger.warn(`Duplicate strategy ID detected: ${strategy.id}.`);
        return;
      }
      this.strategyRegistry.set(strategy.id, strategy);
      this.metadataCache.push({
        key: strategy.id,
        ...strategy.meta,
      });
    });
    this.logger.info(
      `Ready with ${this.strategyRegistry.size} export strategies.`
    );
  }

  public getAvailableExports(): DocumentMetadata[] {
    return this.metadataCache;
  }

  /**
   * Orchestre le workflow d'exportation.
   * L'ordre est optimisé : on demande le chemin AVANT la génération pour économiser les ressources.
   */
  public async executeExport(
    strategyId: string,
    contextParams: unknown
  ): Promise<ServiceResult<string>> {
    const strategy = this.strategyRegistry.get(strategyId);

    if (!strategy) {
      return this.fail("NOT_FOUND", `Stratégie introuvable : ${strategyId}`);
    }

    const log = getLogger(`Export:${strategyId}`);
    log.info("Workflow initiated", { contextParams });

    try {
      // 1. Validation des paramètres (Rapide)
      const validation = strategy.validateContext(contextParams);
      if (!validation.success) return validation;

      // 2. Sélection du chemin (Interaction utilisateur)
      // On le fait tôt pour ne pas lancer de calculs inutiles si l'utilisateur annule.
      const savedPath = await FileSystem.promptSavePath(
        strategy.getSaveOptions()
      );

      if (!savedPath) {
        log.info("Operation cancelled by user via dialog.");
        return this.fail("CANCELLED", "Exportation annulée.");
      }

      // 3. Identification de l'extension choisie
      const fileExtension = getFileExtension(savedPath);
      if (!fileExtension) {
        return this.fail(
          "VALIDATION_ERROR",
          "Extension de fichier non supportée."
        );
      }

      // 4. Récupération des données (Peut être lent)
      log.info("Fetching required data...");
      const dataResult = await this.resolveData(
        strategy.getDataSourceDefinition(),
        contextParams
      );
      if (!dataResult.success) return dataResult;

      // 5. Génération de l'artefact (Transformation CPU-intensive)
      log.info(`Generating ${fileExtension} artifact...`);
      const artifactResult = await strategy.buildArtifact(
        fileExtension,
        dataResult.data
      );
      if (!artifactResult.success) return artifactResult;

      // 6. Persistance (I/O)
      log.info("Writing file to disk...");
      await FileSystem.persistToDisk(savedPath, artifactResult.data);

      log.info("Export completed successfully");
      return { success: true, data: savedPath };
    } catch (error) {
      log.error("Critical error during export pipeline", error as Error);
      return this.fail(
        "GENERATION_ERROR",
        "Une erreur système est survenue.",
        error
      );
    }
  }

  /**
   * Résout les dépendances de données de manière atomique ou groupée.
   */
  private async resolveData(
    definition: DataSourceQueryDefinition,
    params: unknown
  ): Promise<ServiceResult<unknown>> {
    if (typeof definition === "string") {
      return this.dataFetcher.fetch(definition, params);
    }

    const keys = Object.keys(definition);
    const results = await Promise.all(
      keys.map((key) =>
        this.dataFetcher
          .fetch(definition[key], params)
          .then((res) => ({ key, res }))
      )
    );

    const firstFailure = results.find((r) => !r.res.success);
    if (firstFailure) return firstFailure.res as ServiceResult<unknown>;

    const aggregatedData: Record<string, unknown> = {};
    results.forEach(({ key, res }) => {
      if (res.success) aggregatedData[key] = res.data;
    });

    return { success: true, data: aggregatedData };
  }

  private fail(
    code: ServiceError["code"],
    message: string,
    details?: unknown
  ): ServiceResult<any> {
    return { success: false, error: { code, message, details } };
  }
}
