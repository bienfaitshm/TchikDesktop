import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize, errors, json } = format;

/**
 * Format de sortie personnalisé pour la Console (lisible par l'humain).
 */
const consoleFormat = printf(
  ({ level, message, timestamp, context, stack }) => {
    const displayContext = context ? `[${context}] ` : "";
    // Si une stack trace existe (erreur), on l'affiche, sinon juste le message
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
    // 1. CONSOLE : Format coloré et lisible
    new transports.Console({
      format: combine(colorize({ all: true }), consoleFormat),
    }),

    // 2. ERRORS LOG : Enregistre uniquement les erreurs avec détails complets
    new transports.File({
      filename: "loggs/errors.log",
      level: "error",
      // On garde un format texte détaillé pour le fichier d'erreur pour faciliter la lecture directe
      format: combine(timestamp(), consoleFormat),
    }),

    // 3. COMBINED LOG : Toutes les activités en format JSON (idéal pour analyse)
    new transports.File({
      filename: "loggs/combined.log",
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
      // Si l'erreur est passée en 2ème argument, Winston la fusionne grâce à format.errors()
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
