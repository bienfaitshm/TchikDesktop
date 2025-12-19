import { Op, type WhereOptions } from "sequelize";

/**
 * ⚙️ Fonction utilitaire pour construire une clause 'IN' basée sur des IDs.
 * Elle gère automatiquement les cas où l'entrée est un seul élément ou un tableau.
 *
 * @param input Le ou les IDs à inclure dans la clause.
 * @returns Un objet de clause 'IN' pour Sequelize, ou `undefined` si l'entrée est vide.
 */
export function buildInClause(
  input: string | number | (string | number)[] | undefined
): any | undefined {
  if (!input || (Array.isArray(input) && input.length === 0)) {
    return undefined;
  }
  const values = Array.isArray(input) ? input : [input];
  return { [Op.in]: values };
}

/**
 * 🎯 Applique conditionnellement un filtre de type Sequelize `[Op.in]`
 * à la clause WHERE fournie, en utilisant un nom d'attribut spécifique.
 * Respecte le principe DRY en encapsulant la logique de filtrage.
 *
 * @param whereClause L'objet de la clause WHERE à modifier (muté).
 * @param attributeName Le nom de la colonne du modèle à filtrer (ex: 'section', 'classId').
 * @param input L'entrée brute (un ID, un tableau d'IDs, ou undefined/vide).
 */
export function applyInFilterToWhere(
  whereClause: WhereOptions,
  attributeName: string,
  input: string | number | (string | number)[] | undefined
) {
  const filter = buildInClause(input);
  if (filter) {
    whereClause[attributeName] = filter;
  }
}
