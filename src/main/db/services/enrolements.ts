import type { TEnrolementInsert } from "@/commons/types/models";
import type {
  QueryParams,
  WithSchoolAndYearId,
  TQuickEnrolementInsert,
} from "@/commons/types/services";
import { ClassroomEnrolement, User, ClassRoom, StudyYear } from "../models";
import { pruneUndefined } from "../models/utils";
import { createUser } from "./account";
import { Sequelize } from "sequelize";

export async function getEnrolements({
  schoolId,
  yearId,
  params = {},
}: QueryParams<WithSchoolAndYearId, Partial<TEnrolementInsert>>) {
  const whereClause = pruneUndefined({ schoolId, ...params });
  return ClassroomEnrolement.findAll({
    where: whereClause,
    include: [User, { model: ClassRoom, where: pruneUndefined({ yearId }) }],
    order: [
      [Sequelize.literal('LOWER("User"."last_name")'), "ASC"],
      [Sequelize.literal('LOWER("User"."middle_name")'), "ASC"],
      [Sequelize.literal('LOWER("User"."first_name")'), "ASC"],
    ],
  });
}
/**
 * Récupère l'historique des inscriptions en se basant sur une école, une année scolaire ou une classe.
 * @param {object} params - Paramètres de la requête.
 * @param {string} [params.schoolId] - (Optionnel) L'identifiant de l'école.
 * @param {string} [params.yearId] - (Optionnel) L'identifiant de l'année scolaire.
 * @param {string} [params.classId] - (Optionnel) L'identifiant de la classe.
 * @returns {Promise<Array<object>>} Un tableau d'inscriptions correspondant aux critères de recherche.
 */
export async function getEnrolementHistory({
  schoolId,
  yearId,
  classId,
}: WithSchoolAndYearId<{ classId?: string }>) {
  const whereClause = pruneUndefined({ schoolId, classId, yearId });

  const includeConditions: any[] = [];
  if (yearId) {
    includeConditions.push({
      model: ClassRoom,
      attributes: [],
      required: true,
      include: [
        {
          model: StudyYear,
          attributes: [],
          required: true,
          where: { yearId },
        },
      ],
    });
  }

  const results = await ClassroomEnrolement.findAll({
    where: whereClause,
    include: includeConditions.length > 0 ? includeConditions : undefined,
  });

  return results;
}

export async function getEnrolement(enrolementId) {
  return ClassroomEnrolement.findByPk(enrolementId, {
    include: [User, ClassRoom],
  });
}

export async function createEnrolement(data: TEnrolementInsert) {
  return ClassroomEnrolement.create(data);
}

export async function createQuickEnrolement({
  student: studendValue,
  ...data
}: TQuickEnrolementInsert) {
  const student = await createUser({
    ...studendValue,
    schoolId: data.schoolId,
  });
  // TODO: fix error type ClassroomEnrolement.create
  return ClassroomEnrolement.create({ ...data, studentId: student.userId });
}

export async function updateEnrolement(
  enrolementId: string,
  data: Partial<TEnrolementInsert>
) {
  const whereClause = pruneUndefined({ enrolementId });
  const classRoom = await ClassroomEnrolement.findOne({ where: whereClause });
  if (!classRoom) return null;
  return classRoom.update(data);
}

export async function deleteEnrolement(enrolementId: string) {
  const whereClause = pruneUndefined({ enrolementId });
  const classRoom = await ClassroomEnrolement.findOne({ where: whereClause });
  if (!classRoom) return false;
  await classRoom.destroy();
  return true;
}
