/**
 * @file document-export.service.ts
 * @description Service d'orchestration pour l'exportation de documents.
 * Utilise le pattern Strategy pour déléguer la génération de contenu spécifique.
 *
 * @author bienfait shomari
 */

import { response } from "@/commons/libs/electron-apis/utils";
import { SaveFileOptions, saveFileWithDialog } from "@/main/libs/save-files";
import { Status } from "@/commons/libs/electron-apis/constant";
import type { RouteHandler } from "@/commons/libs/electron-apis/server";
import { DocumentFilter } from "@/commons/types/services";
import { CustomLogger, getLogger } from "@/main/libs/logger";
import { getProcessedDocumentOptions } from "./utils";
import { DocumentInfo } from "@/commons/types/services.documents";
import { DOCUMENT_EXTENSION } from "@/commons/constants/file-extension";

// ==========================================
// 1. Core Types & DTOs (Data Transfer Objects)
// ==========================================

/**
 * Standardized envelope for service operation results.
 * @template T - The type of the successful data payload.
 */
export type ServiceOperationResult<T> =
  | { success: true; payload: T }
  | {
      success: false;
      error: { code: string; message: string; details?: unknown };
    };

/**
 * Represents the binary output of a document generation strategy.
 */
export type ExportArtifact = {
  /** The raw content (Buffer, Stream, or formatted object) ready for FS write. */
  content: any;
  /** Configuration for the file system dialog (default name, extension, etc.). */
  fileSystemOptions: SaveFileOptions;
};

/**
 * Definition of required data. Can be a single query key or a map of keys.
 * Example: 'GET_CLIENTS' or { client: 'GET_CLIENT', orders: 'GET_ORDERS' }
 */
export type DataSourceQueryDefinition = string | Record<string, string>;

/**
 * Generic definition for an API Route Handler factory.
 */
export type ApiRouteFactory<
  TResponse,
  TBody,
  TParams extends object = object,
> = () => RouteHandler<TResponse, TBody, TParams>;

// ==========================================
// 2. Interfaces (Contracts)
// ==========================================

/**
 * STRATEGY INTERFACE
 * Defines the contract for any document type generator (PDF, Excel, CSV...).
 */
export interface IDocumentExportStrategy {
  /** Unique identifier for the strategy (e.g., 'INVOICE_PDF'). */
  getStrategyId(): string;

  /** File extension associated with this strategy. */
  getFileExtension(): DOCUMENT_EXTENSION;

  /** Human-readable title for UI. */
  getDisplayName(): string;

  /** Detailed description for UI. */
  getDescription(): string;

  /**
   * Defines the data requirements needed to generate the document.
   * The orchestrator will fetch this data before calling generateArtifact.
   */
  getDataSourceDefinition(): DataSourceQueryDefinition;

  /**
   * Validates the input parameters (filters, IDs) before any processing.
   * @param params - Raw parameters from the client.
   */
  validateContext(params: unknown): ServiceOperationResult<void>;

  /**
   * Core logic: Transforms business data into a file artifact.
   * @param data - The data fetched from the DataSystem.
   */
  generateArtifact(
    data: unknown
  ): Promise<ServiceOperationResult<ExportArtifact>>;
}

/**
 * ABSTRACTION LAYER for Data Fetching.
 */
export interface IDataFetchingService {
  /**
   * Fetches data based on a query key.
   */
  fetch(
    queryKey: string,
    params: unknown
  ): Promise<ServiceOperationResult<unknown>>;
}

/**
 * Dependency Injection container for the service.
 */
export interface DocumentExportServiceDependencies {
  readonly dataFetchingService: IDataFetchingService;
}

interface IDocumentExportService<TRes, TData, TParams extends object> {
  getAvailableDocumentMetadata: () => RouteHandler<TRes, TData, TParams>;
  executeExportWorkflow: () => RouteHandler<TRes, TData, TParams>;
}

// ==========================================
// 3. Service Implementation (Orchestrator)
// ==========================================

/**
 * 🚀 DocumentExportService
 *
 * Orchestrates the end-to-end document export workflow:
 * 1. Metadata Exposure
 * 2. Parameter Validation
 * 3. Parallel Data Aggregation
 * 4. Artifact Generation (via Strategy)
 * 5. File System IO (via Electron)
 */
