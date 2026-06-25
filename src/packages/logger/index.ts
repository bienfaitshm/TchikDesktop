import { createLogger, format, transports } from "winston";
import { getUserDataPath } from "@/packages/electron-utility";
const { combine, timestamp, printf, colorize, errors, json } = format;

/**
 * Format de sortie personnalisé pour la Console (lisible par l'humain).
 */
const consoleFormat = printf(
  ({ level, message, timestamp, context, stack }) => {
    const displayContext = context ? `[${context}] ` : "";
    return `${timestamp} ${level}: ${displayContext}${stack || message}`;
  },
);

/**
 * Configuration principale du logger Winston.
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
      filename: getUserDataPath("loggs/errors.log"),
      level: "error",
      format: combine(timestamp(), consoleFormat),
    }),

    new transports.File({
      filename: getUserDataPath("loggs/combined.log"),
    }),
  ],
});

/**
 * Factory pour obtenir un logger contextuel.
 * @param context Nom du module/service (ex: 'StatsService').
 */
export function getLogger(context: string) {
  return {
    info: (message: string, meta?: any) =>
      mainLogger.info(message, { context, ...meta }),

    warn: (message: string, meta?: any) =>
      mainLogger.warn(message, { context, ...meta }),

    error: (message: string, error?: any, meta?: any) => {
      if (error instanceof Error) {
        mainLogger.error(message, {
          context,
          message: error.message,
          stack: error.stack,
          ...meta,
        });
      } else {
        mainLogger.error(
          `${message}${error ? " : " + JSON.stringify(error) : ""}`,
          { context, ...meta },
        );
      }
    },

    debug: (message: string, meta?: any) =>
      mainLogger.debug(message, { context, ...meta }),
  };
}

export type CustomLogger = ReturnType<typeof getLogger>;
