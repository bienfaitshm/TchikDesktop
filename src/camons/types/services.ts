import type {
  ClassAttributes,
  ClassroomEnrolementAttributes,
  OptionAttributes,
  SchoolAttributes,
  StudyYearAttributes,
  UserAttributes,
} from "@/camons/types/models";

export type WithSchoolId<T> = T & { schoolId: string };
export type WithSchoolAndYearId<T> = T & { schoolId: string; yearId?: string };

type UserAttributesInsert = Omit<UserAttributes, "userId">;
type SchoolAttributesInsert = Omit<SchoolAttributes, "schoolId">;
type ClassAttributesInsert = Omit<ClassAttributes, "classId">;
type OptionAttributesInsert = Omit<OptionAttributes, "schoolId">;
type StudyYearAttributesInsert = Omit<StudyYearAttributes, "yearId">;
type ClassroomEnrolementAttributesInsert = Omit<
  ClassroomEnrolementAttributes,
  "enrolementId"
>;

export type {
  SchoolAttributes,
  SchoolAttributesInsert,
  ClassAttributes,
  ClassAttributesInsert,
  ClassroomEnrolementAttributes,
  ClassroomEnrolementAttributesInsert,
  OptionAttributes,
  OptionAttributesInsert,
  StudyYearAttributes,
  StudyYearAttributesInsert,
  UserAttributes,
  UserAttributesInsert,
};
