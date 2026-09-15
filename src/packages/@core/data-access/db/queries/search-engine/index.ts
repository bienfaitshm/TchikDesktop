import { db as defaultDb, type TDataBase } from "../../config";
import { InternalSearchEngine } from "./internal-search-engine";
import { StudentSearchStrategy } from "./search-strategy";

export * from "./types";
export * from "./internal-search-engine";
export * from "./search-strategy";
export * from "./preview-repository";

/**
 * Creates and configures an instance of InternalSearchEngine with default strategies.
 * @param dbInstance - Optional database client instance. Defaults to application global DB.
 * @returns Configured InternalSearchEngine ready to process search queries.
 */
export function createSearchEngine(
  dbInstance: TDataBase = defaultDb,
): InternalSearchEngine {
  return new InternalSearchEngine(
    [new StudentSearchStrategy(dbInstance)],
    defaultDb,
  );
}

/**
 * Default singleton instance of the internal search engine for application-wide consumption.
 */
export const searchEngine: InternalSearchEngine = createSearchEngine();
