import { sql } from "drizzle-orm";
import { text, integer, type ReferenceConfig } from "drizzle-orm/sqlite-core";
import { generateShortId } from "./utils";

/**
 * Helper pour convertir un `enum` TypeScript classique (ou un objet littéral)
 * en un champ texte énuméré Drizzle compatible SQLite, sans perdre le typage strict.
 * @param columnName Le nom de la colonne dans la base de données
 * @param enumObject L'enum TypeScript ou l'objet as const
 */
export const enumColumn = <T extends Record<string, string>>(
  columnName: string,
  enumObject: T,
) => {
  const values = Object.values(enumObject);

  if (values.length === 0) {
    throw new Error(`L'enum fourni pour la colonne "${columnName}" est vide.`);
  }

  const drizzleEnumTuple = values as [T[keyof T], ...T[keyof T][]];

  return text(columnName, { enum: drizzleEnumTuple });
};

/**
 * Crée une clé primaire sous forme de texte (ID court généré).
 */
export const primaryKeyId = (columnName: string) =>
  text(columnName)
    .primaryKey()
    .$defaultFn(() => generateShortId(6));

/**
 * Crée une clé étrangère standardisée.
 * Note : 'actions' contient onDelete/onUpdate dans la config Drizzle.
 */
export const foreignKeyId = (
  columnName: string,
  {
    actions,
    ref,
    type = "NOT_NULL",
  }: ReferenceConfig & { type?: "NULL" | "NOT_NULL" },
) => {
  let field = text(columnName);
  if (type === "NOT_NULL") {
    field = field.notNull();
  }
  return field.references(ref, actions);
};

/**
 * Crée un champ de type Timestamp (stocké en INTEGER pour SQLite).
 * Compatible avec les migrations de lignes existantes.
 */
export const timestampColumn = (columnName: string) =>
  integer(columnName, { mode: "timestamp" })
    .notNull()
    // 1. Donne une constante pure pour que SQLite accepte le ALTER TABLE
    .default(new Date(0))
    // 2. Génère la vraie date actuelle en JS lors de chaque INSERT futur
    .$defaultFn(() => new Date());
/**
 * Mixin pour ajouter automatiquement les colonnes de suivi temporel.
 * Utilise le snake_case pour la base de données et le camelCase pour le code applicatif.
 */
export const timestamps = {
  createdAt: timestampColumn("created_at"),
  updatedAt: timestampColumn("updated_at"),
} as const;
