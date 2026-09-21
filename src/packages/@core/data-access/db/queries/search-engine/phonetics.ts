/**
 * Represents the raw structure of a document retrieved from storage.
 */
export interface SearchDocument {
  readonly id: string;
  readonly title: string;
  readonly content: string;
}

/**
 * Represents a document heavily pre-processed for in-memory searching.
 */
export interface IndexedDocument {
  readonly original: SearchDocument;
  readonly tokens: readonly string[];
  readonly trigrams: ReadonlySet<string>;
  readonly phonetics: ReadonlySet<string>;
}

/**
 * Represents an individual match matched by a strategy.
 */
export interface SearchMatch {
  readonly document: IndexedDocument;
  readonly score: number;
  readonly matchedBy: string;
}

/**
 * Encapsulates parameters for executing a search query.
 */
export interface SearchQuery {
  readonly term: string;
  readonly limit: number;
  readonly offset: number;
  readonly minScoreThreshold: number;
}

/**
 * Represents the structured paginated search response.
 */
export interface SearchResult {
  readonly matches: readonly SearchMatch[];
  readonly totalMatches: number;
  readonly executionTimeMs: number;
}

/**
 * Defines a pluggable search matching algorithm.
 */
export interface SearchStrategy {
  readonly name: string;

  /**
   * Evaluates pre-indexed candidate documents against the query string.
   * @param query - The normalized search term.
   * @param candidates - List of pre-indexed documents to evaluate.
   * @returns Array of matches with relevance scores (0.0 to 1.0).
   */
  search(query: string, candidates: readonly IndexedDocument[]): SearchMatch[];
}

/**
 * Utility class for high-performance string metric algorithms.
 */
export class StringMetrics {
  /**
   * Computes Levenshtein edit distance using space-optimized sliding arrays O(N).
   * @param source - Source string.
   * @param target - Target string to compare against.
   * @returns Minimum number of single-character edits required.
   */
  public static calculateLevenshteinDistance(
    source: string,
    target: string,
  ): number {
    if (source === target) return 0;
    if (source.length === 0) return target.length;
    if (target.length === 0) return source.length;

    let v0 = new Int32Array(target.length + 1);
    let v1 = new Int32Array(target.length + 1);

    for (let i = 0; i <= target.length; i++) v0[i] = i;

    for (let i = 0; i < source.length; i++) {
      v1[0] = i + 1;
      for (let j = 0; j < target.length; j++) {
        const cost = source[i] === target[j] ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }
      const temp = v0;
      v0 = v1;
      v1 = temp;
    }

    return v0[target.length];
  }

  /**
   * Generates character N-grams from an input string.
   * @param text - Input text string.
   * @param size - Character window size.
   * @returns Set of generated N-gram strings.
   */
  public static generateNGrams(text: string, size: number = 3): Set<string> {
    const normalized = `  ${text}  `;
    const nGrams = new Set<string>();
    for (let i = 0; i <= normalized.length - size; i++) {
      nGrams.add(normalized.substring(i, i + size));
    }
    return nGrams;
  }

  /**
   * Encodes a string into its 4-character Soundex phonetic representation.
   * @param text - Input word to encode.
   * @returns Soundex phonetic code.
   */
  public static encodeSoundex(text: string): string {
    const cleaned = text.toUpperCase().replace(/[^A-Z]/g, "");
    if (!cleaned) return "0000";

    const mapping: Record<string, string> = {
      B: "1",
      F: "1",
      P: "1",
      V: "1",
      C: "2",
      G: "2",
      J: "2",
      K: "2",
      Q: "2",
      S: "2",
      X: "2",
      Z: "2",
      D: "3",
      T: "3",
      L: "4",
      M: "5",
      N: "5",
      R: "6",
    };

    const firstLetter = cleaned[0];
    const codes: string[] = [firstLetter];
    let previousCode = mapping[firstLetter] ?? "";

    for (let i = 1; i < cleaned.length && codes.length < 4; i++) {
      const code = mapping[cleaned[i]] ?? "";
      if (code && code !== previousCode) {
        codes.push(code);
        previousCode = code;
      } else if (!"AEIOUYHW".includes(cleaned[i])) {
        previousCode = "";
      }
    }

    return codes.join("").padEnd(4, "0");
  }
}

/**
 * Service responsible for pre-computing heavy string metrics on documents.
 */
export class DocumentIndexer {
  /**
   * Transforms a raw search document into a fully indexed memory entity.
   * @param doc - Raw document from storage.
   * @returns Pre-computed indexed document.
   */
  public index(doc: SearchDocument): IndexedDocument {
    const fullText = `${doc.title} ${doc.content}`.toLowerCase().trim();
    const tokens = fullText.split(/\s+/).filter(Boolean);
    const trigrams = StringMetrics.generateNGrams(fullText, 3);
    const phonetics = new Set(tokens.map(StringMetrics.encodeSoundex));

    return {
      original: doc,
      tokens,
      trigrams,
      phonetics,
    };
  }
}

/**
 * Configuration schema for the Levenshtein search strategy.
 */
export interface LevenshteinConfig {
  readonly distanceToleranceMap: Record<number, number>; // Maps max word length to max allowed distance
}

/**
 * Strategy applying Levenshtein distance on indexed tokens.
 */
export class LevenshteinSearchStrategy implements SearchStrategy {
  public readonly name = "LevenshteinFuzzy";

  constructor(
    private readonly config: LevenshteinConfig = {
      distanceToleranceMap: { 4: 1, 8: 2, 999: 3 },
    },
  ) {}

