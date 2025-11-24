import type {
  TClassroom,
  TEnrolement,
  TEnrolementInsert,
  TUserInsert,
  TWithUser,
} from "@/commons/types/models";
import type { TClassroomInsert } from "./models";
import type { SECTION, STUDENT_STATUS } from "@/commons/constants/enum";
export * from "./models";

export type WithSchoolId<T = {}> = T & { schoolId: string };
export type WithSchoolAndYearId<T = {}> = T & {
  schoolId: string;
  yearId?: string;
};
export type QueryParams<TQuery, TParams> = TQuery & { params?: TParams };

export type TQuickEnrolementInsert = Omit<TEnrolementInsert, "studentId"> & {
  student: TUserInsert;
};

// params
export type GetClassroomParams = QueryParams<
  WithSchoolAndYearId,
  Partial<TClassroomInsert>
>;

export type DocumentFilter = WithSchoolAndYearId<{
  schoolId: string;
  yearId?: string;
  documentType: string;
  sections: string[] | string;
  classrooms: string[] | string;
}>;

/**
 * Interface pour les retours de comptage simples.
 */
export interface CountResult {
  studentCount: number;
}

/**
 * Interface pour les données de genre.
 */
export interface GenderCountResult {
  femaleCount: number;
  maleCount: number;
}

/**
 * Retour de `getTotalStudentsInSchool`.
 * @type {number} Le nombre total d'élèves.
 */
export type TotalStudentsInSchool = { total: number };

/**
 * Retour de `getStudentsBySection`.
 * @type {Array<object>} Un tableau de résultats par section.
 */
export type StudentsBySection = CountResult & {
  section: SECTION;
};

/**
 * Retour de `getGenderCountByClassAndSection`.
 * @type {Array<object>} Un tableau de résultats par classe.
 */
export type GenderCountByClassAndSection = {
  classId: string;
  identifier: string;
  ClassroomEnrolements: (GenderCountResult & CountResult)[];
};

/**
 * Retour de `getStudentsByOptionForSecondary`.
 * @type {Array<object>} Un tableau de résultats par option.
 */
export type StudentsByOptionForSecondary = CountResult & {
  optionName: string;
};
/**
 * Retour de `getGenderCountForClass`.
 * @type {object | null} Un objet de comptage de genre ou `null`.
 */
export type GenderCountForClass = (GenderCountResult & CountResult) | null;

/**
 * Retour de `getGenderAndStatusCountForClass`.
 * @type {Array<object>} Un tableau de résultats par statut et genre.
 */
export type GenderAndStatusCountForClass = (GenderCountResult & CountResult) & {
  status: STUDENT_STATUS;
};

// Type pour les objets dans le tableau `genderCountByClassAndSection`
export type ClassGenderCount = {
  classId: string;
  femaleCount: number;
  identifier: string;
  maleCount: number;
  shortIdentifier: string;
};

// Type pour les objets dans le tableau `secondaryStudentsByOption`
export type OptionStudentCount = {
  femaleCount: number;
  maleCount: number;
  optionName: string;
  optionShortName: string;
  studentCount: number;
};

// Type pour les objets dans le tableau `studentsBySection`
export type SectionStudentCount = {
  femaleCount: number;
  maleCount: number;
  section: string;
  studentCount: number;
};

// Type pour l'objet `totalStudents`
export type TotalStudentCount = {
  femaleCount: number;
  maleCount: number;
  studentCount: number;
};

// Type global qui encapsule tous les autres
export type StudentData = {
  genderCountByClassAndSection: ClassGenderCount[];
  secondaryStudentsByOption: OptionStudentCount[];
  studentsBySection: SectionStudentCount[];
  totalStudents: TotalStudentCount;
};

export type ClassesWithStudents = TClassroom & {
  ClassroomEnrolements: TWithUser<TEnrolement>[];
};
