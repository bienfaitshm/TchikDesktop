import { describe, it, expect, vi, beforeEach } from "vitest";
import { dialog } from "electron";
import { writeFile, mkdir } from "fs/promises";
import { ElectronFileSystem } from "./file-system";

vi.mock("electron", () => ({
  dialog: {
    showSaveDialog: vi.fn(),
  },
}));

vi.mock("fs/promises", () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock("@/packages/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("ElectronFileSystem", () => {
  let fileSystem: ElectronFileSystem;

  beforeEach(() => {
    vi.clearAllMocks();
    fileSystem = new ElectronFileSystem();
  });

  describe("promptSavePath", () => {
    it("should return file path when dialog succeeds", async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValueOnce({
        filePath: "/path/to/save.pdf",
        canceled: false,
      });

      const result = await fileSystem.promptSavePath({ title: "Save" });
      expect(result).toBe("/path/to/save.pdf");
    });

    it("should return null when dialog is canceled", async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValueOnce({
        filePath: "",
        canceled: true,
      });

      const result = await fileSystem.promptSavePath({ title: "Save" });
      expect(result).toBeNull();
    });

    it("should return null when showSaveDialog throws an error", async () => {
      vi.mocked(dialog.showSaveDialog).mockRejectedValueOnce(
        new Error("Dialog error"),
      );

      const result = await fileSystem.promptSavePath({ title: "Save" });
      expect(result).toBeNull();
    });
  });

  describe("persistToDisk", () => {
    it("should create directory and write string content successfully", async () => {
      vi.mocked(mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);

      await fileSystem.persistToDisk("/path/to/file.txt", "hello");

      expect(mkdir).toHaveBeenCalledWith("/path/to", { recursive: true });
      expect(writeFile).toHaveBeenCalledWith("/path/to/file.txt", "hello", {
        encoding: "utf8",
      });
    });

    it("should write binary content without encoding option", async () => {
      const buffer = Buffer.from([1, 2, 3]);
      vi.mocked(mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockResolvedValueOnce(undefined);

      await fileSystem.persistToDisk("/path/to/file.bin", buffer);

      expect(writeFile).toHaveBeenCalledWith("/path/to/file.bin", buffer, {
        encoding: undefined,
      });
    });

    it("should throw error when writing fails", async () => {
      vi.mocked(mkdir).mockResolvedValueOnce(undefined);
      vi.mocked(writeFile).mockRejectedValueOnce(new Error("Disk full"));

      await expect(
        fileSystem.persistToDisk("/path/to/file.txt", "hello"),
      ).rejects.toThrow("Disk full");
    });
  });

  describe("getFileName", () => {
    it("should extract file name from absolute path correctly", () => {
      const fileName = fileSystem.getFileName("/users/docs/report.pdf");
      expect(fileName).toBe("report.pdf");
    });

    it("should extract file name from relative path correctly", () => {
      const fileName = fileSystem.getFileName("docs/report.pdf");
      expect(fileName).toBe("report.pdf");
    });

    it("should return file name as is if no path separators are present", () => {
      const fileName = fileSystem.getFileName("report.pdf");
      expect(fileName).toBe("report.pdf");
    });
  });
});
