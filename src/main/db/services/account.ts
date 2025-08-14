import { ClassroomEnrolement, User } from "../models";
import { TUserInsert } from "@/commons/types/models";
import type {
  QueryParams,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import {
  getDefaultUsername,
  getDefinedAttributes,
} from "@/main/db/models/utils";
import { Sequelize } from "sequelize";

const DEFAULT_STUDENT_PASSWORD = "000000";

export async function getUsers({
  schoolId,
  yearId,
  params,
}: QueryParams<
  WithSchoolAndYearId,
  Partial<TUserInsert & { classroomId: string }>
>) {
  const whereClause = getDefinedAttributes({
    schoolId,
    ...params,
    classroomId: undefined,
  });
  return User.findAll({
    where: whereClause,
    order: [
      [Sequelize.fn("LOWER", Sequelize.col("last_name")), "ASC"],
      [Sequelize.fn("LOWER", Sequelize.col("middle_name")), "ASC"][
        (Sequelize.fn("LOWER", Sequelize.col("first_name")), "ASC")
      ],
    ],
    include: [
      User,
      {
        model: ClassroomEnrolement,
        where: getDefinedAttributes({
          yearId,
          classroomId: params?.classroomId,
        }),
      },
    ],
  });
}

export async function getUser(userId) {
  return User.findByPk(userId, {
    include: [User, ClassroomEnrolement],
  });
}

export async function createUser(data: TUserInsert) {
  const password = DEFAULT_STUDENT_PASSWORD;
  const username = getDefaultUsername();
  return User.create({ password, ...data, username });
}

export async function updateUser(userId: string, data: Partial<TUserInsert>) {
  const whereClause = getDefinedAttributes({ userId });
  const user = await User.findOne({ where: whereClause });
  if (!user) return null;
  return user.update(data);
}

export async function deleteEnrolement(userId: string) {
  const whereClause = getDefinedAttributes({ userId });
  const user = await User.findOne({ where: whereClause });
  if (!user) return false;
  await user.destroy();
  return true;
}
