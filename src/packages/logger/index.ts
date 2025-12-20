import { createLogger, format, transports } from "winston";
const { combine, timestamp, printf, colorize } = format;

// Format personnalisé pour afficher le contexte et le message
const logFormat = printf(({ level, message, timestamp, context }) => {
  return `${timestamp} [${context}] ${level}: ${message}`;
});

export const mainLogger = createLogger({
  level: "info", // Niveau de log minimum pour la production (info, warn, error)
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }) // Pour logger les stacks d'erreurs complètes
  ),
  transports: [
    // 1. Console (pour le développement)
    new transports.Console({
      format: combine(
        colorize({ all: true }), // Ajoute la couleur pour la console
        logFormat
      ),
    }),

    // 2. Fichier (pour la production/archivage)
    new transports.File({
      filename: "loggs/errors.log",
      level: "error",
      format: logFormat,
    }),
    new transports.File({
      filename: "loggs/combined.log",
      format: logFormat,
    }),
  ],
});

/**
 * Fonction utilitaire pour créer un logger avec un contexte spécifique.
 * @param context Le nom de la classe ou du module (ex: 'DocumentExportService').
 */
export function getLogger(context: string) {
  return {
    info: (message: string, meta?: any) =>
      mainLogger.info(message, { context, ...meta }),
    warn: (message: string, meta?: any) =>
      mainLogger.warn(message, { context, ...meta }),
    error: (message: string, error?: Error | string | unknown, meta?: any) => {
      if (error instanceof Error) {
        // Envoie l'objet Error pour que 'format.errors({ stack: true })' l'utilise.
        mainLogger.error(message, { context, error, ...meta });
      } else {
        mainLogger.error(message, { context, error, ...meta });
      }
    },
    // Utilisez 'debug' ou 'verbose' pour des détails supplémentaires non affichés en 'info'
  };
}

export type CustomLogger = ReturnType<typeof getLogger>;
