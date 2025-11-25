import { Sequelize, WhereOptions, FindOptions, Model } from "sequelize";
import { ClassRoom, ClassroomEnrolement, User } from "@/main/db/models";
import { getLogger } from "@/main/libs/logger";
import { getDefinedAttributes } from "@/main/db/models/utils";
import type {
  TClassroom,
  TWithUser,
  TEnrolement,
} from "@/commons/types/models";

import { applyInFilterToWhere } from "./utils";
import { BaseQueryHandler } from "./handler";

/**
 * 🧱 Interface des paramètres de filtrage génériques.
 * Renommé en `ClassroomFilterParams` pour être plus spécifique.
 */
export interface ClassroomFilterParams {
  schoolId?: string;
  yearId?: string;
  sections?: string | string[];
  classrooms?: string | string[];
}

/**
 * 📝 Type de données de retour pour une Salle de Classe incluant ses Inscriptions (élèves).
 * Combine le type de base TClassroom avec l'inclusion de TEnrolement typé TWithUser.
 */
export type ClassroomWithEnrollments = TClassroom & {
  ClassroomEnrolements: TWithUser<TEnrolement>[];
};

/**
 * 🔒 Construit les options de base pour la requête Sequelize de récupération des salles de classe.
 * Cette fonction encapsule la logique de filtrage et d'inclusion, respectant le DRY.
 *
 * @param params Les paramètres de filtrage à appliquer.
 * @returns Les options de recherche Sequelize (WhereOptions et IncludeOptions).
 */
function _getClassroomBaseQuery(
  params: ClassroomFilterParams
): FindOptions<typeof ClassRoom> {
  // 1. Détermination de la clause WHERE
  let whereClause: WhereOptions<typeof ClassRoom> = getDefinedAttributes({
    schoolId: params.schoolId,
    yearId: params.yearId,
  });

  // 2. Application des filtres complexes
  applyInFilterToWhere(whereClause, "section", params.sections);
  applyInFilterToWhere(whereClause, "classId", params.classrooms);

  // 3. Définition des options d'inclusion de base
  const includeOptions = [
    {
      model: ClassroomEnrolement,
      as: "ClassroomEnrolements" as const,
      include: [
        {
          model: User,
          as: "User" as const,
          attributes: { exclude: ["password", "schoolId"] },
        },
      ],
    },
  ];

  return {
    where: whereClause,
    include: includeOptions,
  };
}

/**
 * 💾 Récupère toutes les salles de classe correspondantes aux filtres, y compris
 * les inscriptions et les détails de l'utilisateur (élève).
 *
 * @name "classrooms.enrollments"
 * @param params Les paramètres de filtrage (schoolId, yearId, sections, classrooms).
 * @returns Une Promise résolue avec un tableau d'objets `ClassroomWithEnrollments`.
 */
export class ClassroomEnrollmentQueryHandler extends BaseQueryHandler {
  public queryName: string = "classrooms.enrollments";
  public schema: any = {};
  public logger = getLogger("ClassroomEnrollment");
  public executeQueryset(
    validatedParams: ClassroomFilterParams
  ): Promise<Model<any, any> | Model<any, any>[]> {
    const baseQuery = _getClassroomBaseQuery(validatedParams);

    // 1. Tri par identifiant de la salle de classe
    baseQuery.order = [
      [Sequelize.fn("LOWER", Sequelize.col("identifier")), "ASC"],
      [Sequelize.fn("LOWER", Sequelize.col("shortIdentifier")), "ASC"],
    ];

    // 2. Exécution et retour (le type est inféré par le modèle et l'inclusion)
    return ClassRoom.findAll(baseQuery);
  }
}

/**
 * 🧑‍🎓 Récupère les données des salles de classe, en y incluant tous les élèves
 * (même si la classe est vide) et en triant spécifiquement les élèves par nom complet.
 *
 * @name "classrooms.studentsDetailed"
 * @param params Les paramètres de filtrage (schoolId, yearId, sections, classrooms).
 * @returns Une promesse résolue avec un tableau d'objets `ClassroomWithEnrollments` triés par nom d'élève.
 */
export class ClassroomStudentsQueryHandler extends BaseQueryHandler {
  public queryName: string = "classrooms.students";
  public schema: any = {};
  public logger = getLogger("ClassroomStudents");
  public executeQueryset(
    validatedParams: ClassroomFilterParams
  ): Promise<Model<any, any> | Model<any, any>[]> {
    const baseQuery = _getClassroomBaseQuery(validatedParams);

    // 1. Tri par identifiant de la salle de classe
    baseQuery.order = [
      [Sequelize.fn("LOWER", Sequelize.col("identifier")), "ASC"],
      [Sequelize.fn("LOWER", Sequelize.col("shortIdentifier")), "ASC"],
    ];

    // 2. Exécution et retour (le type est inféré par le modèle et l'inclusion)
    return ClassRoom.findAll(baseQuery);
  }
}

/**
 * 🔄 Trie les inscriptions (élèves) d'une classe par leur nom complet (fullname)
 * par ordre alphabétique (ASC) côté application (JavaScript/TypeScript).
 *
 * @param classDatas Le tableau des données de la classe avec la liste des élèves à trier.
 * @returns Le même tableau d'objets, mais avec les listes d'élèves triées.
 */
export function sortStudentsByFullName(
  classDatas: ClassroomWithEnrollments[]
): ClassroomWithEnrollments[] {
  return classDatas.map((classData) => {
    classData.ClassroomEnrolements.sort((a, b) => {
      const nameA = a.User?.fullname || "";
      const nameB = b.User?.fullname || "";

      // Comparaison locale pour un tri alphabétique correct (ASC)
      return nameA.localeCompare(nameB);
    });
    return classData;
  });
}
