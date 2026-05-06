// DataExport.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataExport } from "./exporter";
import type { IExportStrategy } from "./abstractions";
import type { IFileSystem } from "./types";

// Mock des modules externes
vi.mock("@/packages/logger", () => ({
  getLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock("@/packages/file-extension", () => ({
  getFileExtension: vi.fn((path: string) => path.split(".").pop()),
}));

describe("DataExport Orchestrator", () => {
  let mockStrategy: IExportStrategy;
  let mockFileSystem: IFileSystem;
  let dataExport: DataExport;

  beforeEach(() => {
    // Configuration de la stratégie mockée
    mockStrategy = {
      id: "test-strategy",
      getMeta: vi
        .fn()
        .mockResolvedValue({
          title: "Test Export",
          extensions: [],
          description: "",
        }),
      validateContext: vi.fn().mockReturnValue({ success: true, data: true }),
      getSaveOptions: vi.fn().mockReturnValue({ defaultPath: "test.pdf" }),
      resolveData: vi
        .fn()
        .mockResolvedValue({ success: true, data: { mock: "data" } }),
      buildArtifact: vi
        .fn()
        .mockResolvedValue({ success: true, data: new Uint8Array() }),
    } as unknown as IExportStrategy;

    // Configuration du file system mocké
    mockFileSystem = {
      promptSavePath: vi.fn().mockResolvedValue("/fake/path/document.pdf"),
      persistToDisk: vi.fn().mockResolvedValue(undefined),
    };

    dataExport = new DataExport([mockStrategy], mockFileSystem);
  });

  it("doit enregistrer les stratégies et retourner les métadonnées", async () => {
    const exports = await dataExport.getAvailableExports();
    expect(exports).toHaveLength(1);
    expect(exports[0].id).toBe("test-strategy");
    expect(exports[0].title).toBe("Test Export");
  });

  it("doit exécuter le workflow d'exportation complet avec succès", async () => {
    const result = await dataExport.executeExport("test-strategy", {});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("/fake/path/document.pdf");
    }

    // Vérification de l'ordre d'appel (Workflow optimisation)
    expect(mockStrategy.validateContext).toHaveBeenCalledOnce();
    expect(mockFileSystem.promptSavePath).toHaveBeenCalledOnce();
    expect(mockStrategy.resolveData).toHaveBeenCalledOnce();
    expect(mockStrategy.buildArtifact).toHaveBeenCalledWith("pdf", {
      mock: "data",
    });
    expect(mockFileSystem.persistToDisk).toHaveBeenCalledOnce();
  });

  it("doit s'arrêter et retourner CANCELLED si l'utilisateur ferme la boîte de dialogue", async () => {
    // On simule une annulation de l'utilisateur (retourne null ou undefined)
    mockFileSystem.promptSavePath = vi.fn().mockResolvedValue(null);

    const result = await dataExport.executeExport("test-strategy", {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("CANCELLED");
    }

    // Vérification que les opérations coûteuses n'ont PAS été appelées
    expect(mockStrategy.resolveData).not.toHaveBeenCalled();
    expect(mockStrategy.buildArtifact).not.toHaveBeenCalled();
    expect(mockFileSystem.persistToDisk).not.toHaveBeenCalled();
  });

  it("doit échouer si la stratégie n'existe pas", async () => {
    const result = await dataExport.executeExport("unknown-strategy", {});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});
