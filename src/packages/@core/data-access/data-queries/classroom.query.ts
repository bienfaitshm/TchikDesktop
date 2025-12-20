// classroom.Query.ts

import { FindOptions, Sequelize } from "sequelize";
import {
  ClassRoom,
  Option,
  StudyYear,
  User,
  ClassroomEnrolement,
  type TClassroomInsert,
  type TClassroom,
  type TOption,
  type TStudyYear,
  type TEnrolement,
  type TUser,
  buildFindOptions,
} from "@/packages/@core/data-access/db";
import { TClassroomFilter } from "@/packages/@core/data-access/schema-validations";
import { getLogger } from "@/packages/logger";

// =============================================================================
// I. TYPE DEFINITIONS & DTOS
// =============================================================================

/**
 * @description DTO complet d'une salle de classe incluant les relations référentielles (Option, Année).
 */
export type TClassroomDTO = TClassroom & {
  Option?: TOption; // Optionnel car peut être null
  StudyYear?: TStudyYear;
};

/**
 * @description DTO étendu incluant la liste des étudiants inscrits.
 * Les informations sensibles de l'utilisateur (password) sont exclues.
 */
export type TClassroomWithEnrollmentsDTO = TClassroomDTO & {
  enrollements: (TEnrolement & { user: Partial<TUser> })[];
};

// =============================================================================
// II. CONSTANTS & CONFIGURATION
// =============================================================================

const logger = getLogger("ClassroomQuery");

/**
 * Ordre de tri standard pour les classes :
 * 1. Identifiant complet (alphabétique)
 * 2. Identifiant court (alphabétique)
 * Utilise LOWER() pour être insensible à la casse.
 */
const DEFAULT_SORT_ORDER: FindOptions["order"] = [
  [Sequelize.fn("LOWER", Sequelize.col("ClassRoom.identifier")), "ASC"],
  [Sequelize.fn("LOWER", Sequelize.col("ClassRoom.shortIdentifier")), "ASC"],
];

// =============================================================================
// III. QUERY CLASS
// =============================================================================

/**
 * @class ClassroomQuery
 * @description Couche d'accès aux données pour l'entité Salle de Classe (ClassRoom).
 * Gère les opérations CRUD et les requêtes complexes avec jointures.
 */
export class ClassroomQuery {
  // ===========================================================================
  // READ OPERATIONS
  // ===========================================================================

  /**
   * Récupère une liste paginée de salles de classe selon des filtres.
   * * @param {TClassroomFilter} filters - Filtres, pagination et tri provenant du contrôleur.
   * @returns {Promise<TClassroomDTO[]>} Liste des classes.
   */
  static async findMany(filters: TClassroomFilter): Promise<TClassroomDTO[]> {
    const options = buildFindOptions(filters, DEFAULT_SORT_ORDER);

    try {
      const classRooms = await ClassRoom.findAll({
        ...options,
        include: [
          { model: Option, required: false }, // LEFT JOIN
          { model: StudyYear, required: true }, // INNER JOIN (une classe a toujours une année)
        ],
      });

      return classRooms.map((c) => c.toJSON() as TClassroomDTO);
    } catch (error) {
      logger.error(
        "ClassroomQuery.findMany: Failed to fetch classrooms",
        error
      );
      throw new Error("Impossible de récupérer la liste des classes.");
    }
  }

  /**
   * Récupère une salle de classe spécifique par son ID.
   * * @param {string} classId - UUID de la classe.
   * @returns {Promise<TClassroomDTO | null>} La classe ou null.
   */
  static async findById(classId: string): Promise<TClassroomDTO | null> {
    if (!classId) return null;

    try {
      const classRoom = await ClassRoom.findByPk(classId, {
        include: [Option, StudyYear],
      });

      return classRoom ? (classRoom.toJSON() as TClassroomDTO) : null;
    } catch (error) {
      logger.error(`ClassroomQuery.findById: Failed for ID ${classId}`, error);
      throw new Error("Impossible de récupérer les détails de la classe.");
    }
  }

