/**
 * @file file-system.ts
 * @description Concrete implementation of the file system interface for Electron.
 */

import type { SaveDialogOptions } from "electron";
import { dialog } from "electron";
import { writeFile, mkdir } from "fs/promises";
import { dirname, basename } from "path";
import { getLogger } from "@/packages/logger";
import type { RawFileContent, IFileSystem } from "./types";

export class ElectronFileSystem implements IFileSystem {
  private readonly logger = getLogger("FileSystem");

  /**
   * Displays the native dialog to choose the save location.
   * @param options - Configuration options for the save dialog.
   * @returns The selected file path, or null if canceled or failed.
   */
  public async promptSavePath(
    options: SaveDialogOptions,
  ): Promise<string | null> {
    try {
      const { filePath, canceled } = await dialog.showSaveDialog(options);
      if (canceled || !filePath) {
        return null;
      }
      return filePath;
    } catch (error) {
      this.logger.error(
        "Error occurred while opening the SaveDialog",
        error as Error,
      );
      return null;
    }
  }

  /**
   * Persists data to the disk in an atomic manner.
   * Handles automatic creation of parent directories if needed.
   * @param path - Absolute target path for the file.
   * @param content - Raw string or binary file content.
   * @returns A promise that resolves when the write operation completes.
   * @throws {Error} If writing to disk fails.
   */
  public async persistToDisk(
    path: string,
    content: RawFileContent,
  ): Promise<void> {
    try {
      const targetDir = dirname(path);
      await mkdir(targetDir, { recursive: true });

      await writeFile(path, content, {
        encoding: typeof content === "string" ? "utf8" : undefined,
      });

      this.logger.info(`File successfully saved: ${path}`);
    } catch (error) {
      this.logger.error(`Failed to write to disk: ${path}`, error as Error);
      throw error;
    }
  }

  /**
   * Extracts the file name (with extension) from a full path.
   * @param path - Absolute or relative file path.
   * @returns The extracted file name.
   * @example
   * const fileName = fs.getFileName("/users/docs/report.pdf");
   * console.log(fileName); // "report.pdf"
   */
  public getFileName(path: string): string {
    return basename(path);
  }
}
