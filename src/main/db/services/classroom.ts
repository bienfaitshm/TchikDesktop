import { ClassRoom, Option, StudyYear } from "../models";
import type { TClassroomInsert } from "@/camons/types/models";
import type { QueryParams, WithSchoolAndYearId } from "@/camons/types/services";
import { getDefinedAttributes } from "../models/utils";

export async function getClassrooms({
  schoolId,
  yearId,
  params = {},
}: QueryParams<WithSchoolAndYearId, Partial<TClassroomInsert>>) {
  const whereClause = getDefinedAttributes({ schoolId, yearId, ...params });
  return ClassRoom.findAll({
    where: whereClause,
    include: [Option, StudyYear],
  });
}

export async function getClassroom(classId) {
  return ClassRoom.findByPk(classId, { include: [Option, StudyYear] });
}

export async function createClassroom(data: TClassroomInsert) {
  return ClassRoom.create(data);
}

export async function updateClassroom(
  classId: string,
  data: Partial<TClassroomInsert>
) {
  const whereClause = getDefinedAttributes({ classId });
  const classRoom = await ClassRoom.findOne({ where: whereClause });
  if (!classRoom) return null;
  return classRoom.update(data);
}

export async function deleteClassroom(classId: string) {
  const whereClause = getDefinedAttributes({ classId });
  const classRoom = await ClassRoom.findOne({ where: whereClause });
  if (!classRoom) return false;
  await classRoom.destroy();
  return true;
}
