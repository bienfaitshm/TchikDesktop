import type {
  SECTION,
  USER_GENDER,
  USER_ROLE,
  STUDENT_STATUS,
  ENROLEMENT_ACTION,
} from "@/commons/constants/enum";

// =============================================================================
//  1. SCHOOL INTERFACES
// =============================================================================

/** Attributs de base du modèle School (lectures depuis la DB) */
export interface SchoolAttributes {
  schoolId: string;
  name: string;
  adress: string;
  town: string;
  logo?: string | null;
}

export type TSchool = Required<SchoolAttributes>;
export type TSchoolInsert = Omit<SchoolAttributes, "schoolId">;

/** Types pour les associations */
export type TWithSchool<T> = T & { School: TSchool };
export type TWithSchools<T> = T & { School: TSchool[] };

// =============================================================================
//  2. USER INTERFACES
// =============================================================================

/** Attributs de base du modèle User */
export interface UserAttributes {
  userId?: string;
  // Champs requis
  lastName: string;
  middleName: string;
  // Champs optionnels ou virtuels
  firstName?: string | null;
  fullname?: string; // Virtuel
  gender?: USER_GENDER;
  role?: USER_ROLE;
  birthDate?: Date | null;
  birthPlace?: string | null;
  // Clés/Authentification
  username?: string;
  schoolId?: string;
  password?: string;
}

export type TUser = Required<UserAttributes>;
export type TUserInsert = Omit<UserAttributes, "userId" | "fullname">; // On retire aussi fullname (Virtuel)

/** Types pour les associations */
export type TWithUser<T> = T & { User: TUser };
export type TWithUsers<T> = T & { User: TUser[] };

// =============================================================================
//  3. OPTION INTERFACES
// =============================================================================

/** Attributs de base du modèle Option */
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

/** Types pour les associations */
export type TWithOption<T> = T & { Option: TOption };
export type TWithOptions<T> = T & { Options: TOption[] };

// =============================================================================
//  4. STUDY YEAR INTERFACES
// =============================================================================

/** Attributs de base du modèle StudyYear */
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

/** Types pour les associations */
export type TWithStudyYear<T> = T & { StudyYear: TStudyYear }; // CORRIGÉ
export type TWithStudyYears<T> = T & { StudyYears: TStudyYear[] }; // CORRIGÉ

// =============================================================================
//  5. CLASSROOM INTERFACES
// =============================================================================

/** Attributs de base du modèle ClassRoom */
export interface ClassroomAttributes {
  // Renommé de ClassAttributes
  classId?: string;
  //
  identifier: string;
  shortIdentifier: string;
  yearId: string;
  schoolId: string;
  section?: SECTION;
  optionId?: string | null;
}

export type TClassroom = Required<ClassroomAttributes>;
export type TClassroomInsert = Omit<ClassroomAttributes, "classId">;

/** Types pour les associations */
export type TWithClassroom<T> = T & { ClassRoom: TClassroom };
export type TWithClassrooms<T> = T & { ClassRooms: TClassroom[] };

// =============================================================================
//  6. CLASSROOM ENROLEMENT INTERFACES
// =============================================================================

/** Attributs de base du modèle ClassroomEnrolement */
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

/** Types pour les associations */
export type TWithEnrolement<T> = T & { ClassroomEnrolement: TEnrolement };
export type TWithEnrolements<T> = T & { ClassroomEnrolements: TEnrolement[] };

// =============================================================================
//  7. ENROLEMENT ACTION INTERFACES
// =============================================================================

/** Attributs pour tracer les actions sur les inscriptions (historique de statut) */
export interface ClassroomEnrolementActionAttributes {
  actionId: string;
  //
  enrolementId: string;
  reason?: string;
  action: ENROLEMENT_ACTION;
}

// =============================================================================
//  8. ALIAS D'INSERTION SIMPLIFIÉS
// =============================================================================

/** Alias pour la création de nouvelles entrées dans la DB. */
export type UserAttributesInsert = TUserInsert;
export type SchoolAttributesInsert = TSchoolInsert;
export type ClassAttributesInsert = TClassroomInsert;
export type OptionAttributesInsert = TOptionInsert;
export type StudyYearAttributesInsert = TStudyYearInsert;
export type ClassroomEnrolementAttributesInsert = TEnrolementInsert;
