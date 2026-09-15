import { db as defaultDb, type TDataBase } from "../../config";
import { StudentPreviewRepository, type Preview } from "./preview-repository";
import { SearchContext, SearchStrategy, SearchSuggestion } from "./types";

/**
 * Orchestrator resolving multiple search domain queries via injected strategies with caching capabilities.
 */
export class InternalSearchEngine {
  private static readonly CACHE_TTL_MS = 60000;
  private static readonly MAX_CACHE_SIZE = 500;

  private readonly strategies: SearchStrategy[];
  private readonly db: TDataBase;
  private readonly cache = new Map<
    string,
    { timestamp: number; data: SearchSuggestion[] }
  >();

  /**
   * Initializes the engine with concrete domain search strategies and a database client instance.
   * @param strategies - Array of execution strategies handling specific domain entities.
   * @param dbInstance - Optional database client instance, defaults to the system configuration DB.
   */
  constructor(strategies: SearchStrategy[], dbInstance: TDataBase = defaultDb) {
    this.strategies = strategies;
    this.db = dbInstance;
  }

  /**
   * Fetches detailed preview information for a specific user ID within a scoping context.
   * @param context - Active organizational context boundary (school, year).
   * @param userId - Optional unique student identifier to retrieve preview for.
   * @returns Resolves to the student Preview object or null if not provided or found.
   */
  public async getPreviewOfUser(
    context: SearchContext,
    userId?: string,
  ): Promise<Preview | null> {
    if (!userId) return null;

    const previewRepository = new StudentPreviewRepository(this.db, context);
    return previewRepository.mapSinglePreview(userId);
  }

  /**
   * Coordinates concurrent domain searches across all strategies and handles result caching.
   * @param query - Raw search query string.
   * @param context - Active organizational context boundaries.
   * @param limitPerCategory - Maximum result count allowed per domain category (defaults to 3).
   * @returns Consolidated array of flattened search suggestions.
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

    if (cached) {
      if (Date.now() - cached.timestamp < InternalSearchEngine.CACHE_TTL_MS) {
        this.cache.delete(cacheKey);
        this.cache.set(cacheKey, cached);
        return cached.data;
      }
      this.cache.delete(cacheKey);
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
