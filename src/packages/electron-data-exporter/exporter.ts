/**
 * @file exporter.ts
 * @description Orchestration service for document exports.
 * Centralizes data retrieval logic and artifact generation.
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
    IExportStrategy<unknown>
  >();

  /**
   * Initializes a new instance of DataExport.
   * @param strategies - Injected export strategies (DI).
   * @param fileSystem - Interface for I/O operations.
   * @param config - Optional configuration hooks (history, opening, notification).
   */
  constructor(
    strategies: IExportStrategy<unknown>[],
    private readonly fileSystem: IFileSystem,
    private readonly config?: DataExportConfig,
  ) {
    this.registerStrategies(strategies);
  }

  /**
   * Registers export strategies into the internal registry.
   * @param strategies - Array of export strategies.
   */
  private registerStrategies(strategies: IExportStrategy<unknown>[]): void {
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
   * Returns the list of available exports with their metadata.
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
   * Executes the complete export process.
   * @param strategyId - Identifier of the export strategy.
   * @param contextParams - Context parameters (file type, school ID, etc.).
   * @returns Result containing the saved file path or a typed error.
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
      const validation = strategy.validateContext(contextParams);
      if (!validation.success) return validation;

      const savePath = await this.getSavePath(strategy, contextParams, log);
      if (!savePath) {
        log.info("Operation cancelled by user.");
        return this.fail("CANCELLED", "Export cancelled.");
      }

      const fileExtension = getFileExtension(savePath);
      if (!fileExtension) {
        return this.fail("VALIDATION_ERROR", "Unsupported file extension.");
      }

      const dataResult = await strategy.handleResolveData(contextParams);
      if (!dataResult.success) return dataResult;

      const artifact = await strategy.buildArtifact(
        fileExtension,
        dataResult.data,
      );
      if (!artifact.success) {
        this.notify(false, artifact.error);
        return artifact;
      }

      await this.fileSystem.persistToDisk(savePath, artifact.data);
      log.info("File successfully saved.");

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
   * Prompts the user for a save path.
   * Returns null if the user cancels.
   */
  private async getSavePath(
    strategy: IExportStrategy<unknown>,
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
   * Executes post-export hooks (opening, history, notification).
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
   * Sends a notification via hook, catching errors silently.
   */
  private notify(success: boolean, data: ServiceError | string): void {
    try {
      this.config?.notifyOnExport?.({ success, data });
    } catch (error) {
      this.logger.error("Failed to send notification.", error as Error);
    }
  }

  /**
   * Constructs a typed failure result object.
   */
  private fail(
    code: ServiceError["code"],
    message: string,
    details?: unknown,
  ): ServiceResult<never> {
    return { success: false, error: { code, message, details } };
  }
}
