import type {
  TEnrolement,
  TEnrolementInsert,
  TUserInsert,
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
  sections: SECTION[] | SECTION;
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
export type TotalStudentsInSchool = number;

/**
 * Retour de `getStudentsBySection`.
 * @type {Array<object>} Un tableau de résultats par section.
 */
export type StudentsBySection = (CountResult & {
  section: SECTION;
})[];

/**
 * Retour de `getGenderCountByClassAndSection`.
 * @type {Array<object>} Un tableau de résultats par classe.
 */
export type GenderCountByClassAndSection = {
  classId: string;
  identifier: string;
  ClassroomEnrolements: GenderCountResult[];
}[];

/**
 * Retour de `getStudentsByOptionForSecondary`.
 * @type {Array<object>} Un tableau de résultats par option.
 */
export type StudentsByOptionForSecondary = (CountResult & {
  optionName: string;
})[];
/**
 * Retour de `getGenderCountForClass`.
 * @type {object | null} Un objet de comptage de genre ou `null`.
 */
export type GenderCountForClass = GenderCountResult | null;

/**
 * Retour de `getGenderAndStatusCountForClass`.
 * @type {Array<object>} Un tableau de résultats par statut et genre.
 */
export type GenderAndStatusCountForClass = (GenderCountResult & {
  status: STUDENT_STATUS;
})[];

/**
 * Retour de `getEnrolementHistory`.
 * @type {Array<ClassroomEnrolement>} Un tableau d'objets d'inscription complets.
 */
export type EnrolementHistory = TEnrolement[];
