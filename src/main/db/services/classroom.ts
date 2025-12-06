import type { TClassroomInsert, TClassroom } from "@/commons/types/models";
import type { TClassRoomFilter } from "@/commons/schemas/type";
import { ClassRoom, Option, StudyYear } from "../models/model";
import { pruneUndefined } from "../models/utils";
import { Sequelize } from "sequelize";

/**
 * Récupère le type d'un modèle ClassRoom avec ses relations chargées.
 * Ceci est un type d'intersection pour la sécurité de type.
 */
type TClassroomWithRelations = TClassroom & {
  Option: Option;
  StudyYear: StudyYear;
};

// =============================================================================
//  SERVICE METHODS
// =============================================================================

/**
 * @description Récupère une liste de salles de classe avec des options de filtrage et de tri avancées.
 * @param filters - Objet contenant les identifiants de l'école et de l'année, plus des filtres additionnels.
 * @returns Une promesse qui résout en un tableau d'instances ClassRoom avec leurs relations Option et StudyYear.
 */
export async function getClassrooms(
  filters: TClassRoomFilter
): Promise<TClassroomWithRelations[]> {
  const { limit, offset, orderBy, order, ...dbFilters } = filters;

  const whereClause = pruneUndefined(dbFilters);

  return ClassRoom.findAll({
    where: whereClause,
    include: [Option, StudyYear],
    // Tri par défaut et par identifiants (meilleur tri alphanumérique)
    order: [
      [Sequelize.fn("LOWER", Sequelize.col("identifier")), "ASC"],
      [Sequelize.fn("LOWER", Sequelize.col("shortIdentifier")), "ASC"],
    ],
    // Pagination (si fournie)
    ...(limit && { limit }),
    ...(offset && { offset }),
  }) as unknown as Promise<TClassroomWithRelations[]>;
}

/**
 * @description Récupère une salle de classe par son identifiant principal.
 * @param classId - L'identifiant (clé primaire) de la salle de classe.
 * @returns Une promesse qui résout en l'instance ClassRoom ou null si non trouvée.
 */
export async function getClassroom(
  classId: string
): Promise<TClassroomWithRelations | null> {
  if (!classId) return null;

  return ClassRoom.findByPk(classId, {
    include: [Option, StudyYear],
  }) as Promise<TClassroomWithRelations | null>;
}

/**
 * @description Crée une nouvelle salle de classe.
 * @param data - Les données d'insertion de la salle de classe (validées par Zod).
 * @returns Une promesse qui résout en l'instance ClassRoom nouvellement créée.
 */
export async function createClassroom(
  data: TClassroomInsert
): Promise<ClassRoom> {
  return ClassRoom.create(data);
}

/**
 * @description Met à jour une salle de classe existante par son identifiant.
 * @param classId - L'identifiant (clé primaire) de la salle de classe à mettre à jour.
 * @param data - Les données partielles à appliquer (validées par Zod).
 * @returns Une promesse qui résout en l'instance ClassRoom mise à jour, ou null si non trouvée.
 */
export async function updateClassroom(
  classId: string,
  data: Partial<TClassroomInsert>
): Promise<ClassRoom | null> {
  if (!classId) return null;

  const classRoom = await ClassRoom.findByPk(classId);

  if (!classRoom) {
    return null;
  }

  return classRoom.update(data);
}

/**
 * @description Supprime une salle de classe par son identifiant.
 * @param classId - L'identifiant (clé primaire) de la salle de classe à supprimer.
 * @returns Une promesse qui résout à true si la suppression a réussi, ou false si la classe n'a pas été trouvée.
 */
export async function deleteClassroom(classId: string): Promise<boolean> {
  if (!classId) return false;

  const deletedRowCount = await ClassRoom.destroy({ where: { classId } });

  return deletedRowCount > 0;
}
