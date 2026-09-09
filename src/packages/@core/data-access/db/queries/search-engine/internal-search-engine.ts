import type { SearchContext, SearchStrategy, SearchSuggestion } from "./types";

/**
 * Main orchestrator executing parallel search strategies and managing results cache.
 */
export class InternalSearchEngine {
  private static readonly CACHE_TTL_MS = 30000;
  private static readonly MAX_CACHE_SIZE = 500;

  private readonly strategies: SearchStrategy[];
  private readonly cache = new Map<
    string,
    { timestamp: number; data: SearchSuggestion[] }
  >();

  /**
   * Injects domain-specific search strategies.
   * @param strategies - Array of instantiated search strategies.
   */
  constructor(strategies: SearchStrategy[]) {
    this.strategies = strategies;
  }

  /**
   * Executes strategies in parallel and caches results per query context.
   * @param query - Input string to search.
   * @param context - Contextual boundaries (school, year).
   * @param limitPerCategory - Maximum items per strategy type (default: 3).
   * @returns Consolidated array of cross-domain suggestions.
   */
  public async search(
    query: string,
    context: SearchContext,
    limitPerCategory = 3,
  ): Promise<SearchSuggestion[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) return [];

    const cacheKey = `${context.schoolId}:${context.yearId}:${cleanQuery}:${limitPerCategory}`;
    const cached = this.cache.get(cacheKey);

    if (
      cached &&
      Date.now() - cached.timestamp < InternalSearchEngine.CACHE_TTL_MS
    ) {
      // True LRU: Delete and re-insert to move key to the end of the Map
      this.cache.delete(cacheKey);
      this.cache.set(cacheKey, cached);
      return cached.data;
    }

    const tasks = this.strategies.map((strategy) =>
      strategy.search(cleanQuery, context, limitPerCategory).catch((err) => {
        console.error(`[SearchEngine] Failure in ${strategy.entityType}:`, err);
        return [] as SearchSuggestion[];
      }),
    );

    const results = (await Promise.all(tasks)).flat();

    if (this.cache.size >= InternalSearchEngine.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }

    this.cache.set(cacheKey, { timestamp: Date.now(), data: results });

    return results;
  }
}
