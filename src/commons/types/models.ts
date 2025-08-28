import type {
  SECTION,
  USER_GENDER,
  USER_ROLE,
  STUDENT_STATUS,
  ENROLEMENT_ACTION,
} from "@/commons/constants/enum";
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

export type TSchool = Required<SchoolAttributes>;
export type TSchoolInsert = Omit<SchoolAttributes, "schoolId">;
export type TWithSchool<T> = T & { School: TSchool };
export type TWithSchools<T> = T & { School: TSchool[] };

export interface UserAttributes {
  userId?: string;
  //
  lastName: string;
  middleName: string;
  firstName?: string | null;
  fullname?: string;
  gender?: USER_GENDER;
  role?: USER_ROLE;
  birthDate?: Date | null;
  birthPlace?: string | null;
  //
  username?: string;
  schoolId?: string;
  password?: string;
}

export type TUser = Required<UserAttributes>;
export type TUserInsert = Omit<UserAttributes, "userId">;
export type TWithUser<T> = T & { User: TUser };
export type TWithUsers<T> = T & { User: TUser[] };

export interface OptionAttributes {
  optionId: string;
  //
  optionName: string;
  optionShortName: string;
  schoolId: string;
  section?: SECTION;
}

export type TOption = Required<OptionAttributes>;
export type TOptionInsert = Omit<OptionAttributes, "optionId">;
export type TWithOption<T> = T & { Option: TOption };
export type TWithOptions<T> = T & { Options: TOption[] };

export interface StudyYearAttributes {
  yearId: string;
  //
  yearName: string;
  startDate: Date;
  endDate: Date;
  schoolId: string;
}

export type TStudyYear = Required<StudyYearAttributes>;
export type TStudyYearInsert = Omit<StudyYearAttributes, "yearId">;
export type TWithStudyYear<T> = T & { StudyYear: TOption };
export type TWithStudyYears<T> = T & { StudyYears: TOption[] };

export interface ClassAttributes {
  classId?: string;
  //
  identifier: string;
  shortIdentifier: string;
  yearId: string;
  schoolId: string;
  section?: SECTION;
  optionId?: string | null;
}

export type TClassroom = Required<ClassAttributes>;
export type TClassroomInsert = Omit<ClassAttributes, "classId">;
export type TWithClassroom<T> = T & { ClassRoom: TClassroom };
export type TWithClassrooms<T> = T & { ClassRooms: TClassroom[] };

export interface ClassroomEnrolementAttributes {
  enrolementId: string;
  //
  classroomId: string;
  studentId: string; // userId
  isNewStudent: boolean;
  schoolId: string;
  //
  status?: STUDENT_STATUS;
  code?: string;
}

export type TEnrolement = Required<ClassroomEnrolementAttributes>;
export type TEnrolementInsert = Omit<
  ClassroomEnrolementAttributes,
  "enrolementId"
>;
export type TWithEnrolement<T> = T & { ClassroomEnrolement: TEnrolement };
export type TWithEnrolements<T> = T & { ClassroomEnrolements: TEnrolement[] };

export interface ClassroomEnrolementActionAttributes {
  actionId: string;
  //
  enrolementId: string;
  reason?: string;
  action: ENROLEMENT_ACTION;
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
