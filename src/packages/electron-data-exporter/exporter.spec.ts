/**
 * @file exporter.test.ts
 * @description Unit tests for the DataExport orchestrator service.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { DataExport } from "./exporter";
import type { IFileSystem } from "./types";

describe("DataExport", () => {
  let fileSystemMock: IFileSystem;
  let strategyMock: any;
  let configMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    fileSystemMock = {
      promptSavePath: vi.fn().mockResolvedValue("/path/to/export.pdf"),
      persistToDisk: vi.fn().mockResolvedValue(undefined),
      getFileName: vi.fn().mockResolvedValue("export.pdf"),
    };

    strategyMock = {
      id: "pdf-export",
      getMeta: vi.fn().mockResolvedValue({
        category: "Reports",
        title: "PDF Report",
        extensions: ["pdf"],
        description: "Exports PDF reports",
        fields: [],
      }),
      validateContext: vi.fn().mockReturnValue({ success: true }),
      getSaveOptions: vi.fn().mockReturnValue({ defaultPath: "export.pdf" }),
      handleResolveData: vi
        .fn()
        .mockResolvedValue({ success: true, data: { items: [] } }),
      buildArtifact: vi
        .fn()
        .mockResolvedValue({ success: true, data: Buffer.from("content") }),
    };

    configMock = {
      saveHistoryExport: vi.fn(),
      onOpenFile: vi.fn(),
      notifyOnExport: vi.fn(),
    };
  });

  describe("getAvailableExports", () => {
    it("should return frozen metadata list from registered strategies", async () => {
      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.getAvailableExports();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("pdf-export");
      expect(Object.isFrozen(result)).toBe(true);
      expect(strategyMock.getMeta).toHaveBeenCalled();
    });

    it("should ignore duplicate strategy IDs during registration", async () => {
      const duplicateStrategy = { ...strategyMock };
      const exportService = new DataExport(
        [strategyMock, duplicateStrategy],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.getAvailableExports();

      expect(result).toHaveLength(1);
    });
  });

  describe("executeExport", () => {
    it("should successfully execute export workflow and trigger hooks", async () => {
      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.executeExport("pdf-export", {
        fileType: "pdf",
        schoolId: "school-1",
      });

      expect(result).toEqual({ success: true, data: "export.pdf" });
      expect(strategyMock.validateContext).toHaveBeenCalled();
      expect(fileSystemMock.promptSavePath).toHaveBeenCalled();
      expect(fileSystemMock.persistToDisk).toHaveBeenCalled();
      expect(configMock.onOpenFile).toHaveBeenCalledWith("/path/to/export.pdf");
      expect(configMock.saveHistoryExport).toHaveBeenCalledWith({
        exportKey: "pdf-export",
        exportName: "export.pdf",
        fileType: "pdf",
        filePath: "/path/to/export.pdf",
        schoolId: "school-1",
      });
      expect(configMock.notifyOnExport).toHaveBeenCalledWith({
        success: true,
        data: "/path/to/export.pdf",
      });
    });

    it("should return NOT_FOUND error when strategy does not exist", async () => {
      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.executeExport("unknown-strategy", {
        fileType: "pdf" as const,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("NOT_FOUND");
      }
    });

    it("should return validation error when context validation fails", async () => {
      strategyMock.validateContext.mockReturnValue({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Invalid context" },
      });

      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      expect(fileSystemMock.promptSavePath).not.toHaveBeenCalled();
    });

    it("should return CANCELLED error when user cancels save dialog", async () => {
      vi.mocked(fileSystemMock.promptSavePath).mockResolvedValue(null);

      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result).toEqual({
        success: false,
        error: {
          code: "CANCELLED",
          message: "Export cancelled.",
          details: undefined,
        },
      });
    });

    it("should return validation error when file extension is missing", async () => {
      vi.mocked(fileSystemMock.promptSavePath).mockResolvedValue(
        "/path/to/invalidfile",
      );

      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });

    it("should return data resolution error when resolution fails", async () => {
      strategyMock.handleResolveData.mockResolvedValue({
        success: false,
        error: { code: "GENERATION_ERROR", message: "Data error" },
      });

      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
    });

    it("should notify and return artifact error when artifact building fails", async () => {
      const artifactError = {
        code: "GENERATION_ERROR" as const,
        message: "Build failed",
      };
      strategyMock.buildArtifact.mockResolvedValue({
        success: false,
        error: artifactError,
      });

      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      expect(configMock.notifyOnExport).toHaveBeenCalledWith({
        success: false,
        data: artifactError,
      });
    });

    it("should catch unexpected exceptions and handle system failure", async () => {
      vi.mocked(fileSystemMock.persistToDisk).mockRejectedValue(
        new Error("Disk full"),
      );

      const exportService = new DataExport(
        [strategyMock],
        fileSystemMock,
        configMock,
      );
      const result = await exportService.executeExport("pdf-export", {
        fileType: "pdf",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("GENERATION_ERROR");
      }
      expect(configMock.notifyOnExport).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
      );
    });
  });
});
