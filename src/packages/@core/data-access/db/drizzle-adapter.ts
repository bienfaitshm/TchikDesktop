import type { CustomLogger } from "@/packages/logger";
import type { Logger } from "drizzle-orm";

/**
 * Adaptateur pour mapper le CustomLogger interne sur l'interface attendue par Drizzle.
 * L'implémentation de l'interface 'Logger' de Drizzle assure la compatibilité type-safe.
 */
export function createDrizzleLogger(logger: CustomLogger): Logger {
  return {
    logQuery(query: string, params: unknown[]): void {
      logger.info(
        `[SQL Query] ${query.substring(0, 256)}${query.length > 256 ? "..." : ""}`,
        {
          sql: query,
          params,
          source: "drizzle",
        },
      );
    },
  };
}
