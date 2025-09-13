import { ClassRoom, ClassroomEnrolement, User } from "@/main/db/models";
import { Sequelize, Op } from "sequelize";
import type {
  TClassroom,
  TWithUser,
  TEnrolement,
} from "@/commons/types/models";
import type { DocumentFilter } from "@/commons/types/services";
import { getDefinedAttributes } from "@/main/db/models/utils";
/**
 * filter
 * schoolId; yearId ;section or all; list of schools;
 * @param schoolId
 * @returns
 */

export type EnrollmentData = TClassroom & {
  ClassroomEnrolements: TWithUser<TEnrolement>[];
};

export async function getEnrollmentSchoolData({
  schoolId,
  yearId,
  sections,
  classrooms,
}: DocumentFilter) {
  const whereClause: any = getDefinedAttributes({ schoolId, yearId });

  if (sections && sections.length > 0) {
    whereClause.section = {
      [Op.in]: Array.isArray(sections) ? sections : [sections],
    };
  }
  if (classrooms && classrooms.length > 0) {
    whereClause.classId = {
      [Op.in]: Array.isArray(classrooms) ? classrooms : [classrooms],
    };
  }
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
