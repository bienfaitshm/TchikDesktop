// file-system.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ElectronFileSystem } from "./file-system";
import { dialog } from "electron";
import { writeFile, mkdir } from "fs/promises";

vi.mock("electron", () => ({
  dialog: {
    showSaveDialog: vi.fn(),
  },
}));

vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

describe("ElectronFileSystem", () => {
  let fileSystem: ElectronFileSystem;

  beforeEach(() => {
    fileSystem = new ElectronFileSystem();
    vi.clearAllMocks();
  });

  describe("promptSavePath", () => {
    it("doit retourner le chemin quand l'utilisateur valide", async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: false,
        filePath: "/docs/test.csv",
      } as any);

      const result = await fileSystem.promptSavePath({});
      expect(result).toBe("/docs/test.csv");
    });

    it("doit retourner null quand l'utilisateur annule", async () => {
      vi.mocked(dialog.showSaveDialog).mockResolvedValue({
        canceled: true,
        filePath: "",
      } as any);

      const result = await fileSystem.promptSavePath({});
      expect(result).toBeNull();
    });
  });

  describe("persistToDisk", () => {
    it("doit créer le répertoire et écrire le fichier", async () => {
      const path = "/path/to/file.json";
      const content = '{"key": "value"}';

      await fileSystem.persistToDisk(path, content);

      expect(mkdir).toHaveBeenCalledWith("/path/to", { recursive: true });
      expect(writeFile).toHaveBeenCalledWith(path, content, expect.any(Object));
    });

    it("doit propager l'erreur en cas d'échec d'écriture", async () => {
      vi.mocked(writeFile).mockRejectedValue(new Error("Permission denied"));

      await expect(
        fileSystem.persistToDisk("/bad/path", "data"),
      ).rejects.toThrow("Permission denied");
    });
  });
});
