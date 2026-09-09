/**
 * Represents a base searchable entity within the system.
 */
export interface SearchableEntity {
  id: string;
  type: "student" | "tutor";
  firstName: string;
  lastName: string;
}

/**
 * Represents a student domain entity.
 */
export interface Student extends SearchableEntity {
  type: "student";
  gradeLevel?: string;
}

/**
 * Represents a tutor domain entity.
 */
export interface Tutor extends SearchableEntity {
  type: "tutor";
  subjects?: string[];
}

/**
 * Encapsulates a search result containing the matched entity and relevance score.
 * @template T - Type extending SearchableEntity.
 */
export interface SearchResult<T extends SearchableEntity> {
  item: T;
  score: number;
  matchedField: "firstName" | "lastName" | "fullName";
}

/**
 * Configuration options to filter and control search execution.
 */
export interface SearchOptions {
  type?: "student" | "tutor" | "all";
  minScore?: number;
  maxResults?: number;
}

/**
 * Strategy interface defining phonetic encoding behavior.
 */
export interface PhoneticEncoderStrategy {
  /**
   * Transforms raw text into its phonetic representation.
   * @param text - Raw text string.
   * @returns Phonetic key.
   */
  encode(text: string): string;
}

/**
 * Phonetic encoder supporting both French and African name patterns.
 */
export class FrancoAfricanPhoneticEncoder implements PhoneticEncoderStrategy {
  /**
   * Encodes a name into a unified phonetic key handling African and French phonetics.
   * @param text - Raw text to encode.
   * @returns Normalized phonetic key.
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
      // African & French vowel/diphthong equivalences
      .replace(/OUA/g, "W")
      .replace(/OU/g, "U")
      .replace(/EAU|AU/g, "O")
      .replace(/AI|EI/g, "E")
      .replace(/EIN|AIN|IN|UN/g, "IN")
      // African complex consonants & pre-nasalized initial patterns
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
      // Common French consonant rules
      .replace(/PH/g, "F")
      .replace(/TH/g, "T")
      .replace(/CH|SH/g, "X")
      .replace(/CK|QU|K/g, "K")
      .replace(/C(?=[EIY])/g, "S")
      .replace(/C/g, "K")
      .replace(/G(?=[EIY])/g, "J")
      // Remove double letters
      .replace(/(.)\1+/g, "$1")
      // Strip silent trailing letters
      .replace(/[STDXE]+$/, "");

    return normalized || text.toUpperCase().replace(/[^A-Z]/g, "");
  }
}

/**
 * High-performance metric calculator for string distance.
 */
export class DistanceCalculator {
  /**
   * Calculates similarity score between two strings using optimized 1D memory Levenshtein distance.
   * @param str1 - First comparison string.
   * @param str2 - Second comparison string.
   * @returns Similarity score between 0.0 and 1.0.
   */
  public static calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (!str1 || !str2) return 0.0;

    const len1 = str1.length;
    const len2 = str2.length;
    const maxLength = Math.max(len1, len2);

    if (Math.abs(len1 - len2) / maxLength > 0.7) return 0.0;

    let prevRow = new Int32Array(len2 + 1);
    let currRow = new Int32Array(len2 + 1);

    for (let j = 0; j <= len2; j++) {
      prevRow[j] = j;
    }

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

    const distance = prevRow[len2];
    return 1.0 - distance / maxLength;
  }
}

/**
 * Internal index entry caching entity reference and precomputed phonetic tokens.
 */
interface IndexedItem<T extends SearchableEntity> {
  entity: T;
  firstNamePhonetic: string;
  lastNamePhonetic: string;
  fullNamePhonetic: string;
}

/**
 * Production-ready search engine supporting fuzzy phonetic search over searchable entities.
 * @template T - Type extending SearchableEntity.
 */
export class PhoneticSearchEngine<
  T extends SearchableEntity = SearchableEntity,
> {
  private indexStore: IndexedItem<T>[] = [];
  private readonly encoder: PhoneticEncoderStrategy;

  /**
   * Initializes the search engine with a phonetic encoder strategy.
   * @param encoder - Custom strategy or default FrancoAfricanPhoneticEncoder.
   */
  constructor(
    encoder: PhoneticEncoderStrategy = new FrancoAfricanPhoneticEncoder(),
  ) {
    this.encoder = encoder;
  }

  /**
   * Pre-computes phonetic keys and indexes entities in memory.
   * @param entities - Entities to index.
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
   * Executes a fuzzy phonetic search over indexed entities.
   * @param query - Input string query.
   * @param options - Search constraints and filtering options.
   * @returns Matched entities sorted by descending similarity score.
   */
  public search(query: string, options: SearchOptions = {}): SearchResult<T>[] {
    const cleanQuery = query.trim();

    if (!cleanQuery || this.indexStore.length === 0) {
      return [];
    }

    const { type = "all", minScore = 0.6, maxResults = 20 } = options;
    const queryPhonetic = this.encoder.encode(cleanQuery);
    const results: SearchResult<T>[] = [];

    for (let i = 0; i < this.indexStore.length; i++) {
      const item = this.indexStore[i];

      if (type !== "all" && item.entity.type !== type) {
        continue;
      }

      const firstNameScore = DistanceCalculator.calculateSimilarity(
        queryPhonetic,
        item.firstNamePhonetic,
      );
      const lastNameScore = DistanceCalculator.calculateSimilarity(
        queryPhonetic,
        item.lastNamePhonetic,
      );
      const fullNameScore = DistanceCalculator.calculateSimilarity(
        queryPhonetic,
        item.fullNamePhonetic,
      );

      const maxMatchedScore = Math.max(
        firstNameScore,
        lastNameScore,
        fullNameScore,
      );

      if (maxMatchedScore >= minScore) {
        let matchedField: "firstName" | "lastName" | "fullName" = "fullName";
        if (maxMatchedScore === firstNameScore) {
          matchedField = "firstName";
        } else if (maxMatchedScore === lastNameScore) {
          matchedField = "lastName";
        }

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
