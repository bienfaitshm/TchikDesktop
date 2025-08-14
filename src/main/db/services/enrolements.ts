import type { TEnrolementInsert } from "@/commons/types/models";
import type {
  QueryParams,
  WithSchoolAndYearId,
  TQuickEnrolementInsert,
} from "@/commons/types/services";
import { ClassroomEnrolement, User, ClassRoom } from "../models";
import { getDefinedAttributes } from "../models/utils";
import { createUser } from "./account";
import { Sequelize } from "sequelize";

export async function getEnrolements({
  schoolId,
  yearId,
  params = {},
}: QueryParams<WithSchoolAndYearId, Partial<TEnrolementInsert>>) {
  const whereClause = getDefinedAttributes({ schoolId, ...params });
  return ClassroomEnrolement.findAll({
    where: whereClause,
    include: [
      User,
      { model: ClassRoom, where: getDefinedAttributes({ yearId }) },
    ],
    order: [
      [Sequelize.literal('LOWER("User"."last_name")'), "ASC"],
      [Sequelize.literal('LOWER("User"."middle_name")'), "ASC"],
      [Sequelize.literal('LOWER("User"."first_name")'), "ASC"],
    ],
  });
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
  return ClassroomEnrolement.create({ ...data, studentId: student.userId });
}

export async function updateEnrolement(
  enrolementId: string,
  data: Partial<TEnrolementInsert>
) {
  const whereClause = getDefinedAttributes({ enrolementId });
  const classRoom = await ClassroomEnrolement.findOne({ where: whereClause });
  if (!classRoom) return null;
  return classRoom.update(data);
}

export async function deleteEnrolement(enrolementId: string) {
  const whereClause = getDefinedAttributes({ enrolementId });
  const classRoom = await ClassroomEnrolement.findOne({ where: whereClause });
  if (!classRoom) return false;
  await classRoom.destroy();
  return true;
}
