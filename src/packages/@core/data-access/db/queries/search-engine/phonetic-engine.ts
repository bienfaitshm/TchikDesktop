import { formatFullName } from "./utils";

type MatchedField = "firstName" | "middleName" | "lastName" | "fullName";
/** Represents a searchable domain entity. */
export interface SearchableEntity {
  id: string;
  type: "student" | "tutor";
  firstName: string;
  middleName: string;
  lastName: string;
}

/** Represents a search result containing matched item and score. */
export interface SearchResult<T extends SearchableEntity> {
  item: T;
  score: number;
  matchedField: MatchedField;
}

/** Defines configuration for executing searches. */
export interface SearchOptions {
  type?: "student" | "tutor" | "all";
  minScore?: number;
  maxResults?: number;
}

/** Interface for defining phonetic encoding behavior. */
export interface PhoneticEncoderStrategy {
  /**
   * Encodes raw text into a phonetic representation.
   * @param text String to encode.
   * @returns Phonetic key.
   */
  encode(text: string): string;
}

/** Encodes names using French and African phonetic patterns. */
export class FrancoAfricanPhoneticEncoder implements PhoneticEncoderStrategy {
  /**
   * Normalizes a string into its phonetic equivalent.
   * @param text Raw string.
   * @returns Phonetic string representation.
   */
  public encode(text: string): string {
    if (!text) return "";

    let normalized = text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/['\-\s]/g, "")
      .replace(/[^A-Z]/g, "");

    if (normalized.length === 0) return "";

    normalized = normalized
      .replace(/OUA/g, "W")
      .replace(/OU/g, "U")
      .replace(/EAU|AU/g, "O")
      .replace(/AI|EI/g, "E")
      .replace(/EIN|AIN|IN|UN/g, "IN")
      .replace(/TSH|TCH/g, "X")
      .replace(/DJ|DZH/g, "J")
      .replace(/NY|GN/g, "N")
      .replace(/KP/g, "P")
      .replace(/GB/g, "B")
      .replace(/^MB/, "B")
      .replace(/^ND/, "D")
      .replace(/^NG/, "G")
      .replace(/^NK/, "K")
      .replace(/^MP/, "P")
      .replace(/PH/g, "F")
      .replace(/TH/g, "T")
      .replace(/CH|SH/g, "X")
      .replace(/CK|QU|K/g, "K")
      .replace(/C(?=[EIY])/g, "S")
      .replace(/C/g, "K")
      .replace(/G(?=[EIY])/g, "J")
      .replace(/(.)\1+/g, "$1")
      .replace(/[STDXE]+$/, "");

    return normalized || text.toUpperCase().replace(/[^A-Z]/g, "");
  }
}

/** High-performance calculator for Levenshtein string distance. */
export class DistanceCalculator {
  /**
   * Calculates similarity score using a 1D array Levenshtein algorithm.
   * @param str1 First string to compare.
   * @param str2 Second string to compare.
   * @returns Normalized similarity score (0.0 to 1.0).
   */
  public static calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const len1 = str1.length;
    const len2 = str2.length;
    const maxLength = Math.max(len1, len2);

    if (maxLength === 0) return 1.0;
    if (Math.abs(len1 - len2) / maxLength > 0.7) return 0.0;

    let prevRow = new Int32Array(len2 + 1);
    let currRow = new Int32Array(len2 + 1);

    for (let j = 0; j <= len2; j++) prevRow[j] = j;

    for (let i = 1; i <= len1; i++) {
      currRow[0] = i;
      const char1 = str1.charCodeAt(i - 1);

      for (let j = 1; j <= len2; j++) {
        const cost = char1 === str2.charCodeAt(j - 1) ? 0 : 1;
        currRow[j] = Math.min(
          prevRow[j] + 1,
          currRow[j - 1] + 1,
          prevRow[j - 1] + cost,
        );
      }

      const temp = prevRow;
      prevRow = currRow;
      currRow = temp;
    }

    return 1.0 - prevRow[len2] / maxLength;
  }
}

interface IndexedItem<T extends SearchableEntity> {
  entity: T;
  firstNamePhonetic: string;
  middleNamePhonetic: string;
  lastNamePhonetic: string;
  fullNamePhonetic: string;
}

/** In-memory search engine for phonetic entity indexing and matching. */
export class PhoneticSearchEngine<
  T extends SearchableEntity = SearchableEntity,
> {
  private indexStore: IndexedItem<T>[] = [];
  private readonly encoder: PhoneticEncoderStrategy;

  /**
   * Initializes the engine with the provided or default phonetic encoder.
   * @param encoder Optional encoding strategy instance.
   */
  constructor(
    encoder: PhoneticEncoderStrategy = new FrancoAfricanPhoneticEncoder(),
  ) {
    this.encoder = encoder;
  }

  /**
   * Computes phonetic keys and indexes entities.
   * @param entities Array of entities to index.
   */
  public index(entities: T[]): void {
    const store: IndexedItem<T>[] = new Array(entities.length);
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i];
      const fullName = formatFullName(
        entity.lastName,
        entity.middleName,
        entity.firstName,
      );
      store[i] = {
        entity,
        firstNamePhonetic: this.encoder.encode(entity.firstName),
        lastNamePhonetic: this.encoder.encode(entity.lastName),
        middleNamePhonetic: this.encoder.encode(entity.middleName),
        fullNamePhonetic: this.encoder.encode(fullName),
      };
    }
    this.indexStore = store;
  }

  /**
   * Executes a phonetic search on indexed items using distance calculations.
   * @param query - The raw input search string.
   * @param options - Filtering and scoring options (type, minScore, maxResults).
   * @returns Array of search results matching criteria, sorted by score descending.
   */
  public search(query: string, options: SearchOptions = {}): SearchResult<T>[] {
    const cleanQuery = query.trim();
    if (!cleanQuery || this.indexStore.length === 0) return [];

    const { type = "all", minScore = 0.5, maxResults = 40 } = options;
    const queryPhonetic = this.encoder.encode(cleanQuery);
    const results: SearchResult<T>[] = [];

    for (const item of this.indexStore) {
      if (type !== "all" && item.entity.type !== type) continue;

      const { bestScore, matchedField } = this.getBestMatch(
        queryPhonetic,
        item,
      );

      if (bestScore >= minScore) {
        results.push({
          item: item.entity,
          score: bestScore,
          matchedField,
        });
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }

  /**
   * Calculates similarity across all phonetic fields of an item to find the highest match.
   * @param queryPhonetic - The encoded phonetic string of the search query.
   * @param item - The target indexed item containing phonetic fields.
   * @returns An object containing the maximum score achieved and the corresponding field name.
   */
  private getBestMatch(
    queryPhonetic: string,
    item: IndexedItem<T>,
  ): { bestScore: number; matchedField: MatchedField } {
    const fields: Array<{ field: MatchedField; value?: string }> = [
      { field: "firstName", value: item.firstNamePhonetic },
      { field: "lastName", value: item.lastNamePhonetic },
      { field: "middleName", value: item.middleNamePhonetic },
      { field: "fullName", value: item.fullNamePhonetic },
    ];

    let bestScore = -1;
    let matchedField: MatchedField = "fullName";

    for (const { field, value } of fields) {
      if (!value) continue;

      const score = DistanceCalculator.calculateSimilarity(
        queryPhonetic,
        value,
      );
      if (score > bestScore) {
        bestScore = score;
        matchedField = field;
      }
    }

    return { bestScore, matchedField };
  }
}
