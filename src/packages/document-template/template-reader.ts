import { promises as fsPromises } from "node:fs";
import path from "node:path";
import type { Abortable } from "node:events";
import { getResourcePath } from "@/packages/electron-utility";

const DEFAULT_TEMPLATES_DIR = "documents_templates";

/**
 * File system provider abstraction contract for reading and resolving path operations.
 */
export interface IFileSystemProvider {
  realpath(path: string): Promise<string>;
  readFile(
    path: string,
    options?: ReadTemplateOptions,
  ): Promise<string | Buffer>;
}

/**
 * Options for file reading based on Node.js fs.promises.readFile signatures.
 */
export type ReadTemplateOptions =
  | (Omit<Parameters<typeof fsPromises.readFile>[1], "encoding"> & {
      encoding?: null;
    } & Abortable)
  | null;

/**
 * Structure defining document template context and data mapping.
 */
export interface DocumentTemplateConfig {
  /** Name or relative location of the template. */
  templateName: string;
  /** Key-value data context used for template hydration. */
  templateData: Record<string, unknown>;
}

/**
 * Logging contract interface for tracking warnings and system errors.
 */
export interface ILogger {
  /** Logs warning events. */
  warn(...args: unknown[]): void;
  /** Logs error events. */
  error(...args: unknown[]): void;
}

/**
 * Resolves the absolute directory path where document templates are stored.
 * @returns Absolute filesystem path string to the template repository.
 */
export function getTemplateRepositoryPath(): string {
  const envDir = process.env.DOCUMENT_TEMPLATES_DIR;
  return getResourcePath(envDir ?? DEFAULT_TEMPLATES_DIR);
}

/**
 * Service responsible for managing secure filesystem access to template files.
 */
export class TemplateStorageService {
  private readonly baseDirectoryPath: string;
  private readonly fileSystemProvider: IFileSystemProvider;
  private readonly logger?: ILogger;

  /**
   * Initializes a new instance of TemplateStorageService.
   * @param baseDirectoryPath - Optional custom root directory path.
   * @param fileSystemProvider - File system provider implementation (defaults to node:fs/promises).
   * @param logger - Optional logger instance.
   */
  constructor(
    baseDirectoryPath?: string,
    fileSystemProvider: IFileSystemProvider = fsPromises,
    logger?: ILogger,
  ) {
    this.baseDirectoryPath = path.resolve(
      baseDirectoryPath ?? getTemplateRepositoryPath(),
    );
    this.fileSystemProvider = fileSystemProvider;
    this.logger = logger;
  }

  /**
   * Reads a template file securely as a Buffer, protecting against path traversal.
   * @param templateRelativePath - Relative file path to the template.
   * @param options - Additional read options such as abort signals.
   * @returns Raw Buffer of the template file.
   * @throws {Error} If path is empty, non-existent, or escapes the root directory.
   */
  public async readTemplateContent(
    templateRelativePath: string,
    options?: ReadTemplateOptions,
  ): Promise<Buffer> {
    if (!templateRelativePath || templateRelativePath.trim() === "") {
      throw new Error("Template path invocation error: path cannot be empty.");
    }

    const targetPath = path.join(this.baseDirectoryPath, templateRelativePath);

    let resolvedTargetPath: string;
    try {
      resolvedTargetPath = await this.fileSystemProvider.realpath(targetPath);
    } catch {
      throw new Error(
        `Template resource not found or inaccessible: ${templateRelativePath} (Target: ${targetPath})`,
      );
    }

    let resolvedBaseDir: string;
    try {
      resolvedBaseDir = await this.fileSystemProvider.realpath(
        this.baseDirectoryPath,
      );
    } catch {
      resolvedBaseDir = this.baseDirectoryPath;
    }

    if (!resolvedTargetPath.startsWith(resolvedBaseDir)) {
      const securityViolation = `Security Exception: Attempted access outside jail directory (${templateRelativePath})`;
      this.logger?.warn(securityViolation);
      throw new Error(securityViolation);
    }

    try {
      const content = await this.fileSystemProvider.readFile(
        resolvedTargetPath,
        options,
      );
      return Buffer.isBuffer(content) ? content : Buffer.from(content);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const executionFailure = `Discovered error while reading template "${templateRelativePath}": ${errorMessage}`;
      this.logger?.error(executionFailure);
      throw new Error(executionFailure);
    }
  }
}

/** Default singleton instance of the TemplateStorageService. */
export const defaultTemplateStorageService = new TemplateStorageService();

/**
 * Reads a template file using the default storage service instance.
 * @deprecated Use `defaultTemplateStorageService.readTemplateContent` directly instead.
 * @param templateName - Relative path or name of the template.
 * @param options - Additional read options.
 * @returns Raw Buffer of the template content.
 */
export async function readTemplate(
  templateName: string,
  options?: ReadTemplateOptions,
): Promise<Buffer> {
  return defaultTemplateStorageService.readTemplateContent(
    templateName,
    options,
  );
}
