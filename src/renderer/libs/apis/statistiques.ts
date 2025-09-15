import type {
  GenderAndStatusCountForClass,
  GenderCountForClass,
  StudentsByOptionForSecondary,
  GenderCountByClassAndSection,
  StudentsBySection,
  TotalStudentsInSchool,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import { clientApis } from "./client";

/**
 * Récupère le nombre total d'élèves inscrits dans une école pour une année donnée.
 * @param {WithSchoolAndYearId} params - L'ID de l'école et l'ID de l'année scolaire.
 * @returns {Promise<TotalStudentsInSchool>} Le nombre total d'élèves.
 */
export const getTotalStudentsInSchool = (params: WithSchoolAndYearId) => {
  return clientApis
    .get<TotalStudentsInSchool>("statistiques/total-students", {
      params,
    })
    .then((res) => res.data);
};

/**
 * Récupère le nombre d'élèves par section pour une école.
 * @param {WithSchoolAndYearId} params - L'ID de l'école et l'ID de l'année scolaire.
 * @returns {Promise<StudentsBySection>} Un tableau d'objets avec le nombre d'élèves par section.
 */
export const getStudentsBySection = (params: WithSchoolAndYearId) => {
  return clientApis
    .get<StudentsBySection[]>("statistiques/students-by-section", {
      params,
    })
    .then((res) => res.data);
};

/**
 * Récupère le nombre de garçons et de filles pour chaque classe de l'école.
 * @param {WithSchoolAndYearId} params - L'ID de l'école et l'ID de l'année scolaire.
 * @returns {Promise<GenderCountByClassAndSection>} Un tableau d'objets avec le décompte des genres par classe.
 */
export const getGenderCountByClassAndSection = (
  params: WithSchoolAndYearId
) => {
  return clientApis
    .get<GenderCountByClassAndSection[]>("statistiques/gender-count-by-class", {
      params,
    })
    .then((res) => res.data);
};

/**
 * Récupère le nombre d'élèves par option pour la section secondaire.
 * @param {WithSchoolAndYearId} params - L'ID de l'école et l'ID de l'année scolaire.
 * @returns {Promise<StudentsByOptionForSecondary>} Un tableau d'objets avec le nombre d'élèves par option du secondaire.
 */
export const getStudentsByOptionForSecondary = (
  params: WithSchoolAndYearId
) => {
  return clientApis
    .get<StudentsByOptionForSecondary[]>(
      "statistiques/students-by-option/secondary",
      {
        params,
      }
    )
    .then((res) => res.data);
};

/**
 * Récupère le nombre de garçons et de filles pour une classe spécifique.
 * @param {string} classId - L'ID de la classe.
 * @returns {Promise<GenderCountForClass>} Un objet avec le nombre de garçons et de filles ou null.
 */
export const getGenderCountForClass = (classId: string) => {
  return clientApis
    .get<GenderCountForClass>(`statistiques/gender-count/class/:classId`, {
      params: { classId },
    })
    .then((res) => res.data);
};

/**
 * Récupère le nombre de garçons et de filles par statut d'inscription pour une classe.
 * @param {string} classId - L'ID de la classe.
 * @returns {Promise<GenderAndStatusCountForClass>} Un tableau d'objets avec le décompte des genres par statut.
 */
export const getGenderAndStatusCountForClass = (classId: string) => {
  return clientApis
    .get<GenderAndStatusCountForClass>(
      `statistiques/gender-status-count/class/:classId`,
      { params: { classId } }
    )
    .then((res) => res.data);
};
