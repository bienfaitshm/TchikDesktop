import * as models from "../models";
import { mapModelsToPlainList, mapModelToPlain } from "./utils";

/**
 * Crée une nouvelle classe dans la base de données.
 * @param classData - Les données nécessaires pour créer la classe (hors id_classe).
 * @returns La classe nouvellement créée, sous forme d'objet plat.
 * @throws Propagera toute erreur de création.
 */
export async function createClasse(
  classData: Omit<models.ClasseAttributes, "id_classe">
): Promise<Required<models.ClasseAttributes>> {
  const classe = await models.Classe.create(classData);
  return mapModelToPlain(classe) as Promise<Required<models.ClasseAttributes>>;
}

/**
 * Récupère toutes les classes avec leurs sections, options et années d'étude associées.
 * @returns Un tableau d'objets représentant les classes enrichies de leurs relations.
 * @throws Propagera toute erreur de récupération.
 */
export async function getAllClassesWithDetails(): Promise<any[]> {
  const classes = models.Classe.findAll({
    include: [
      { model: models.Section, attributes: ["nom_section"] },
      { model: models.Option, attributes: ["nom_option"] },
      { model: models.AnneeEtude, attributes: ["nom_annee"] },
    ],
  });
  return mapModelsToPlainList(classes) as Promise<any[]>;
}

/**
 * Met à jour une classe existante avec les attributs fournis.
 * @param id_classe - L'identifiant unique de la classe à mettre à jour.
 * @param updates - Les champs à mettre à jour (tous optionnels).
 * @returns L'objet classe mis à jour, ou null si la classe n'existe pas.
 * @throws Propagera toute erreur de mise à jour.
 */
export async function updateClasse(
  id_classe: number,
  updates: Partial<
    Pick<
      models.ClasseAttributes,
      | "nom_identifiant"
      | "annee_scolaire"
      | "id_section"
      | "id_option"
      | "id_annee"
    >
  >
): Promise<Required<models.ClasseAttributes> | null> {
  const [affectedRows] = await models.Classe.update(updates, {
    where: { id_classe },
    returning: false, // returning n'est pas toujours supporté selon le dialecte
  });

  if (affectedRows > 0) {
    const updatedClasse = await models.Classe.findByPk(id_classe);
    if (updatedClasse) {
      return mapModelToPlain(
        updatedClasse
      ) as unknown as Required<models.ClasseAttributes>;
    }
  }
  return null;
}
