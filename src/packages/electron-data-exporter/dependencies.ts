import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";

export interface IFileService {
  promptSavePath(options: unknown): Promise<string | null>;
  getFileExtension(path: string): DOCUMENT_EXTENSION | null;
  persistToDisk(path: string, data: unknown): Promise<void>;
}

export interface ILogger {
  info(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
  error(message: string, error?: Error | unknown): void;
}

export interface ILoggerFactory {
  createLogger(context: string): ILogger;
}
