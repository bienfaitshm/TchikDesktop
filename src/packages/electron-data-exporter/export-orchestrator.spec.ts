import { beforeEach, describe, expect, it, vi, type Mocked } from "vitest";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import { ExportOrchestratorService } from "./export-orchestrator";
import { IFileService, ILoggerFactory, ILogger } from "./dependencies";
import { IDataFetchingService } from "./types";
import { IExportStrategy } from "./abstractions";

describe("ExportOrchestratorService", () => {
  let mockFileService: Mocked<IFileService>;
  let mockDataFetcher: Mocked<IDataFetchingService>;
  let mockLoggerFactory: Mocked<ILoggerFactory>;
  let mockLogger: Mocked<ILogger>;
  let mockStrategy: Mocked<IExportStrategy>;

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    } as unknown as Mocked<ILogger>;

    mockLoggerFactory = {
      createLogger: vi.fn().mockReturnValue(mockLogger),
    };

    mockFileService = {
      promptSavePath: vi.fn(),
      getFileExtension: vi.fn(),
      persistToDisk: vi.fn(),
    } as Mocked<IFileService>;

    mockDataFetcher = {
      fetch: vi.fn(),
    } as Mocked<IDataFetchingService>;

    // Mock d'une stratégie valide par défaut
    mockStrategy = {
      id: "pdf-export",
      meta: { name: "PDF Export", description: "Exports to PDF" },
      validateContext: vi.fn().mockReturnValue({ success: true }),
      getSaveOptions: vi.fn().mockReturnValue({ filters: [] }),
      getDataSourceDefinition: vi.fn().mockReturnValue("GET_INVOICE"),
      buildArtifact: vi.fn().mockResolvedValue({
        success: true,
        data: Buffer.from("pdf-data"),
      }),
    } as unknown as Mocked<IExportStrategy>;
  });

  const createService = (strategies = [mockStrategy]) =>
    new ExportOrchestratorService(
      strategies,
      mockDataFetcher,
      mockFileService,
      mockLoggerFactory,
    );

  it("devrait initialiser le registre correctement", () => {
    const service = createService();
    const exports = service.getAvailableExports();

    expect(exports).toHaveLength(1);
    // Correction : exports est un tableau
    expect(exports[0].key).toBe("pdf-export");
    expect(mockLoggerFactory.createLogger).toHaveBeenCalledWith(
      "ExportOrchestrator",
    );
  });

  it("devrait échouer si la stratégie n'existe pas", async () => {
    const service = createService([]);
    const result = await service.executeExport("unknown-strategy", {});

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("NOT_FOUND");
  });

  it("devrait retourner CANCELLED si l'utilisateur annule la boîte de dialogue", async () => {
    mockFileService.promptSavePath.mockResolvedValue(null);
    const service = createService();

    const result = await service.executeExport("pdf-export", {});

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("CANCELLED");
    expect(mockDataFetcher.fetch).not.toHaveBeenCalled();
  });

  it("devrait exécuter le workflow complet avec succès", async () => {
    mockFileService.promptSavePath.mockResolvedValue("/path/to/file.pdf");
    mockFileService.getFileExtension.mockReturnValue(DOCUMENT_EXTENSION.PDF);
    mockDataFetcher.fetch.mockResolvedValue({ success: true, data: { id: 1 } });

    const service = createService();
    const result = await service.executeExport("pdf-export", { id: 1 });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("/path/to/file.pdf");
    }

    expect(mockStrategy.validateContext).toHaveBeenCalledWith({ id: 1 });
    expect(mockFileService.promptSavePath).toHaveBeenCalled();
    expect(mockDataFetcher.fetch).toHaveBeenCalledWith("GET_INVOICE", {
      id: 1,
    });
    expect(mockStrategy.buildArtifact).toHaveBeenCalledWith(".pdf", { id: 1 });
    expect(mockFileService.persistToDisk).toHaveBeenCalledWith(
      "/path/to/file.pdf",
      expect.any(Buffer),
    );
  });

  it("devrait échouer proprement si la génération d'artefact plante", async () => {
    mockFileService.promptSavePath.mockResolvedValue("/path/to/file.pdf");
    mockFileService.getFileExtension.mockReturnValue(DOCUMENT_EXTENSION.PDF);
    mockDataFetcher.fetch.mockResolvedValue({ success: true, data: {} });

    mockStrategy.buildArtifact.mockResolvedValue({
      success: false,
      error: { code: "BUILD_FAILED", message: "Error" },
    });

    const service = createService();
    const result = await service.executeExport("pdf-export", {});

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("BUILD_FAILED");
    expect(mockFileService.persistToDisk).not.toHaveBeenCalled();
  });
});
