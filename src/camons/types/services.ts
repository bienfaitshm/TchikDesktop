import type {
  ClassAttributes,
  ClassroomEnrolementAttributes,
  OptionAttributes,
  SchoolAttributes,
  StudyYearAttributes,
  UserAttributes,
  ClassAttributesInsert,
  ClassroomEnrolementAttributesInsert,
  OptionAttributesInsert,
  SchoolAttributesInsert,
  StudyYearAttributesInsert,
  UserAttributesInsert,
} from "@/camons/types/models";

export type WithSchoolId<T> = T & { schoolId: string };
export type WithSchoolAndYearId<T> = T & { schoolId: string; yearId?: string };

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
