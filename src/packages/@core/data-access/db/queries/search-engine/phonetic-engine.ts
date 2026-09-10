/** Represents a searchable domain entity. */
export interface SearchableEntity {
  id: string;
  type: "student" | "tutor";
  firstName: string;
  lastName: string;
}

/** Represents a search result containing matched item and score. */
export interface SearchResult<T extends SearchableEntity> {
  item: T;
  score: number;
  matchedField: "firstName" | "lastName" | "fullName";
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
      const fullName = `${entity.firstName} ${entity.lastName}`;
      store[i] = {
        entity,
        firstNamePhonetic: this.encoder.encode(entity.firstName),
        lastNamePhonetic: this.encoder.encode(entity.lastName),
        fullNamePhonetic: this.encoder.encode(fullName),
      };
    }
    this.indexStore = store;
  }

  /**
   * Executes a fuzzy search over indexed items.
   * @param query Input text query.
   * @param options Filtering and threshold constraints.
   * @returns Array of matches sorted by descending score.
   */
  public search(query: string, options: SearchOptions = {}): SearchResult<T>[] {
    const cleanQuery = query.trim();
    if (!cleanQuery || this.indexStore.length === 0) return [];

    const { type = "all", minScore = 0.6, maxResults = 20 } = options;
    const queryPhonetic = this.encoder.encode(cleanQuery);
    const results: SearchResult<T>[] = [];

    for (let i = 0; i < this.indexStore.length; i++) {
      const item = this.indexStore[i];
      if (type !== "all" && item.entity.type !== type) continue;

      const fNameScore = DistanceCalculator.calculateSimilarity(
        queryPhonetic,
        item.firstNamePhonetic,
      );
      const lNameScore = DistanceCalculator.calculateSimilarity(
        queryPhonetic,
        item.lastNamePhonetic,
      );
      const fNameFullScore = DistanceCalculator.calculateSimilarity(
        queryPhonetic,
        item.fullNamePhonetic,
      );

      const maxMatchedScore = Math.max(fNameScore, lNameScore, fNameFullScore);

      if (maxMatchedScore >= minScore) {
        let matchedField: "firstName" | "lastName" | "fullName" = "fullName";
        if (maxMatchedScore === fNameScore) matchedField = "firstName";
        else if (maxMatchedScore === lNameScore) matchedField = "lastName";

        results.push({
          item: item.entity,
          score: maxMatchedScore,
          matchedField,
        });
      }
    }
    return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
  }
}
