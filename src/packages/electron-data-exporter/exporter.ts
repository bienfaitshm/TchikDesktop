/**
 * @file exporter.ts
 * @description Orchestration service for document export operations.
 * Centralizes data retrieval logic and artifact generation pipelines.
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

export type ExportPayload = {
  exportKey: string;
  exportName: string;
  filePath?: string | null;
  fileType: string;
  schoolId?: string;
  userId?: string | null;
};

export interface DataExportConfig {
  saveHistoryExport?(payload: ExportPayload): void;
  onOpenFile?(path: string): void;
  notifyOnExport?(value: {
    success: boolean;
    data: ServiceError | string;
  }): void;
}

export class DataExport {
  private readonly logger = getLogger("DataExport");
  private readonly strategyRegistry = new Map<
    string,
    IExportStrategy<Record<string, unknown>>
  >();

  /**
   * Initializes the export orchestrator with strategies, file system provider, and optional hooks.
   * @param strategies - Array of injected export strategies.
   * @param fileSystem - File system provider implementation for I/O operations.
   * @param config - Optional configuration hooks for history, opening files, and notifications.
   */
  constructor(
    strategies: IExportStrategy<Record<string, unknown>>[],
    private readonly fileSystem: IFileSystem,
    private readonly config?: DataExportConfig,
  ) {
    this.registerStrategies(strategies);
  }

  /**
   * Registers export strategies into the internal registry.
   * @param strategies - Array of export strategies to register.
   */
  private registerStrategies(
    strategies: IExportStrategy<Record<string, unknown>>[],
  ): void {
    strategies.forEach((strategy) => {
      if (this.strategyRegistry.has(strategy.id)) {
        this.logger.warn(`Duplicate strategy ignored: ${strategy.id}`);
        return;
      }
      this.strategyRegistry.set(strategy.id, strategy);
    });
    this.logger.info(
      `${this.strategyRegistry.size} export strategies registered.`,
    );
  }

  /**
   * Returns a frozen list of available exports with their metadata.
   * @param params - Optional parameters to filter metadata.
   * @returns Frozen array of available document metadata.
   */
  public async getAvailableExports<TParams extends Record<string, unknown>>(
    params?: TParams,
  ): Promise<ReadonlyArray<DocumentMetadata>> {
    const metadataList = await Promise.all(
      Array.from(this.strategyRegistry.values()).map(async (strategy) => {
        const meta = await strategy.getMeta(params);
        return {
          id: strategy.id,
          category: meta.category,
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
   * Executes the complete document export workflow.
   * @param strategyId - Unique identifier of the export strategy.
   * @param contextParams - Execution context parameters including file type and school ID.
   * @returns Result containing the saved file name or a typed error.
   */
  public async executeExport(
    strategyId: string,
    contextParams: ContextParams & { schoolId?: string },
  ): Promise<ServiceResult<string>> {
    const strategy = this.strategyRegistry.get(strategyId);
    if (!strategy) {
      return this.fail("NOT_FOUND", `Strategy not found: ${strategyId}`);
    }

    const log = getLogger(`Export:${strategyId}`);
    log.info("Starting export workflow", { contextParams });

    try {
      const validationResult = strategy.validateContext(contextParams);
      if (!validationResult.success) {
        return validationResult;
      }

      const savePath = await this.resolveSavePath(strategy, contextParams, log);
      if (!savePath) {
        log.info("Operation cancelled by user.");
        return this.fail("CANCELLED", "Export cancelled.");
      }

      const fileExtension = getFileExtension(savePath);
      if (!fileExtension) {
        return this.fail("VALIDATION_ERROR", "Unsupported file extension.");
      }

      const dataResult = await strategy.handleResolveData(contextParams);
      if (!dataResult.success) {
        return dataResult;
      }

      const artifact = await strategy.buildArtifact(
        fileExtension,
        dataResult.data,
      );
      if (!artifact.success) {
        this.notify(false, artifact.error);
        return artifact;
      }

      await this.fileSystem.persistToDisk(savePath, artifact.data);
      log.info("File saved successfully.");

      const exportName = await this.fileSystem.getFileName(savePath);
      this.handlePostExport(strategyId, savePath, exportName, contextParams);

      return { success: true, data: exportName };
    } catch (error) {
      log.error("Critical error in export pipeline.", error as Error);
      this.notify(false, error as ServiceError);
      return this.fail("GENERATION_ERROR", "A system error occurred.", error);
    }
  }

  /**
   * Prompts the user for a save path based on strategy options.
   * @param strategy - Active export strategy.
   * @param contextParams - Context parameters for save options.
   * @param log - Logger instance.
   * @returns Selected file path or null if cancelled.
   */
  private async resolveSavePath(
    strategy: IExportStrategy<Record<string, unknown>>,
    contextParams: ContextParams,
    log: ReturnType<typeof getLogger>,
  ): Promise<string | null> {
    const options = strategy.getSaveOptions(contextParams?.fileType);
    const path = await this.fileSystem.promptSavePath(options);
    if (!path) {
      log.info("Save dialog cancelled.");
    }
    return path ?? null;
  }

  /**
   * Executes post-export hooks including notifications, file opening, and history logging.
   * @param strategyId - Unique identifier of the strategy.
   * @param filePath - Absolute path to the saved file.
   * @param exportName - Name of the exported file.
   * @param contextParams - Context parameters containing school ID.
   */
  private handlePostExport(
    strategyId: string,
    filePath: string,
    exportName: string,
    contextParams: ContextParams & { schoolId?: string },
  ): void {
    this.notify(true, filePath);

    if (this.config?.onOpenFile) {
      this.config.onOpenFile(filePath);
    }

    this.config?.saveHistoryExport?.({
      exportKey: strategyId,
      exportName,
      fileType: contextParams.fileType ?? "Unknown File Type",
      filePath,
      schoolId: contextParams.schoolId,
    });
  }

  /**
   * Sends notifications via configuration hook with error containment.
   * @param success - Status of the export operation.
   * @param data - Success payload or service error object.
   */
  private notify(success: boolean, data: ServiceError | string): void {
    try {
      this.config?.notifyOnExport?.({ success, data });
    } catch (error) {
      this.logger.error("Failed to send notification.", error as Error);
    }
  }

  /**
   * Constructs a typed service failure result object.
   * @param code - Error category code.
   * @param message - Human-readable error description.
   * @param details - Optional error details.
   * @returns Standardized failure result object.
   */
  private fail(
    code: ServiceError["code"],
    message: string,
    details?: unknown,
  ): ServiceResult<never> {
    return { success: false, error: { code, message, details } };
  }
}
