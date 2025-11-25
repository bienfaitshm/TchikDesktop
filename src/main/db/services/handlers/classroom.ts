import { Sequelize, WhereOptions, FindOptions } from "sequelize";
import { ClassRoom, ClassroomEnrolement, User } from "@/main/db/models";
import { getDefinedAttributes } from "@/main/db/models/utils";
import type {
  TClassroom,
  TWithUser,
  TEnrolement,
} from "@/commons/types/models";
import { applyInFilterToWhere } from "./utils";

/**
 * 🧱 Interface des paramètres de filtrage de salle de classe.
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
 * @function buildClassroomQueryOptions
 * @description Construit les options de base (WHERE et INCLUDE) pour la requête Sequelize des salles de classe.
 * Cette fonction encapsule la logique de filtrage commune pour toutes les requêtes de classe.
 *
 * @param {ClassroomFilterParams} params - Les paramètres de filtrage à appliquer.
 * @returns {FindOptions<typeof ClassRoom>} Les options de recherche Sequelize (WhereOptions et IncludeOptions).
 */
function buildClassroomQueryOptions(
  params: ClassroomFilterParams
): FindOptions<any> {
  // 1. Détermination de la clause WHERE pour les filtres simples (schoolId, yearId)
  let whereClause: WhereOptions = getDefinedAttributes({
    schoolId: params.schoolId,
    yearId: params.yearId,
  });

  // 2. Application des filtres complexes (WHERE IN) pour les sections et les classes
  applyInFilterToWhere(whereClause, "section", params.sections);
  applyInFilterToWhere(whereClause, "classId", params.classrooms);

  // 3. Définition des options d'inclusion : inscriptions et utilisateurs (élèves)
  const includeOptions = [
    {
      model: ClassroomEnrolement,
      as: "ClassroomEnrolements" as const,
      include: [
        {
          model: User,
          as: "User" as const,
          // Exclure les données sensibles de l'utilisateur
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
 * @function fetchClassroomsWithEnrollments
 * @description Récupère toutes les salles de classe qui correspondent aux paramètres,
 * incluant leurs inscriptions (élèves) et les détails des utilisateurs associés.
 *
 * @param {ClassroomFilterParams} validatedParams - Les paramètres de filtrage validés.
 * @returns {Promise<ClassRoom[]>} Une promesse résolvant en un tableau d'instances Sequelize ClassRoom
 * avec les relations `ClassroomEnrolements` incluses.
 */
export function fetchClassroomsWithEnrollments(
  validatedParams: ClassroomFilterParams
) {
  const baseQuery = buildClassroomQueryOptions(validatedParams);

  // 1. Tri par identifiant de la salle de classe pour une présentation ordonnée
  baseQuery.order = [
    // Tri par ordre alphabétique non sensible à la casse
    [Sequelize.fn("LOWER", Sequelize.col("identifier")), "ASC"],
    [Sequelize.fn("LOWER", Sequelize.col("shortIdentifier")), "ASC"],
  ];

  // 2. Exécution de la requête
  return ClassRoom.findAll(baseQuery);
}
