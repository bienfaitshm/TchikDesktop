import { promises as fsPromises } from "node:fs";
import path from "node:path";
import type { Abortable } from "node:events";
import { getResourcePath } from "@/packages/electron-utility";

const DEFAULT_TEMPLATES_DIR = "documents_templates";

/**
 * Options de lecture basées sur les types natifs de Node.js pour fs.promises.readFile
 */
export type ReadTemplateOptions =
  | (Omit<Parameters<typeof fsPromises.readFile>[1], "encoding"> & {
      encoding?: null;
    } & Abortable)
  | null;

export interface DocumentTemplateConfig {
  templateName: string;
  templateData: Record<string, unknown>;
}

export interface ILogger {
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

/**
 * Récupère le chemin de base configuré pour les templates.
 */
export function getTemplateRepositoryPath(): string {
  const envDir = process.env.DOCUMENT_TEMPLATES_DIR;
  return getResourcePath(envDir ?? DEFAULT_TEMPLATES_DIR);
}

/**
 * @class TemplateStorageService
 * Gère l'accès sécurisé et la lecture des fichiers de templates.
 * Implémente une vérification stricte contre les attaques par traversée de fichiers (Path Traversal).
 */
export class TemplateStorageService {
  private readonly baseDirectoryPath: string;
  private readonly resolvedBaseDirectoryPath: string;
  private readonly fileSystemProvider: typeof fsPromises;
  private readonly logger?: ILogger;

  constructor(
    baseDirectoryPath?: string,
    fileSystemProvider: typeof fsPromises = fsPromises,
    logger?: ILogger,
  ) {
    this.baseDirectoryPath = path.resolve(
      baseDirectoryPath ?? getTemplateRepositoryPath(),
    );
    this.resolvedBaseDirectoryPath = path.resolve(this.baseDirectoryPath);
    this.fileSystemProvider = fileSystemProvider;
    this.logger = logger;
  }

  /**
   * Lit le contenu d'un template de manière sécurisée sous forme de Buffer.
   * * @param templateRelativePath - Chemin relatif du template (ex: "invoice.docx")
   * @param options - Options d'annulation ou de drapeaux système
   * @throws {Error} Si le chemin est invalide ou sort du répertoire racine.
   */
  public async readTemplateContent(
    templateRelativePath: string,
    options?: ReadTemplateOptions,
  ): Promise<Buffer> {
    if (!templateRelativePath || templateRelativePath.trim() === "") {
      throw new Error("Template path invocation error: path cannot be empty.");
    }

    if (templateRelativePath.includes("..")) {
      const securityWarning = `Potential Path Traversal detected via relative path: ${templateRelativePath}`;
      this.logger?.warn(securityWarning);
      throw new Error(securityWarning);
    }

    const targetPath = path.join(this.baseDirectoryPath, templateRelativePath);

    let resolvedTargetPath: string;
    try {
      resolvedTargetPath = await this.fileSystemProvider.realpath(targetPath);
    } catch (error) {
      throw new Error(
        `Template resource not found or inaccessible: ${templateRelativePath} (Target: ${targetPath})`,
      );
    }

    if (!resolvedTargetPath.startsWith(this.resolvedBaseDirectoryPath)) {
      const securityViolation = `Security Exception: Attempted access outside jail directory (${templateRelativePath})`;
      this.logger?.warn(securityViolation);
      throw new Error(securityViolation);
    }

    try {
      return (await this.fileSystemProvider.readFile(
        resolvedTargetPath,
        options,
      )) as Buffer;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const executionFailure = `Discovered error while reading template "${templateRelativePath}": ${errorMessage}`;
      this.logger?.error(executionFailure);
      throw new Error(executionFailure);
    }
  }
}

/**
 * Instance partagée (Singleton) par défaut.
 */
export const defaultTemplateStorageService = new TemplateStorageService();

/**
 * @deprecated Use `defaultTemplateStorageService.readTemplateContent` directly instead to comply with Dependency Injection standards.
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
