/**
 * @file index.test.ts
 * @description Unit tests for document export handlers and orchestrator setup.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  handleExportNotification,
  handleSaveExportHistory,
  createDocumentExport,
} from "./index";
import { notify } from "@/packages/electron-utility";
import { exportHistoryRepository } from "@/packages/@core/data-access/db/queries";
import { mainLogger } from "@/packages/logger";

vi.mock("@/packages/electron-utility", () => ({
  notify: vi.fn(),
  getResourcePath: vi.fn(),
  openFile: vi.fn(),
}));

vi.mock("@/packages/@core/data-access/db/queries", () => ({
  exportHistoryRepository: {
    create: vi.fn(),
  },
}));

vi.mock("@/packages/logger", () => ({
  mainLogger: {
    error: vi.fn(),
  },
}));

describe("Document Export Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleExportNotification", () => {
    it("should trigger notification with success title and string data", () => {
      handleExportNotification({ success: true, data: "Export completed" });

      expect(notify).toHaveBeenCalledWith({
        title: "Export Successful",
        body: "Export completed",
      });
    });

    it("should trigger notification with failure title and error message object", () => {
      handleExportNotification({
        success: false,
        data: { message: "Disk full" },
      });

      expect(notify).toHaveBeenCalledWith({
        title: "Export Failed",
        body: "Disk full",
      });
    });

    it("should fallback to default error message if data object lacks message", () => {
      handleExportNotification({ success: false, data: {} });

      expect(notify).toHaveBeenCalledWith({
        title: "Export Failed",
        body: "An error occurred",
      });
    });

    it("should catch errors and log them if notify throws", () => {
      vi.mocked(notify).mockImplementationOnce(() => {
        throw new Error("OS error");
      });

      handleExportNotification({ success: true, data: "test" });

      expect(mainLogger.error).toHaveBeenCalledWith(
        "Failed to display export notification.",
        expect.any(Error),
      );
    });
  });

  describe("handleSaveExportHistory", () => {
    it("should save export history when schoolId is present", async () => {
      const payload = {
        exportKey: "pdf",
        exportName: "Report",
        fileType: "pdf",
        filePath: "/path/to/file.pdf",
        schoolId: "school-123",
        userId: "user-456",
      };

      await handleSaveExportHistory(payload);

      expect(exportHistoryRepository.create).toHaveBeenCalledWith({
        schoolId: "school-123",
        exportKey: "pdf",
        exportName: "Report",
        fileType: "pdf",
        filePath: "/path/to/file.pdf",
        userId: "user-456",
      });
    });

    it("should not save export history if schoolId is missing", async () => {
      const payload = {
        exportKey: "pdf",
        exportName: "Report",
        fileType: "pdf",
        filePath: "/path/to/file.pdf",
      };

      await handleSaveExportHistory(payload);

      expect(exportHistoryRepository.create).not.toHaveBeenCalled();
    });

    it("should catch and log errors if repository creation fails", async () => {
      const dbError = new Error("DB connection failed");
      vi.mocked(exportHistoryRepository.create).mockRejectedValueOnce(dbError);

      const payload = {
        exportKey: "pdf",
        exportName: "Report",
        fileType: "pdf",
        filePath: "/path/to/file.pdf",
        schoolId: "school-123",
      };

      await handleSaveExportHistory(payload);

      expect(mainLogger.error).toHaveBeenCalledWith(
        "Error occurred while saving export history.",
        dbError,
      );
    });
  });

  describe("createDocumentExport", () => {
    it("should create document export instance successfully", () => {
      const mockFileSystem = {} as any;
      const instance = createDocumentExport(mockFileSystem);

      expect(instance).toBeDefined();
    });
  });
});
