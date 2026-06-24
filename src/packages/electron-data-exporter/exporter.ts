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

type ExportPayload = {
  exportKey: string;
  exportName: string;
  filePath?: string | null;
  fileType: string;
  schoolId?: string;
  userId?: string | null;
};

interface DataExportConfig {
  saveHistoryExport?(payload: ExportPayload): void;
  onOpenFile?(path: string): void;
  notifyOnExport?(value: {
    success: boolean;
    data: ServiceError | string;
  }): void;
}

export class DataExport {
  private readonly logger = getLogger("DataExport");
  private readonly strategyRegistry = new Map<string, IExportStrategy<any>>();

  /**
   * @param strategies - Stratégies d'export injectées (DI).
   * @param fileSystem - Interface pour les opérations I/O.
   * @param config - Hooks optionnels (historique, ouverture, notification).
   */
  constructor(
    strategies: IExportStrategy<any>[],
    private readonly fileSystem: IFileSystem,
    private readonly config?: DataExportConfig,
  ) {
    this.registerStrategies(strategies);
  }

  private registerStrategies(strategies: IExportStrategy<any>[]): void {
    strategies.forEach((strategy) => {
      if (this.strategyRegistry.has(strategy.id)) {
        this.logger.warn(`Stratégie en double ignorée : ${strategy.id}`);
        return;
      }
      this.strategyRegistry.set(strategy.id, strategy);
    });
    this.logger.info(
      `${this.strategyRegistry.size} stratégies d'export enregistrées.`,
    );
  }

  /**
   * Retourne la liste des exports disponibles avec leurs métadonnées.
   * @param params - Paramètres optionnels pour filtrer les métadonnées.
   * @returns Tableau gelé des documents disponibles.
   */
  public async getAvailableExports<TParams extends Record<string, unknown>>(
    params?: TParams,
  ): Promise<ReadonlyArray<DocumentMetadata>> {
    const metadataList = await Promise.all(
      Array.from(this.strategyRegistry.values()).map(async (strategy) => {
        const meta = await strategy.getMeta(params);
        return {
          id: strategy.id,
          title: meta.title,
          extensions: meta.extensions,
          description: meta.description,
          fields: meta.fields,
        };
      }),
    );
    return Object.freeze(metadataList);
  }

  /**
   * Exécute le processus d'exportation complet.
   * @param strategyId - Identifiant de la stratégie.
   * @param contextParams - Contexte (type de fichier, école, etc.).
   * @returns Résultat avec le chemin du fichier sauvegardé ou une erreur typée.
   */
  public async executeExport(
    strategyId: string,
    contextParams: ContextParams & { schoolId?: string },
  ): Promise<ServiceResult<string>> {
    const strategy = this.strategyRegistry.get(strategyId);
    if (!strategy) {
      return this.fail("NOT_FOUND", `Stratégie introuvable : ${strategyId}`);
    }

    const log = getLogger(`Export:${strategyId}`);
    log.info("Début du workflow d'exportation", { contextParams });

    try {
      // 1. Validation du contexte
      const validation = strategy.validateContext(contextParams);
      if (!validation.success) return validation;

      // 2. Sélection du chemin de sauvegarde
      const savePath = await this.getSavePath(strategy, contextParams, log);
      if (!savePath) {
        log.info("Opération annulée par l'utilisateur.");
        return this.fail("CANCELLED", "Exportation annulée.");
      }

      // 3. Vérification de l'extension
      const fileExtension = getFileExtension(savePath);
      if (!fileExtension) {
        return this.fail(
          "VALIDATION_ERROR",
          "Extension de fichier non supportée.",
        );
      }

      // 4. Récupération des données
      const dataResult = await strategy.handlerResolveData(contextParams);
      if (!dataResult.success) return dataResult;

      // 5. Génération de l'artefact
      const artifact = await strategy.buildArtifact(
        fileExtension,
        dataResult.data,
      );
      if (!artifact.success) {
        this.notify(false, artifact.error);
        return artifact;
      }

      // 6. Écriture sur disque
      await this.fileSystem.persistToDisk(savePath, artifact.data);
      log.info("Fichier sauvegardé avec succès.");

      // 7. Post-traitement (hooks)
      this.handlePostExport(strategyId, savePath, contextParams);

      return { success: true, data: savePath };
    } catch (error) {
      log.error("Erreur critique dans le pipeline d'export.", error as Error);
      this.notify(false, error as ServiceError);
      return this.fail(
        "GENERATION_ERROR",
        "Une erreur système est survenue.",
        error,
      );
    }
  }

  /**
   * Demande à l'utilisateur un chemin de sauvegarde.
   * Retourne `null` si l'utilisateur annule.
   */
  private async getSavePath(
    strategy: IExportStrategy<any>,
    contextParams: ContextParams,
    log: ReturnType<typeof getLogger>,
  ): Promise<string | null> {
    const options = strategy.getSaveOptions(contextParams?.fileType);
    const path = await this.fileSystem.promptSavePath(options);
    if (!path) {
      log.info("Dialogue de sauvegarde annulé.");
    }
    return path ?? null;
  }

  /**
   * Exécute les hooks post-export (ouverture, historique, notification).
   */
  private handlePostExport(
    strategyId: string,
    filePath: string,
    contextParams: ContextParams & { schoolId?: string },
  ): void {
    // Notification de succès
    this.notify(true, filePath);

    // Ouverture du fichier (si configuré)
    if (this.config?.onOpenFile) {
      this.config.onOpenFile(filePath);
    }

    // Sauvegarde dans l'historique (si configuré)
    this.config?.saveHistoryExport?.({
      exportKey: strategyId,
      exportName: filePath,
      fileType: contextParams.fileType,
      filePath,
      schoolId: contextParams.schoolId,
    });
  }

  /**
   * Envoie une notification via le hook, en capturant les erreurs silencieusement.
   */
  private notify(success: boolean, data: ServiceError | string): void {
    try {
      this.config?.notifyOnExport?.({ success, data });
    } catch (error) {
      this.logger.error("Échec de l'envoi de la notification.", error as Error);
    }
  }

  /**
   * Constructeur de résultat d'échec typé.
   */
  private fail(
    code: ServiceError["code"],
    message: string,
    details?: unknown,
  ): ServiceResult<never> {
    return { success: false, error: { code, message, details } };
  }
}
