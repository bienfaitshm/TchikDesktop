import type { SECTION, USER_GENDER, USER_ROLE } from "@/camons/constants/enum";
// =====================
// ATTRIBUTE INTERFACES
// =====================

export interface SchoolAttributes {
  schoolId: string;
  name: string;
  adress: string;
  town: string;
  logo?: string | null;
}
export interface UserAttributes {
  userId: string;
  lastName: string;
  middleName: string;
  firstName?: string | null;
  username: string;
  password: string;
  gender: USER_GENDER;
  role: USER_ROLE;
  birthDate?: Date | null;
  birthPlace?: Date | null;
  schoolId: string;
}

export interface OptionAttributes {
  optionId: string;
  optionName: string;
  optionShortName: string;
  section: SECTION;
  schoolId: string;
}

export interface StudyYearAttributes {
  yearId: string;
  yearName: string;
  startDate: Date;
  endDate: Date;
  schoolId: string;
}

export interface ClassAttributes {
  classId: string;
  identifier: string;
  shortIdentifier: string;
  section: SECTION;
  yearId: string;
  optionId?: string | null;
  schoolId: string;
}

export interface ClassroomEnrolementAttributes {
  enrolementId: string;
  enrolement: string;
  classroomId: string;
  studentId: string; // userId
  isNewStudent: boolean;
  code: string;
  schoolId: string;
}

export type UserAttributesInsert = Omit<UserAttributes, "userId">;
export type SchoolAttributesInsert = Omit<SchoolAttributes, "schoolId">;
export type ClassAttributesInsert = Omit<ClassAttributes, "classId">;
export type OptionAttributesInsert = Omit<OptionAttributes, "optionId">;
export type StudyYearAttributesInsert = Omit<StudyYearAttributes, "yearId">;
export type ClassroomEnrolementAttributesInsert = Omit<
  ClassroomEnrolementAttributes,
  "enrolementId"
>;
