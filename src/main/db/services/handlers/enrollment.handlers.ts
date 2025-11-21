import { ClassRoom, ClassroomEnrolement, User } from "@/main/db/models";
import { Sequelize, WhereOptions } from "sequelize";
import { getDefinedAttributes } from "@/main/db/models/utils";
import { applyInFilterToWhere } from "./utils";

/**
 * 🧱 Interface des paramètres attendus pour la requête de données.
 * Cela améliore la sécurité de type par rapport à un 'params: unknown' générique.
 */
export interface EnrollmentDataParams {
  schoolId?: string;
  yearId?: string;
  sections?: string | string[];
  classrooms?: string | string[];
}

/**
 * 💾 Récupère les données détaillées des salles de classe, y compris les inscriptions
 * et les utilisateurs (étudiants) associés, en appliquant des filtres.
 *
 * @name "classrooms.enrollments"
 * @param params Les paramètres de filtrage (schoolId, yearId, sections, classrooms).
 * @returns Une Promise résolue avec les résultats de la requête ClassRoom.
 */
export async function getClassroomEnrollments(params: EnrollmentDataParams) {
  let whereClause: WhereOptions = getDefinedAttributes({
    schoolId: params.schoolId,
    yearId: params.yearId,
  });

  applyInFilterToWhere(whereClause, "sections", params.sections);
  applyInFilterToWhere(whereClause, "classrooms", params.classrooms);

  return ClassRoom.findAll({
    where: whereClause,
    include: [
      {
        model: ClassroomEnrolement,
        include: [User],
      },
    ],
    order: [
      [Sequelize.fn("LOWER", Sequelize.col("identifier")), "ASC"],
      [Sequelize.fn("LOWER", Sequelize.col("shortIdentifier")), "ASC"],
    ],
  });
}
