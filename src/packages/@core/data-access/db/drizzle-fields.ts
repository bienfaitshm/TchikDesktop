import { text, integer } from "drizzle-orm/sqlite-core";
import { generateShortId } from "./utils";
/**
 * Helper pro pour convertir un `enum` TypeScript classique (ou un objet littéral)
 * en un champ texte énuméré Drizzle compatible SQLite, sans perdre le typage strict.
 * * @param columnName Le nom de la colonne dans la base de données
 * @param enumObject L'enum TypeScript ou l'objet as const
 */
export const enumColumn = <T extends Record<string, string>>(
  columnName: string,
  enumObject: T,
) => {
  // Extraction des valeurs à l'exécution
  const values = Object.values(enumObject);

  // Sécurité d'exécution au cas où l'enum serait vide
  if (values.length === 0) {
    throw new Error(`L'enum fourni pour la colonne ${columnName} est vide.`);
  }

  const drizzleEnumTuple = values as [T[keyof T], ...T[keyof T][]];

  return text(columnName, { enum: drizzleEnumTuple });
};

export const primaryKeyId = (name: string) =>
  text(name)
    .primaryKey()
    .$defaultFn(() => generateShortId(6));

/**
 * Mixin pour ajouter automatiquement les colonnes de suivi temporel.
 * Utilise des timestamps (entiers) pour une compatibilité SQLite optimale.
 */
export const timestamps = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
};
