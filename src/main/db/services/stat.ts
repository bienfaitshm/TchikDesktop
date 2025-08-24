import { Model } from "sequelize";
import {
  User,
  ClassroomEnrolement,
  ClassRoom,
  Option,
  sequelize,
} from "@/main/db/models"; // Assurez-vous que le chemin d'import est correct
import { USER_ROLE } from "@/commons/constants/enum";

// =====================
// TYPAGES POUR UN CODE PLUS CLAIR
// =====================

// Type pour les résultats d'agrégation de type { key: count }
type StatsCount = { [key: string]: number };

// Interface pour le résultat de getStudentCountByGender ou getClassCountBySection
interface AggregationResult extends Model {
  // L'attribut de groupement (gender, section, status) est connu mais non typé
  // 'count' est l'alias de l'agrégation
  count: number;
}

// Interface pour le résultat de getStudentsCountByClass
interface ClassCountResult extends Model {
  classroomId: string;
  studentCount: number;
  ClassRoom: {
    identifier: string;
    shortIdentifier: string;
  };
}

// Interface pour le résultat de getStudentsCountByOption
interface OptionCountResult extends Model {
  studentCount: number;
  ClassRoom: {
    Option: {
      optionName: string;
    };
  };
}

// =====================
// FONCTIONS DE STATISTIQUES
// =====================

/**
 * @description Compte le nombre total d'étudiants.
 * @param {string} schoolId L'ID de l'école.
 * @returns {Promise<number>} Le nombre total d'étudiants.
 */
export async function getTotalStudents(schoolId: string): Promise<number> {
  const count = await User.count({
    where: {
      schoolId,
      role: USER_ROLE.STUDENT,
    },
  });
  return count;
}

/**
 * @description Compte le nombre d'étudiants par genre (masculin/féminin).
 * @param {string} schoolId L'ID de l'école.
 * @returns {Promise<StatsCount>} Un objet avec le décompte par genre.
 */
export async function getStudentCountByGender(
  schoolId: string
): Promise<StatsCount> {
  const result = (await User.findAll({
    attributes: [
      "gender",
      [sequelize.fn("COUNT", sequelize.col("gender")), "count"],
    ],
    where: {
      schoolId,
      role: USER_ROLE.STUDENT,
    },
    group: ["gender"],
    raw: true,
  })) as unknown as AggregationResult[];

  return result.reduce((acc, item: any) => {
    acc[item.gender] = item.count;
    return acc;
  }, {} as StatsCount);
}

/**
 * @description Compte le nombre de nouveaux étudiants pour l'année en cours.
 * @param {string} schoolId L'ID de l'école.
 * @returns {Promise<number>} Le nombre de nouveaux étudiants.
 */
export async function getNewStudentsCount(schoolId: string): Promise<number> {
  const count = await ClassroomEnrolement.count({
    where: {
      schoolId,
      isNewStudent: true,
    },
  });
  return count;
}

/**
 * @description Compte le nombre d'étudiants par classe.
 * @param {string} schoolId L'ID de l'école.
 * @param {string} yearId L'ID de l'année scolaire.
 * @returns {Promise<Array<{ classId: string, className: string, shortName: string, studentCount: number }>>}
 * Une liste d'objets détaillés par classe.
 */
export async function getStudentsCountByClass(
  schoolId: string,
  yearId: string
): Promise<
  Array<{
    classId: string;
    className: string;
    shortName: string;
    studentCount: number;
  }>
> {
  const result = (await ClassroomEnrolement.findAll({
    attributes: [
      "classroomId",
      [sequelize.fn("COUNT", sequelize.col("student_id")), "studentCount"],
    ],
    where: { schoolId },
    include: [
      {
        model: ClassRoom,
        attributes: ["identifier", "shortIdentifier"],
        required: true,
        where: { yearId },
      },
    ],
    group: ["ClassroomEnrolement.classroomId", "ClassRoom.classId"],
  })) as unknown as ClassCountResult[];

  return result.map((item) => ({
    classId: item.classroomId,
    className: item.ClassRoom.identifier,
    shortName: item.ClassRoom.shortIdentifier,
    studentCount: item.studentCount,
  }));
}

/**
 * @description Obtient le nombre total de classes par section (e.g., Primaire, Secondaire).
 * @param {string} schoolId L'ID de l'école.
 * @returns {Promise<StatsCount>} Un objet avec le décompte des classes par section.
 */
export async function getClassCountBySection(
  schoolId: string
): Promise<StatsCount> {
  const result = (await ClassRoom.findAll({
    attributes: [
      "section",
      [sequelize.fn("COUNT", sequelize.col("section")), "count"],
    ],
    where: { schoolId },
    group: ["section"],
    raw: true,
  })) as unknown as AggregationResult[];

  return result.reduce((acc, item: any) => {
    acc[item.section] = item.count;
    return acc;
  }, {} as StatsCount);
}

/**
 * @description Compte le nombre d'étudiants par statut d'inscription (ex: EN_COURS, EXCLU).
 * @param {string} schoolId L'ID de l'école.
 * @returns {Promise<StatsCount>} Un objet avec le décompte par statut.
 */
export async function getStudentCountByStatus(
  schoolId: string
): Promise<StatsCount> {
  const result = (await ClassroomEnrolement.findAll({
    attributes: [
      "status",
      [sequelize.fn("COUNT", sequelize.col("status")), "count"],
    ],
    where: { schoolId },
    group: ["status"],
    raw: true,
  })) as unknown as AggregationResult[];

  return result.reduce((acc, item: any) => {
    acc[item.status] = item.count;
    return acc;
  }, {} as StatsCount);
}

/**
 * @description Compte le nombre total d'étudiants par option d'étude.
 * @param {string} schoolId L'ID de l'école.
 * @param {string} yearId L'ID de l'année scolaire.
 * @returns {Promise<Array<{ optionName: string, studentCount: number }>>}
 * Une liste d'objets contenant le nom de l'option et le nombre d'étudiants.
 */
export async function getStudentsCountByOption(
  schoolId: string,
  yearId: string
): Promise<Array<{ optionName: string; studentCount: number }>> {
  const result = (await ClassroomEnrolement.findAll({
    attributes: [
      [sequelize.fn("COUNT", sequelize.col("student_id")), "studentCount"],
    ],
    where: { schoolId },
    include: [
      {
        model: ClassRoom,
        attributes: [],
        required: true,
        where: { yearId },
        include: [
          {
            model: Option,
            attributes: ["optionName"],
            required: true,
          },
        ],
      },
    ],
    group: ["ClassRoom.Option.optionName"],
    raw: true, // Utilisation de raw pour simplifier l'accès aux attributs
  })) as unknown as OptionCountResult[];

  return result.map((item: any) => ({
    optionName: item["ClassRoom.Option.optionName"], // Accès via le chemin de l'alias
    studentCount: item.studentCount,
  }));
}
