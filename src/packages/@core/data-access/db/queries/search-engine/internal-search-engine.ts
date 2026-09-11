import { SearchContext, SearchStrategy, SearchSuggestion } from "./types";

/** Orchestrator resolving multiple search domain queries via injected strategies. */
export class InternalSearchEngine {
  private static readonly CACHE_TTL_MS = 60000; // 1 minute TTL instead of 0
  private static readonly MAX_CACHE_SIZE = 500;

  private readonly strategies: SearchStrategy[];
  private readonly cache = new Map<
    string,
    { timestamp: number; data: SearchSuggestion[] }
  >();

  /**
   * Initializes the engine with concrete domain search strategies.
   * @param strategies Array of execution strategies.
   */
  constructor(strategies: SearchStrategy[]) {
    this.strategies = strategies;
  }

  /**
   * Coordinates concurrent searches and manages result caching logic.
   * @param query Term to search.
   * @param context Active context boundaries.
   * @param limitPerCategory Maximum entries per domain strategy.
   * @returns Flattened array of consolidated search results.
   */
  public async search(
    query: string,
    context: SearchContext,
    limitPerCategory = 3,
  ): Promise<SearchSuggestion[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length <= 1) return [];

    const cacheKey = `${context.schoolId}:${context.yearId}:${cleanQuery}:${limitPerCategory}`;
    const cached = this.cache.get(cacheKey);

    if (
      cached &&
      Date.now() - cached.timestamp < InternalSearchEngine.CACHE_TTL_MS
    ) {
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
