import * as models from "../models";
import { mapModelsToPlainList, mapModelToPlain } from "./utils";

/**
 * Crée une relation parent-élève dans la base de données.
 * @param parentId - Identifiant du parent (utilisateur).
 * @param eleveId - Identifiant de l'élève (utilisateur).
 * @param typeRelation - Type de relation (ex: "Père", "Mère", "Tuteur").
 * @returns L'objet représentant la relation créée.
 * @throws Erreur si le parent ou l'élève n'existe pas.
 */
export async function createParentChildRelation(
  parentId: number,
  eleveId: number,
  typeRelation: string
) {
  const parent = await models.User.findByPk(parentId);
  const child = await models.User.findByPk(eleveId);

  if (!parent || !child) {
    throw new Error("Parent ou enfant non trouvé.");
  }

  const relation = await models.RelationParentEleve.create({
    id_utilisateur_parent: parentId,
    id_utilisateur_eleve: eleveId,
    type_relation: typeRelation,
  });

  return mapModelToPlain(relation);
}

/**
 * Récupère tous les enfants associés à un parent donné, avec le type de relation.
 * @param parentId - Identifiant du parent (utilisateur).
 * @returns Liste des enfants (utilisateurs) enrichis du type de relation.
 * @throws Erreur en cas de problème lors de la récupération.
 */
export async function getChildrenOfParent(parentId: number) {
  const parent: any = await models.User.findByPk(parentId, {
    include: [
      {
        model: models.User,
        as: "Children",
        through: { attributes: ["type_relation"] },
      },
    ],
  });

  if (!parent || !parent.Children) {
    return [];
  }

  return mapModelsToPlainList(parent.Children, (child: any) => ({
    ...child.toJSON(),
    type_relation: child.RelationParentEleve?.type_relation,
  }));
}

/**
 * Récupère tous les parents associés à un élève donné, avec le type de relation.
 * @param eleveId - Identifiant de l'élève (utilisateur).
 * @returns Liste des parents (utilisateurs) enrichis du type de relation.
 * @throws Erreur en cas de problème lors de la récupération.
 */
export async function getParentsOfChild(eleveId: number) {
  const child: any = await models.User.findByPk(eleveId, {
    include: [
      {
        model: models.User,
        as: "Parents",
        through: { attributes: ["type_relation"] },
      },
    ],
  });

  if (!child || !child.Parents) {
    return [];
  }

  return mapModelsToPlainList(child.Parents, (parent: any) => ({
    ...parent.toJSON(),
    type_relation: parent.RelationParentEleve?.type_relation,
  }));
}