  /**
   * Récupère les classes avec la liste complète des élèves inscrits.
   * Optimisé pour l'affichage des tableaux de bord ou listes de présences.
   * * @param {TClassroomFilter} filters - Filtres optionnels (ex: schoolId).
   * @returns {Promise<TClassroomWithEnrollmentsDTO[]>} Classes peuplées.
   */
  static async findWithEnrollments(
    filters: TClassroomFilter
  ): Promise<TClassroomWithEnrollmentsDTO[]> {
    const options = buildFindOptions(filters, DEFAULT_SORT_ORDER);

    try {
      const classRooms = await ClassRoom.findAll({
        ...options,
        include: [
          {
            model: ClassroomEnrolement,
            as: "enrollements", // Doit correspondre à l'alias défini dans ton modèle Sequelize
            include: [
              {
                model: User,
                as: "user",
                // Sécurité : On ne sélectionne QUE les champs nécessaires
                attributes: [
                  "userId",
                  "firstName",
                  "lastName",
                  "middleName",
                  "gender",
                  "email",
                ],
              },
            ],
          },
          { model: Option },
          { model: StudyYear },
        ],
      });

      return classRooms.map((c) => c.toJSON() as TClassroomWithEnrollmentsDTO);
    } catch (error) {
      logger.error("ClassroomQuery.findWithEnrollments: Failed", error);
      throw new Error("Impossible de récupérer les inscriptions des classes.");
    }
  }

  // ===========================================================================
  // WRITE OPERATIONS (Mutations)
  // ===========================================================================

  /**
   * Crée une nouvelle salle de classe.
   * * @param {TClassroomInsert} data - Données validées.
   * @returns {Promise<TClassroom>} La classe créée.
   */
  static async create(data: TClassroomInsert): Promise<TClassroom> {
    try {
      const newClass = await ClassRoom.create(data);
      logger.info(`Classroom created with ID: ${newClass.classId}`);
      return newClass.toJSON();
    } catch (error) {
      logger.error("ClassroomQuery.create: Failed", error);
      // On propage l'erreur brute pour que le contrôleur gère les codes 400/409
      throw error;
    }
  }

  /**
   * Met à jour une classe existante.
   * * @param {string} classId - UUID cible.
   * @param {Partial<TClassroomInsert>} updates - Champs à modifier.
   * @returns {Promise<TClassroom | null>} La classe mise à jour ou null.
   */
  static async update(
    classId: string,
    updates: Partial<TClassroomInsert>
  ): Promise<TClassroom | null> {
    try {
      // Optimisation: update direct sans fetch préalable si on n'a pas besoin de hooks complexes
      // Cependant, pour retourner l'objet mis à jour, findByPk est plus sûr en Sequelize V6
      const classRoom = await ClassRoom.findByPk(classId);

      if (!classRoom) {
        logger.warn(`ClassroomQuery.update: Not found ${classId}`);
        return null;
      }

      const updatedClass = await classRoom.update(updates);
      return updatedClass.toJSON();
    } catch (error) {
      logger.error(`ClassroomQuery.update: Failed for ID ${classId}`, error);
      throw new Error("Échec de la mise à jour de la classe.");
    }
  }

  /**
   * Supprime une classe (Soft delete ou Hard delete selon la config du modèle).
   * * @param {string} classId - UUID cible.
   * @returns {Promise<boolean>} True si supprimé, False si introuvable.
   */
  static async delete(classId: string): Promise<boolean> {
    try {
      const count = await ClassRoom.destroy({ where: { classId } });

      if (count === 0) {
        logger.warn(
          `ClassroomQuery.delete: ID ${classId} not found or already deleted.`
        );
        return false;
      }

      return true;
    } catch (error) {
      // Gestion spécifique des erreurs de clé étrangère (ex: la classe a des élèves)
      logger.error(`ClassroomQuery.delete: Failed for ID ${classId}`, error);
      throw new Error(
        "Impossible de supprimer la classe (vérifiez qu'elle est vide)."
      );
    }
  }
}
