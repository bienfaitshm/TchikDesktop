import fs from "node:fs";
import readline from "node:readline";
import { createLogger, format, transports } from "winston";
import { getUserDataPath } from "@/packages/electron-utility";

const { combine, timestamp, printf, colorize, errors, json } = format;

const LOG_DIRECTORY = getUserDataPath("logs");
const ERROR_LOG_PATH = `${LOG_DIRECTORY}/errors.log`;
const COMBINED_LOG_PATH = `${LOG_DIRECTORY}/combined.log`;

/**
 * Represents a structured log entry stored in the log file.
 */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  stack?: string;
  sent?: boolean;
  [key: string]: unknown;
}

/**
 * Custom console format for human readability during local execution.
 */
const consoleFormat = printf(
  ({ level, message, timestamp, context, stack }) => {
    const displayContext = context ? `[${context}] ` : "";
    return `${timestamp} ${level}: ${displayContext}${stack || message}`;
  },
);

/**
 * Primary Winston logger instance managing output transports.
 */
export const mainLogger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json(),
  ),
  transports: [
    new transports.Console({
      format: combine(colorize({ all: true }), consoleFormat),
    }),
    new transports.File({
      filename: ERROR_LOG_PATH,
      level: "error",
      format: combine(timestamp(), json()),
    }),
    new transports.File({
      filename: COMBINED_LOG_PATH,
      format: combine(timestamp(), json()),
    }),
  ],
});

/**
 * Factory creating a contextual logger bound to a specific component name.
 * @param context - Name of the calling module or service.
 * @returns Object providing logging methods for info, warn, error, and debug.
 */
export function getLogger(context: string) {
  return {
    /**
     * Logs an informational message with optional metadata.
     * @param message - The informational message text.
     * @param meta - Additional key-value metadata.
     */
    info: (message: string, meta?: Record<string, unknown>) =>
      mainLogger.info(message, { context, ...meta }),

    /**
     * Logs a warning message with optional metadata.
     * @param message - The warning message text.
     * @param meta - Additional key-value metadata.
     */
    warn: (message: string, meta?: Record<string, unknown>) =>
      mainLogger.warn(message, { context, ...meta }),

    /**
     * Logs an error message with contextual details and unique tracking payload.
     * @param message - The summary error message.
     * @param error - Caught error instance or details object.
     * @param meta - Additional key-value metadata.
     */
    error: (
      message: string,
      error?: unknown,
      meta?: Record<string, unknown>,
    ) => {
      const logId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const errorMeta =
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { errorDetail: error };

      mainLogger.error(message, {
        id: logId,
        context,
        sent: false,
        ...errorMeta,
        ...meta,
      });
    },

    /**
     * Logs a debug message with optional metadata.
     * @param message - The debug message text.
     * @param meta - Additional key-value metadata.
     */
    debug: (message: string, meta?: Record<string, unknown>) =>
      mainLogger.debug(message, { context, ...meta }),
  };
}

/**
 * Reads unsent error logs from the log file up to an optional specified limit.
 * @param limit - Maximum number of unsent error log entries to retrieve.
 * @returns Array of unsent LogEntry objects.
 */
export async function readUnsentErrorLogs(limit?: number): Promise<LogEntry[]> {
  if (!fs.existsSync(ERROR_LOG_PATH)) {
    return [];
  }

  const fileStream = fs.createReadStream(ERROR_LOG_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  const unsentLogs: LogEntry[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line) as LogEntry;
      if (!entry.sent) {
        unsentLogs.push(entry);
        if (limit && unsentLogs.length >= limit) {
          rl.close();
          break;
        }
      }
    } catch {
      // Skip invalid JSON lines
    }
  }

  return unsentLogs;
}

/**
 * Marks a batch of error log entries as sent by updating their status in the file.
 * @param logIds - List of log entry IDs to mark as processed.
 */
export async function markErrorsAsSent(logIds: string[]): Promise<void> {
  if (!fs.existsSync(ERROR_LOG_PATH) || logIds.length === 0) {
    return;
  }

  const targetIds = new Set(logIds);
  const fileStream = fs.createReadStream(ERROR_LOG_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });
  const updatedLines: string[] = [];

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const entry = JSON.parse(line) as LogEntry;
      if (entry.id && targetIds.has(entry.id)) {
        entry.sent = true;
      }
      updatedLines.push(JSON.stringify(entry));
    } catch {
      updatedLines.push(line);
    }
  }

  await fs.promises.writeFile(ERROR_LOG_PATH, updatedLines.join("\n") + "\n");
}

export type CustomLogger = ReturnType<typeof getLogger>;
export type Logger = CustomLogger;
