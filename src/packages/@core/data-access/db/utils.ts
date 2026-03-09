import { type FindOptions, Op, type WhereOptions } from "sequelize";
import ShortUniqueId, { type ShortUniqueIdOptions } from "short-unique-id";

/** Configuration pour les identifiants courts (alphanumérique par défaut) */
const BASE_ID_CONFIG: Partial<ShortUniqueIdOptions> = { length: 5 };

/** Configuration pour les codes (uniquement numérique pour des codes d'inscription) */
const NUMERIC_CODE_CONFIG: Partial<ShortUniqueIdOptions> = {
  length: 10,
  dictionary: "number",
};

const _baseIdGenerator = new ShortUniqueId(BASE_ID_CONFIG);
const _numericCodeGenerator = new ShortUniqueId(NUMERIC_CODE_CONFIG);

/**
 * Génère un identifiant court, aléatoire et unique (alphanumérique mixte).
 * * @param length La longueur souhaitée de l'identifiant. Par défaut: 5.
 * @returns L'identifiant généré.
 */
export function generateShortId(length?: number): string {
  // Utilise l'instance _baseIdGenerator configurée pour l'alphanumérique
  return _baseIdGenerator.randomUUID(length);
}

/**
 * Génère un nom d'utilisateur provisoire/temporaire basé sur un identifiant court.
 * * @param length La longueur souhaitée pour l'ID. Par défaut: 6.
 * @returns Le nom d'utilisateur provisoire.
 */
export function generateProvisionalUsername(length: number = 6): string {
  // Dans ce cas, l'implémentation est identique à generateShortId, mais le nom
  // reflète son usage métier (Username vs ID).
  const id = _baseIdGenerator.randomUUID(length);
  return id;
}

/**
 * Génère un code d'inscription (Enrollment Code) purement numérique et unique.
 * * @param length La longueur souhaitée du code. Par défaut: 10.
 * @returns Le code d'inscription numérique généré.
 */
export function generateNumericEnrollmentCode(length: number = 10): string {
  // Utilise l'instance _numericCodeGenerator qui utilise un dictionnaire restreint aux chiffres
  return _numericCodeGenerator.randomUUID(length);
}

const shortId = new ShortUniqueId({ length: 5 });
const shortCode = new ShortUniqueId({ length: 10, dictionary: "number" });

export function getUniqueId(lenght: number) {
  return shortId.randomUUID(lenght);
}

export function getDefaultUsername(lenght = 6): string {
  const id = shortId.randomUUID(lenght);
  return `${id}`;
}

export function getDefaultEnrolementCode(lenght = 10) {
  return shortCode.randomUUID(lenght);
}

/**
 * Creates a shallow copy of the object, discarding any properties that are `undefined`.
 * * * Note: This does not recursively filter nested objects (shallow only).
 * * Performance: Optimized to reduce intermediate allocations.
 *
 * @template T - The input object type.
 * @param obj - The source object to filter. Can be null or undefined.
 * @returns A new object with only defined properties.
 * * @example
 * const input = { a: 1, b: undefined, c: 3 };
 * const result = pruneUndefined(input);
 * // Result: { a: 1, c: 3 }
 */
export function pruneUndefined<T extends object>(
  obj: T | null | undefined,
): Partial<T> {
  // 1. Guard Clause: strict checks for null, undefined, or arrays to avoid runtime crashes.
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return {};
  }

  // 2. Functional & Immutable Implementation
  // We iterate over keys to create a clean subset without mutating the original.
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];

    // 3. Strict check against undefined (null is usually considered a valid value in JSON APIs)
    if (value !== undefined) {
      acc[key as keyof T] = value as T[keyof T];
    }

    return acc;
  }, {} as Partial<T>);
}

/**
 * Type utilitaire pour extraire les types de valeurs autorisés
 * (Scalaires ou Tableaux de ces scalaires)
 */
type FilterValue = string | number | boolean | Array<string | number>;

/**
 * Construit dynamiquement une clause WHERE typée pour Sequelize.
 * * @template T - L'interface ou le modèle Sequelize cible
 * @param {Partial<Record<keyof T, FilterValue>>} filters - Un objet dont les clés sont des attributs de T
 * @returns {WhereOptions<T>} - Un objet de configuration compatible avec Sequelize
 */
export const buildWhereClause = <T extends object>(
  filters: Partial<Record<keyof T, FilterValue | undefined | null>>,
): WhereOptions<T> => {
  const prunedFilters = pruneUndefined(filters);
  const where: WhereOptions<T> = {};

  for (const [key, value] of Object.entries(prunedFilters)) {
    if (Array.isArray(value)) {
      where[key] = {
        [Op.in]: value,
      };
    } else {
      where[key] = value;
    }
  }

  return where;
};

// Interface minimale attendue pour les filtres (Pagination + Tri)
export interface BaseFilter {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: "ASC" | "DESC";
  [key: string]: any; // Pour les critères dynamiques
}

/**
 * Convertit un objet de filtres API (incluant pagination, tri et critères)
 * en un objet d'options complet compatible avec Sequelize.
 *
 * @template T - Le type de l'objet de filtre (doit étendre BaseFilter).
 * @param {T} filters - L'objet contenant les paramètres de requête (req.query validé).
 * @param {FindOptions['order']} [defaultSortOrder] - (Optionnel) L'ordre de tri par défaut si aucun tri n'est spécifié dans les filtres.
 * @returns {FindOptions} Un objet de configuration prêt à être passé à `Model.findAll()`.
 *
 * @example
 * // 1. Définir un tri par défaut
 * const defaultSort: FindOptions['order'] = [['createdAt', 'DESC']];
 *
 * // 2. Convertir les filtres entrants
 * const queryOptions = buildFindOptions(reqQuery, defaultSort);
 *
 * // 3. Utiliser avec Sequelize
 * const results = await User.findAll(queryOptions);
 */
export function buildFindOptions<T extends BaseFilter>(
  filters: T,
  defaultSortOrder?: FindOptions["order"],
): FindOptions {
  // 1. Extraction des méta-données de pagination et de tri
  const { limit, offset, orderBy, order, ...criteria } = filters;

  // 2. Construction de la clause WHERE pour les critères restants
  const where = buildWhereClause(criteria);

  // 3. Assemblage de l'objet FindOptions
  return {
    where,
    // Si orderBy est présent, on l'utilise, sinon on fallback sur le defaultSortOrder
    order: orderBy ? [[orderBy, order ?? "ASC"]] : defaultSortOrder,
    // Injection conditionnelle (seulement si défini)
    ...(limit !== undefined && { limit }),
    ...(offset !== undefined && { offset }),
  };
}

/**
 * Transforme un enum en liste clé-valeur, avec traduction optionnelle.
 * @param enumObject Enum à transformer.
 * @param enumTranslation Table de traduction optionnelle.
 * @returns Tableau d'objets { key, value, label }.
 */
export function getEnumKeyValueList<T extends Record<string, unknown>>(
  enumObject: T,
  enumTranslation?: Record<string, string>,
): { key: string; value: T[keyof T]; label: string }[] {
  return Object.entries(enumObject).map(([key, value]) => ({
    key,
    value: value as T[keyof T],
    label: enumTranslation?.[value as string] ?? (value as string),
  }));
}