export class DocumentExportService
  implements IDocumentExportService<any, DocumentFilter, {}>
{
  /** Registry of available strategies mapped by their ID. */
  private readonly strategyRegistry: Map<string, IDocumentExportStrategy> =
    new Map();

  /** Cached metadata for UI consumption. */
  private readonly documentMetadataCache: DocumentInfo[] = [];

  private readonly logger: CustomLogger = getLogger("DocumentExportService");

  constructor(
    strategies: IDocumentExportStrategy[],
    private readonly dependencies: DocumentExportServiceDependencies
  ) {
    this.logger.info("Initializing DocumentExportService...");
    this.registerStrategies(strategies);
  }

  /**
   * Registers strategies into the internal registry and builds the metadata cache.
   */
  private registerStrategies(strategies: IDocumentExportStrategy[]): void {
    for (const strategy of strategies) {
      const id = strategy.getStrategyId();

      if (this.strategyRegistry.has(id)) {
        this.logger.warn(`Duplicate strategy ID detected: ${id}. Overwriting.`);
      }

      this.strategyRegistry.set(id, strategy);
      this.documentMetadataCache.push({
        key: id,
        type: strategy.getFileExtension(),
        title: strategy.getDisplayName(),
        description: strategy.getDescription(),
      });
    }
    this.logger.info(
      `Registered ${this.strategyRegistry.size} export strategies.`
    );
  }

  /**
   * Resolves the necessary data from the data system.
   * Handles both single query strings and dictionary mappings in parallel.
   */
  private async resolveDataSources(
    queryDef: DataSourceQueryDefinition,
    contextParams: unknown
  ): Promise<ServiceOperationResult<unknown>> {
    // Case A: Single Query
    if (typeof queryDef === "string") {
      return this.dependencies.dataFetchingService.fetch(
        queryDef,
        contextParams
      );
    }

    // Case B: Multiple Queries (Dictionary)
    const queries = Object.entries(queryDef);
    const results = await Promise.all(
      queries.map(async ([key, queryName]) => {
        const fetchResult = await this.dependencies.dataFetchingService.fetch(
          queryName,
          contextParams
        );
        return { key, fetchResult };
      })
    );

    // Fail-fast: If any critical data is missing, fail the whole operation.
    const failure = results.find((r) => !r.fetchResult.success);
    if (failure) {
      // Type guard needed to access error safely
      const error = !failure.fetchResult.success
        ? failure.fetchResult.error
        : { code: "UNKNOWN", message: "Unknown error" };
      return { success: false, error };
    }

    // Aggregate results
    const aggregatedData: Record<string, unknown> = {};
    for (const { key, fetchResult } of results) {
      if (fetchResult.success) {
        aggregatedData[key] = fetchResult.payload;
      }
    }

    return { success: true, payload: aggregatedData };
  }

  /**
   * Internal pipeline execution.
   * Follows the "Railway Oriented Programming" concept (success path vs failure path).
   */
  private async runExportPipeline(
    strategy: IDocumentExportStrategy,
    params: unknown
  ): Promise<ReturnType<typeof response>> {
    const strategyId = strategy.getStrategyId();
    // Contextual logger for this specific run
    const log = getLogger(`ExportPipeline:${strategyId}`);

    log.info("Starting export workflow.", { params });

    // --- Step 1: Validation ---
    const validation = strategy.validateContext(params);
    if (!validation.success) {
      log.warn("Validation failed.", validation.error);
      return response(
        { message: "Invalid parameters.", details: validation.error.message },
        Status.BAD_REQUEST
      );
    }

    // --- Step 2: Data Resolution ---
    const sourceDef = strategy.getDataSourceDefinition();
    log.info("Resolving data sources...", { sourceDef });

    const dataResolution = await this.resolveDataSources(sourceDef, params);
    if (!dataResolution.success) {
      log.error("Data resolution failed.", String(dataResolution.error));
      return response(
        {
          message: "Failed to fetch required data.",
          details: dataResolution.error.message,
        },
        Status.INTERNAL_SERVER
      );
    }

    // --- Step 3: Artifact Generation ---
    log.info("Generating artifact...");
    const generation = await strategy.generateArtifact(dataResolution.payload);

    if (!generation.success) {
      log.error("Artifact generation failed.", String(generation.error));
      return response(
        {
          message: "Error generating file content.",
          details: generation.error.message,
        },
        Status.INTERNAL_SERVER
      );
    }

    const { content, fileSystemOptions } = generation.payload;

    // --- Step 4: IO / Persistance (User Interaction) ---
    log.info("Prompting user for save location (Electron Dialog).");
    const savedPath = await saveFileWithDialog(content, fileSystemOptions);

    if (!savedPath) {
      log.info("Operation cancelled by user.");
      return response({ message: "Save operation cancelled." }, 499); // 499 Client Closed Request
    }

    log.info(`Workflow completed successfully. File: ${savedPath}`);
    return response({
      filenamePath: savedPath,
      message: "Export completed successfully.",
    });
  }

  /**
   * endpoint: POST /documents/export
   * Executes the export workflow for a given document type.
   */
  public executeExportWorkflow() {
    return async ({ data }: { data: DocumentFilter }) => {
      const { documentType, ...contextParams } = data;
      this.logger.info(`API: Export request received for '${documentType}'`);

      const strategy = this.strategyRegistry.get(documentType);

      if (!strategy) {
        this.logger.warn(`No strategy registered for ID: ${documentType}`);
        return response(
          { message: `Document type '${documentType}' is not supported.` },
          Status.NOT_FOUND
        );
      }

      try {
        return await this.runExportPipeline(strategy, contextParams);
      } catch (err) {
        // Global safety net for unhandled exceptions (e.g., OOM, logic bugs)
        const error = err instanceof Error ? err : new Error(String(err));
        this.logger.error(
          "Critical unhandled exception in export workflow.",
          error
        );

        return response(
          {
            message: "An unexpected system error occurred.",
            error: error.message,
          },
          Status.INTERNAL_SERVER
        );
      }
    };
  }

  /**
   * endpoint: GET /documents/meta
   * Returns the list of available document types.
   */
  public getAvailableDocumentMetadata(): RouteHandler<
    unknown,
    unknown,
    { format?: "grouped" | "mapped" }
  > {
    return async ({ params }) => {
      this.logger.info("API: Retrieve document metadata.");

      if (params?.format === "grouped") {
        return response(
          getProcessedDocumentOptions(this.documentMetadataCache)
        );
      }
      return response(this.documentMetadataCache);
    };
  }
}
