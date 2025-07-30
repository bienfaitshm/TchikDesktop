import type {
  SchoolAttributes,
  ClassAttributes,
  ClassroomEnrolementAttributes,
  OptionAttributes,
  StudyYearAttributes,
  UserAttributes,
} from "@/camons/types/models";

export type WithSchoolId<T> = T & { schoolId: string };
export type WithSchoolAndYearId<T> = T & { schoolId: string; yearId?: string };

export type {
  SchoolAttributes,
  ClassAttributes,
  ClassroomEnrolementAttributes,
  OptionAttributes,
  StudyYearAttributes,
  UserAttributes,
};
