import * as models from "../models";
import { mapModelsToPlainList, mapModelToPlain } from "./utils";

/**
 * Assigns a teacher to a class with a specific subject.
 * @param profId - The ID of the teacher (user).
 * @param classeId - The ID of the class.
 * @param matiereEnseignee - The subject taught by the teacher.
 * @returns The created assignment record as a plain object.
 * @throws If the teacher or class is not found, or if creation fails.
 */
export async function assignTeacherToClass(
  profId: number,
  classeId: number,
  matiereEnseignee: string
) {
  const teacher = await models.User.findByPk(profId);
  const classe = await models.Classe.findByPk(classeId);

  if (!teacher || !classe) {
    throw new Error("Teacher or class not found.");
  }

  const assignment = await models.ProfesseurClasse.create({
    id_utilisateur_prof: profId,
    id_classe: classeId,
    matiere_enseignee: matiereEnseignee,
  });

  return mapModelToPlain(assignment);
}

/**
 * Retrieves all teachers assigned to a specific class, including the subject they teach.
 * @param classeId - The ID of the class.
 * @returns An array of teachers with their assigned subject.
 */
export async function getTeachersOfClass(classeId: number) {
  const classe: any = await models.Classe.findByPk(classeId, {
    include: [
      {
        model: models.User,
        as: "Teachers",
        through: { attributes: ["matiere_enseignee"] },
      },
    ],
  });

  if (!classe || !classe.Teachers) {
    return [];
  }

  return mapModelsToPlainList(classe.Teachers, (teacher: any) => ({
    ...teacher.toJSON(),
    matiere_enseignee: teacher.ProfesseurClasse?.matiere_enseignee,
  }));
}

/**
 * Retrieves all classes taught by a specific teacher, including the subject taught in each class.
 * @param profId - The ID of the teacher (user).
 * @returns An array of classes with the subject taught by the teacher.
 */
export async function getClassesTaughtByTeacher(profId: number) {
  const teacher: any = await models.User.findByPk(profId, {
    include: [
      {
        model: models.Classe,
        as: "TaughtClasses",
        through: { attributes: ["matiere_enseignee"] },
      },
    ],
  });

  if (!teacher || !teacher.TaughtClasses) {
    return [];
  }

  return mapModelsToPlainList(teacher.TaughtClasses, (classe: any) => ({
    ...classe.toJSON(),
    matiere_enseignee: classe.ProfesseurClasse?.matiere_enseignee,
  }));
}
