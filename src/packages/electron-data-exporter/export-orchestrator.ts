// export-orchestrator.ts
import { IExportStrategy } from "./abstractions";
import {
  IDataFetchingService,
  ServiceResult,
  DocumentMetadata,
  ServiceError,
  DataSourceQueryDefinition,
} from "./types";
import { IFileService, ILoggerFactory, ILogger } from "./dependencies";

export class ExportOrchestratorService {
  private readonly logger: ILogger;
  private readonly strategyRegistry = new Map<string, IExportStrategy>();
  private readonly metadataCache: DocumentMetadata[] = [];

  constructor(
    strategies: IExportStrategy[],
    private readonly dataFetcher: IDataFetchingService,
    private readonly fileService: IFileService,
    private readonly loggerFactory: ILoggerFactory,
  ) {
    this.logger = this.loggerFactory.createLogger("ExportOrchestrator");
    this.initializeRegistry(strategies);
  }

  private initializeRegistry(strategies: IExportStrategy[]): void {
    for (const strategy of strategies) {
      if (this.strategyRegistry.has(strategy.id)) {
        this.logger.warn(
          `Duplicate strategy ID detected and ignored: ${strategy.id}.`,
        );
        continue;
      }
      this.strategyRegistry.set(strategy.id, strategy);
      this.metadataCache.push({ key: strategy.id, ...strategy.meta });
    }
    this.logger.info(
      `Ready with ${this.strategyRegistry.size} export strategies.`,
    );
  }

  public getAvailableExports(): ReadonlyArray<DocumentMetadata> {
    return this.metadataCache;
  }

  public async executeExport(
    strategyId: string,
    contextParams: unknown,
  ): Promise<ServiceResult<string>> {
    const strategy = this.strategyRegistry.get(strategyId);
    if (!strategy) {
      return this.fail("NOT_FOUND", `Stratégie introuvable : ${strategyId}`);
    }

    const workflowLogger = this.loggerFactory.createLogger(
      `Export:${strategyId}`,
    );
    workflowLogger.info("Workflow initiated", { contextParams });

    try {
      const validation = strategy.validateContext(contextParams);
      if (!validation.success) return validation;

      const savedPath = await this.fileService.promptSavePath(
        strategy.getSaveOptions(),
      );
      if (!savedPath) {
        workflowLogger.info("Operation cancelled by user via dialog.");
        return this.fail("CANCELLED", "Exportation annulée.");
      }

      const fileExtension = this.fileService.getFileExtension(savedPath);
      if (!fileExtension) {
        return this.fail(
          "VALIDATION_ERROR",
          "Extension de fichier non supportée.",
        );
      }

      workflowLogger.info("Fetching required data...");
      const dataResult = await this.resolveDataDependencies(
        strategy.getDataSourceDefinition(),
        contextParams,
      );
      if (!dataResult.success) return dataResult;

      workflowLogger.info(`Generating ${fileExtension} artifact...`);
      const artifactResult = await strategy.buildArtifact(
        fileExtension,
        dataResult.data,
      );
      if (!artifactResult.success) return artifactResult;

      workflowLogger.info("Writing file to disk...");
      await this.fileService.persistToDisk(savedPath, artifactResult.data);

      workflowLogger.info("Export completed successfully");
      return { success: true, data: savedPath };
    } catch (error) {
      workflowLogger.error("Critical error during export pipeline", error);
      return this.fail(
        "GENERATION_ERROR",
        "Une erreur système est survenue.",
        error,
      );
    }
  }

  private async resolveDataDependencies(
    definition: DataSourceQueryDefinition,
    params: unknown,
  ): Promise<ServiceResult<unknown>> {
    if (typeof definition === "string") {
      return this.dataFetcher.fetch(definition, params);
    }

    const queries = Object.entries(definition).map(async ([key, queryKey]) => {
      const res = await this.dataFetcher.fetch(queryKey, params);
      return { key, res };
    });

    const results = await Promise.all(queries);
    const firstFailure = results.find((r) => !r.res.success);

    if (firstFailure) {
      return firstFailure.res as ServiceResult<never>;
    }

    const aggregatedData = results.reduce<Record<string, unknown>>(
      (acc, { key, res }) => {
        if (res.success) acc[key] = res.data;
        return acc;
      },
      {},
    );

    return { success: true, data: aggregatedData };
  }

  // Typage générique strict pour éviter le `any`
  private fail<T = never>(
    code: ServiceError["code"],
    message: string,
    details?: unknown,
  ): ServiceResult<T> {
    return { success: false, error: { code, message, details } };
  }
}
