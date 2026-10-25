import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataExport } from "./exporter";
import type { IExportStrategy } from "./abstractions";
import type { IFileSystem } from "./types";

vi.mock("@/packages/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock("@/packages/file-extension", () => ({
  getFileExtension: vi.fn((path: string) =>
    path.endsWith(".pdf") ? "pdf" : null,
  ),
}));

describe("DataExport", () => {
  let fileSystem: IFileSystem;
  let mockStrategy: IExportStrategy<unknown>;
  let config: any;
  let dataExport: DataExport;

  beforeEach(() => {
    vi.clearAllMocks();

    fileSystem = {
      promptSavePath: vi.fn().mockResolvedValue("/path/to/export.pdf"),
      persistToDisk: vi.fn().mockResolvedValue(undefined),
      getFileName: vi.fn().mockResolvedValue("export.pdf"),
    };

    mockStrategy = {
      id: "pdf-export",
      getMeta: vi.fn().mockResolvedValue({
        category: "reports",
        title: "PDF Report",
        extensions: ["pdf"],
        description: "Export data to PDF",
        fields: [],
      }),
      validateContext: vi.fn().mockReturnValue({ success: true }),
      getSaveOptions: vi.fn().mockReturnValue({}),
      handleResolveData: vi
        .fn()
        .mockResolvedValue({ success: true, data: { items: [] } }),
      buildArtifact: vi
        .fn()
        .mockResolvedValue({ success: true, data: new Uint8Array() }),
    };

    config = {
      saveHistoryExport: vi.fn(),
      onOpenFile: vi.fn(),
      notifyOnExport: vi.fn(),
    };

    dataExport = new DataExport([mockStrategy], fileSystem, config);
  });

  describe("getAvailableExports", () => {
    it("should return frozen metadata list of registered strategies", async () => {
      const exports = await dataExport.getAvailableExports();
      expect(exports).toHaveLength(1);
      expect(exports[0].id).toBe("pdf-export");
      expect(Object.isFrozen(exports)).toBe(true);
    });
  });

  describe("executeExport", () => {
    it("should execute export successfully and trigger post-export hooks", async () => {
      const result = await dataExport.executeExport("pdf-export", {
        fileType: "pdf",
        schoolId: "school-1",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("export.pdf");
      }
      expect(fileSystem.persistToDisk).toHaveBeenCalled();
      expect(config.saveHistoryExport).toHaveBeenCalledWith({
        exportKey: "pdf-export",
        exportName: "export.pdf",
        fileType: "pdf",
        filePath: "/path/to/export.pdf",
        schoolId: "school-1",
      });
      expect(config.onOpenFile).toHaveBeenCalledWith("/path/to/export.pdf");
      expect(config.notifyOnExport).toHaveBeenCalledWith({
        success: true,
        data: "/path/to/export.pdf",
      });
    });

    it("should return NOT_FOUND error when strategy does not exist", async () => {
      const result = await dataExport.executeExport("invalid-strategy", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("should return validation error when context validation fails", async () => {
      (mockStrategy.validateContext as any).mockReturnValue({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid context" },
      });

      const result = await dataExport.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should return CANCELLED error when user cancels save path prompt", async () => {
      (fileSystem.promptSavePath as any).mockResolvedValue(null);

      const result = await dataExport.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("CANCELLED");
      }
    });

    it("should return validation error when file extension cannot be resolved", async () => {
      (fileSystem.promptSavePath as any).mockResolvedValue("/path/to/export");

      const result = await dataExport.executeExport("pdf-export", {
        fileType: "unknown",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should return data resolution error when resolution fails", async () => {
      (mockStrategy.handleResolveData as any).mockResolvedValue({
        success: false,
        error: { code: "GENERATION_ERROR", message: "Data failure" },
      });

      const result = await dataExport.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("GENERATION_ERROR");
      }
    });

    it("should handle unexpected critical errors and return failure result", async () => {
      (mockStrategy.handleResolveData as any).mockRejectedValue(
        new Error("Unexpected DB crash"),
      );

      const result = await dataExport.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("GENERATION_ERROR");
      }
      expect(config.notifyOnExport).toHaveBeenCalledWith({
        success: false,
        data: expect.any(Object),
      });
    });
  });
});