  /**
   * Executes fuzzy matching on document tokens.
   * @param query - Normalized search query term.
   * @param candidates - Pre-indexed document collection.
   * @returns Array of matches exceeding threshold.
   */
  public search(
    query: string,
    candidates: readonly IndexedDocument[],
  ): SearchMatch[] {
    if (!query) return [];
    const matches: SearchMatch[] = [];
    const maxDistance = this.getMaxAllowedDistance(query.length);

    for (const doc of candidates) {
      let minDistance = Infinity;
      for (const token of doc.tokens) {
        if (Math.abs(token.length - query.length) > maxDistance) continue;
        const distance = StringMetrics.calculateLevenshteinDistance(
          query,
          token,
        );
        if (distance < minDistance) minDistance = distance;
      }

      if (minDistance <= maxDistance) {
        const score = 1 - minDistance / Math.max(query.length, 1);
        matches.push({ document: doc, score, matchedBy: this.name });
      }
    }

    return matches;
  }

  /**
   * Determines dynamic distance threshold based on word length.
   * @param length - Length of the word.
   * @returns Maximum allowed edit distance.
   */
  private getMaxAllowedDistance(length: number): number {
    const thresholds = Object.keys(this.config.distanceToleranceMap)
      .map(Number)
      .sort((a, b) => a - b);
    for (const limit of thresholds) {
      if (length <= limit) return this.config.distanceToleranceMap[limit];
    }
    return 3;
  }
}

/**
 * Configuration schema for the Trigram search strategy.
 */
export interface TrigramConfig {
  readonly minJaccardIndex: number;
}

/**
 * Strategy utilizing pre-computed Trigrams for fast partial matching.
 */
export class TrigramSearchStrategy implements SearchStrategy {
  public readonly name = "TrigramNGram";

  constructor(
    private readonly config: TrigramConfig = { minJaccardIndex: 0.15 },
  ) {}

  /**
   * Computes similarity between query and pre-indexed candidate trigrams.
   * @param query - Normalized search query term.
   * @param candidates - Pre-indexed document collection.
   * @returns Matched documents with similarity scores.
   */
  public search(
    query: string,
    candidates: readonly IndexedDocument[],
  ): SearchMatch[] {
    const queryGrams = StringMetrics.generateNGrams(query, 3);
    if (queryGrams.size === 0) return [];
    const matches: SearchMatch[] = [];

    for (const doc of candidates) {
      if (doc.trigrams.size === 0) continue;

      let intersection = 0;
      for (const gram of queryGrams) {
        if (doc.trigrams.has(gram)) intersection++;
      }

      const unionSize = queryGrams.size + doc.trigrams.size - intersection;
      const score = unionSize === 0 ? 0 : intersection / unionSize;

      if (score >= this.config.minJaccardIndex) {
        matches.push({ document: doc, score, matchedBy: this.name });
      }
    }

    return matches;
  }
}

/**
 * Configuration schema for the Soundex search strategy.
 */
export interface SoundexConfig {
  readonly exactMatchScore: number;
}

/**
 * Strategy evaluating pre-computed phonetic codes.
 */
export class SoundexPhoneticStrategy implements SearchStrategy {
  public readonly name = "SoundexPhonetic";

  constructor(
    private readonly config: SoundexConfig = { exactMatchScore: 0.75 },
  ) {}

  /**
   * Matches documents based on their indexed phonetic codes.
   * @param query - Normalized search query term.
   * @param candidates - Pre-indexed document collection.
   * @returns Phonetically matched documents.
   */
  public search(
    query: string,
    candidates: readonly IndexedDocument[],
  ): SearchMatch[] {
    const queryCode = StringMetrics.encodeSoundex(query);
    if (queryCode === "0000") return [];

    const matches: SearchMatch[] = [];

    for (const doc of candidates) {
      if (doc.phonetics.has(queryCode)) {
        matches.push({
          document: doc,
          score: this.config.exactMatchScore,
          matchedBy: this.name,
        });
      }
    }

    return matches;
  }
}

/**
 * High-performance search engine coordinating decoupled search algorithms.
 */
export class SearchEngine {
  constructor(private readonly strategies: readonly SearchStrategy[]) {
    if (!strategies || strategies.length === 0) {
      throw new Error("SearchEngine requires at least one SearchStrategy.");
    }
  }

  /**
   * Executes multi-strategy evaluation and aggregates highest relevance scores.
   * @param query - The request parameters defining term and pagination.
   * @param indexData - The collection of pre-processed documents to search through.
   * @returns Aggregated and sorted search results.
   */
  public execute(
    query: SearchQuery,
    indexData: readonly IndexedDocument[],
  ): SearchResult {
    const startTime = Date.now();
    const normalizedTerm = query.term.toLowerCase().trim();

    if (!normalizedTerm) {
      return {
        matches: [],
        totalMatches: 0,
        executionTimeMs: Date.now() - startTime,
      };
    }

    const scoreMap = new Map<string, SearchMatch>();

    for (const strategy of this.strategies) {
      const strategyMatches = strategy.search(normalizedTerm, indexData);

      for (const match of strategyMatches) {
        const existing = scoreMap.get(match.document.original.id);
        const combinedScore = existing
          ? Math.max(existing.score, match.score)
          : match.score;

        if (combinedScore >= query.minScoreThreshold) {
          scoreMap.set(match.document.original.id, {
            document: match.document,
            score: Number(combinedScore.toFixed(4)),
            matchedBy: existing
              ? `${existing.matchedBy}+${match.matchedBy}`
              : match.matchedBy,
          });
        }
      }
    }

    const sortedMatches = Array.from(scoreMap.values()).sort(
      (a, b) => b.score - a.score,
    );
    const paginatedMatches = sortedMatches.slice(
      query.offset,
      query.offset + query.limit,
    );

    return {
      matches: paginatedMatches,
      totalMatches: sortedMatches.length,
      executionTimeMs: Date.now() - startTime,
    };
  }
}
