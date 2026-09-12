import type { Preview } from "./preview-repository";

/**
 * Defines the supported entity types for global search operations.
 */
export type SearchEntityType = "STUDENT" | "TUTOR";

/**
 * Encapsulates organizational boundary parameters required for contextual queries.
 */
export interface SearchContext {
  /** Target school identifier. */
  schoolId: string;
  /** Active academic year identifier. */
  yearId: string;
}

/**
 * Base UI projection model for any search result suggestion.
 * @template T - The specific search entity type discriminator.
 * @template P - The preview payload structure associated with the entity.
 */
export interface BaseSuggestion<T extends SearchEntityType, P> {
  /** Unique entity identifier. */
  id: string;
  score: number;
  /** Entity category discriminator. */
  type: T;
  /** Primary label display text (e.g., full name). */
  title: string;
  /** Secondary label display text (e.g., code, phone number). */
  subtitle: string;
  /** Optional URL for the entity portrait or logo. */
  avatarUrl?: string;
  /** Detailed domain object for previewing the entity. */
  preview: P;
}

/**
 * Search suggestion specific to student entities.
 */
export type StudentSuggestion = BaseSuggestion<"STUDENT", Preview>;

/**
 * Search suggestion specific to tutor entities.
 */
export type TutorSuggestion = BaseSuggestion<"TUTOR", Preview>;

/**
 * Polymorphic union of all available search suggestion domain types.
 */
export type SearchSuggestion = StudentSuggestion | TutorSuggestion;

/**
 * Defines the contract for a bounded search strategy targeting a specific entity.
 */
export interface SearchStrategy {
  /** The specific entity category handled by this strategy. */
  readonly entityType: SearchEntityType;

  /**
   * Executes a search query returning strongly-typed suggestions within a given context.
   * @param query - Raw search term entered by the user.
   * @param context - Organizational context boundary (school, year).
   * @param limit - Maximum amount of results to retrieve.
   * @returns Array of formatted search suggestions matching the query.
   */
  search(
    query: string,
    context: SearchContext,
    limit: number,
  ): Promise<SearchSuggestion[]>;
}
