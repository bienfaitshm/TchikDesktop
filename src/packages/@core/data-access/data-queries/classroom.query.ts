// classroom.Query.ts

import {
  ClassRoom,
  Option,
  StudyYear,
  pruneUndefined,
  type TClassroomInsert,
  type TClassroom,
  type TOption,
  type TStudyYear,
  type TEnrolement,
  type TUser,
  User,
  ClassroomEnrolement,
} from "@/packages/@core/data-access/db";
import { FindOptions, Sequelize, type WhereOptions } from "sequelize";
import { TClassroomFilter } from "@/packages/@core/data-access/schema-validations";
import { getLogger } from "@/packages/logger";

/**
 * Type DTO représentant une salle de classe avec ses relations chargées.
 * Note: L'utilisation de `ClassRoom` ici est basée sur votre modèle local.
 */
export type TClassroomDTO = TClassroom & {
  Option: TOption;
  StudyYear: TStudyYear;
};

export type ClassroomWithEnrollments = TClassroom & {
  ClassroomEnrolements: (TUser & TEnrolement)[];
};

// --- Logger Interface (Simulé pour l'observabilité) ---
const logger = getLogger("Classroom Queries");

/**
 * Query de gestion des Salles de Classe (ClassRoom).
 * Fournit les méthodes de requête et de mutation pour cette entité.
 */
export class ClassroomQuery {
  // =============================================================================
  //  FETCH OPERATIONS
  // =============================================================================

  /**
   * Récupère une liste de salles de classe avec des options de filtrage et de tri.
   *
   * @param filters - Objet contenant les filtres de base, plus la pagination (`limit`, `offset`) et le tri.
   * @returns Une promesse qui résout en un tableau de DTOs de salles de classe avec leurs relations.
   * @throws {Error} Erreur de Query si la requête DB échoue.
   */
  static async getClassrooms(
    filters: TClassroomFilter
  ): Promise<TClassroomDTO[]> {
    const { limit, offset, orderBy, order, ...dbFilters } = filters;

    // PruneUndefined nettoie les champs null/undefined avant d'envoyer à Sequelize
    const whereClause = pruneUndefined(dbFilters) as WhereOptions<TClassroom>;

    try {
      const classRooms = await ClassRoom.findAll({
        where: whereClause,
        include: [Option, StudyYear],
        // Tri robuste par identifiants (insensible à la casse)
        order: [
          [Sequelize.fn("LOWER", Sequelize.col("identifier")), "ASC"],
          [Sequelize.fn("LOWER", Sequelize.col("shortIdentifier")), "ASC"],
        ],
        // Application conditionnelle de la pagination
        ...(limit !== undefined && { limit }),
        ...(offset !== undefined && { offset }),
      });

      // Retourne un tableau de DTOs purs (toJSON)
      return classRooms.map((cr) => cr.toJSON()) as TClassroomDTO[];
    } catch (error) {
      logger.error(
        "ClassroomQuery.getClassrooms: DB query failed.",
        error as Error
      );
      throw new Error("Query unavailable: Unable to retrieve classrooms.");
    }
  }

  /**
   * @description Récupère toutes les salles de classe qui correspondent aux paramètres,
   * incluant leurs inscriptions (élèves) et les détails des utilisateurs associés.
   *
   * @param {ClassroomFilterParams} validatedParams - Les paramètres de filtrage validés.
   * @returns {Promise<ClassRoom[]>} Une promesse résolvant en un tableau d'instances Sequelize ClassRoom
   * avec les relations `ClassroomEnrolements` incluses.
   */
  static async fetchClassroomsWithEnrollments(
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
  /**
   * Récupère une salle de classe par son identifiant principal, avec ses relations.
   *
   * @param classId - L'identifiant (clé primaire) de la salle de classe.
   * @returns Le DTO de la salle de classe ou `null` si non trouvée.
   * @throws {Error} Erreur de Query si la requête DB échoue.
   */
  static async getClassroomById(
    classId: string
  ): Promise<TClassroomDTO | null> {
    if (!classId) return null;

    try {
      const classRoom = await ClassRoom.findByPk(classId, {
        include: [Option, StudyYear],
      });

      return classRoom ? (classRoom.toJSON() as TClassroomDTO) : null;
    } catch (error) {
      logger.error(
        `ClassroomQuery.getClassroomById: Error for ID ${classId}.`,
        error
      );
      throw new Error("Query unavailable: Unable to fetch classroom details.");
    }
  }

  // =============================================================================
  //  MUTATION OPERATIONS
  // =============================================================================

  /**
   * Crée une nouvelle salle de classe.
   *
   * @param data - Les données d'insertion de la salle de classe.
   * @returns Le DTO de la salle de classe nouvellement créée.
   * @throws {Error} Erreur si l'insertion DB échoue (ex: violation de contrainte).
   */
  static async createClassroom(data: TClassroomInsert): Promise<TClassroom> {
    try {
      const classRoom = await ClassRoom.create(data);
      logger.info(`Classroom created: ${classRoom.classId}`);
      return classRoom.toJSON();
    } catch (error) {
      logger.error("ClassroomQuery.createClassroom: Creation failed.", error);
      throw error; // Laisse le contrôleur gérer les erreurs de validation (400)
    }
  }

  /**
   * Met à jour une salle de classe existante par son identifiant.
   *
   * @param classId - L'identifiant de la salle de classe à mettre à jour.
   * @param updates - Les données partielles à appliquer.
   * @returns Le DTO de la salle de classe mise à jour, ou `null` si non trouvée.
   * @throws {Error} Erreur de Query si l'opération DB échoue.
   */
  static async updateClassroom(
    classId: string,
    updates: Partial<TClassroomInsert>
  ): Promise<TClassroom | null> {
    if (!classId) return null;

    try {
      const classRoom = await ClassRoom.findByPk(classId);

      if (!classRoom) {
        logger.warn(`ClassroomQuery.updateClassroom: ID ${classId} not found.`);
        return null;
      }

      const updatedClassRoom = await classRoom.update(updates);
      return updatedClassRoom.toJSON();
    } catch (error) {
      logger.error(
        `ClassroomQuery.updateClassroom: Error updating ${classId}.`,
        error
      );
      throw new Error("Query unavailable: Update operation failed.");
    }
  }

  /**
   * Supprime une salle de classe par son identifiant.
   *
   * @param classId - L'identifiant de la salle de classe à supprimer.
   * @returns `true` si la suppression a réussi, ou `false` si non trouvée.
   * @throws {Error} Erreur de Query si l'opération DB échoue (ex: contrainte de clé étrangère).
   */
  static async deleteClassroom(classId: string): Promise<boolean> {
    if (!classId) return false;

    try {
      const deletedRowCount = await ClassRoom.destroy({ where: { classId } });
      return deletedRowCount > 0;
    } catch (error) {
      logger.error(
        `ClassroomQuery.deleteClassroom: Error deleting ${classId}.`,
        error
      );
      throw new Error(
        "Query error: Delete operation failed, check related constraints."
      );
    }
  }
}

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
  let whereClause: WhereOptions = pruneUndefined({
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
      as: "enrollements" as const,
      include: [
        {
          model: User,
          as: "user" as const,
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
