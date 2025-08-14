import { ClassroomEnrolement, User } from "../models";
import { TUserInsert } from "@/camons/types/models";
import type { QueryParams, WithSchoolAndYearId } from "@/camons/types/services";
import {
  getDefaultUsername,
  getDefinedAttributes,
} from "@/main/db/models/utils";
import { getDefaultEnrolementCode } from "@/main/db/services/utils";

const DEFAULT_STUDENT_PASSWORD = "000000";

export async function getUsers({
  schoolId,
  yearId,
  params: { classroomId, ...params },
}: QueryParams<
  WithSchoolAndYearId,
  Partial<TUserInsert & { classroomId: string }>
>) {
  const whereClause = getDefinedAttributes({ schoolId, ...params });
  return User.findAll({
    where: whereClause,
    include: [
      User,
      {
        model: ClassroomEnrolement,
        where: getDefinedAttributes({ yearId, classroomId }),
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
