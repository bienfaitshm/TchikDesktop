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
    .$defaultFn(() => generateShortId(10));

/**
 * Crée une clé étrangère standardisée.
 * Note : 'actions' contient onDelete/onUpdate dans la config Drizzle.
 */
export const foreignKeyId = <T extends "NULL" | "NOT_NULL" = "NOT_NULL">(
  columnName: string,
  { actions, ref, type = "NOT_NULL" as T }: ReferenceConfig & { type?: T },
) => {
  const field = text(columnName);

  const finalField = (
    type === "NOT_NULL" ? field.notNull() : field
  ) as T extends "NOT_NULL" ? ReturnType<typeof field.notNull> : typeof field;

  return finalField.references(ref, actions);
};

export const foreignKeyIdNoNull = (
  columnName: string,
  actions: ReferenceConfig,
) => {
  return text(columnName).notNull().references(actions.ref, actions.actions);
};

export const foreignKeyIdNull = (
  columnName: string,
  actions: ReferenceConfig,
) => {
  return text(columnName).references(actions.ref, actions.actions);
};

/**
 * Crée un champ de type Timestamp (stocké en INTEGER pour SQLite).
 * Compatible avec les migrations de lignes existantes.
 */
export const timestampColumn = (columnName: string) =>
  integer(columnName, { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date());
/**
 * Mixin pour ajouter automatiquement les colonnes de suivi temporel.
 * Utilise le snake_case pour la base de données et le camelCase pour le code applicatif.
 */
export const timestamps = {
  createdAt: timestampColumn("created_at"),
  updatedAt: timestampColumn("updated_at"),
} as const;
