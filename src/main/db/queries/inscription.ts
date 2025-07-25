import * as models from "../models";
import { mapModelsToPlainList, mapModelToPlain } from "./utils";

/**
 * Inscrit un élève dans une classe.
 * @param eleveId L'ID de l'utilisateur (élève).
 * @param classeId L'ID de la classe.
 * @returns L'enregistrement d'inscription.
 */
export async function enrollStudentInClass(
  eleveId: number,
  classeId: number
): Promise<unknown> {
  try {
    const student = await models.User.findByPk(eleveId);
    const classe = await models.Classe.findByPk(classeId);

    if (!student || !classe) {
      throw new Error("Élève ou classe non trouvée.");
    }

    // Crée une entrée dans la table de jonction Inscription
    const inscription = await models.Inscription.create({
      id_utilisateur_eleve: eleveId,
      id_classe: classeId,
      date_inscription: new Date().toISOString().split("T")[0], // Format AAAA-MM-JJ
    });
    return await mapModelToPlain(inscription);
  } catch (error) {
    console.error("Erreur lors de l'inscription de l'élève:", error);
    throw error;
  }
}

/**
 * Récupère tous les élèves inscrits dans une classe spécifique.
 * @param classeId L'ID de la classe.
 * @returns Une liste d'utilisateurs (élèves).
 */
export async function getStudentsInClass(classeId: number) {
  try {
    const classe = await models.Classe.findByPk(classeId, {
      include: [
        {
          model: models.User,
          through: { attributes: [] }, // N'inclut pas les attributs de la table de jonction
        },
      ],
    });
    if (classe) {
      const users = (await (classe as any).getUsers?.()) ?? [];
      return mapModelsToPlainList(users);
    }
  } catch (error) {}
  return [];
}

/**
 * Récupère toutes les classes auxquelles un élève est inscrit.
 * @param eleveId L'ID de l'utilisateur (élève).
 * @returns Une liste de classes.
 */
export async function getClassesForStudent(eleveId: number) {
  try {
    const student = await models.User.findByPk(eleveId, {
      include: [
        {
          model: models.Classe,
          through: { attributes: ["date_inscription"] }, // Inclut la date d'inscription
        },
      ],
    });
    if (student) {
      const classes = (await (student as any).getClasses?.()) ?? [];
      return await mapModelsToPlainList(classes, (c: any) => ({
        ...c.toJSON(),
        date_inscription: (c as any).Inscription.date_inscription,
      }));
    }
  } catch (error) {}
  return [];
}
