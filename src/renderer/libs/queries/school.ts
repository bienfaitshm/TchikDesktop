import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  TSchoolCreate,
  TSchoolUpdate,
  TSchoolFilter,
  TStudyYearCreate,
  TStudyYearUpdate,
  TStudyYearFilter,
} from "@/packages/@core/data-access/schema-validations";
import { school } from "@/renderer/libs/apis";
import { TQueryUpdate } from "./type";

// =======================================================================
// 📚 School Hooks
// =======================================================================

/**
 * @function useGetSchools
 * @description Hook pour récupérer toutes les écoles, avec filtres optionnels.
 * @param params Les filtres pour la pagination, le tri ou la recherche.
 */
export function useGetSchools(params?: TSchoolFilter) {
  return useSuspenseQuery({
    queryKey: ["GET_SCHOOLS", params],
    queryFn: () => school.fetchSchools(params),
  });
}

/**
 * @function useGetSchoolById
 * @description Hook pour récupérer une seule école par son ID.
 * @param schoolId L'ID de l'école.
 */
export function useGetSchoolById(schoolId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_SCHOOL_BY_ID", schoolId],
    queryFn: () => school.fetchSchoolById(schoolId),
  });
}

/**
 * @function useCreateSchool
 * @description Hook pour créer une nouvelle école.
 */
export function useCreateSchool() {
  // Le type de retour est TSchoolAttributes (l'objet créé avec son ID)
  return useMutation({
    mutationKey: ["CREATE_SCHOOL"],
    mutationFn: (data: TSchoolCreate) => school.createSchool(data),
    // Le code Big Tech ajouterait ici onMutate/onSuccess pour invalider le cache GET_SCHOOLS
  });
}

/**
 * @function useUpdateSchool
 * @description Hook pour mettre à jour une école existante.
 */
export function useUpdateSchool() {
  // Le type de retour est TSchoolAttributes (l'objet mis à jour)
  return useMutation({
    mutationKey: ["UPDATE_SCHOOL"],
    mutationFn: ({ data, id }: TQueryUpdate<TSchoolUpdate>) =>
      school.updateSchool(id, data),
  });
}

/**
 * @function useDeleteSchool
 * @description Hook pour supprimer une école.
 */
export function useDeleteSchool() {
  // Le type de retour est généralement 'void' ou 'undefined' en cas de succès
  return useMutation({
    mutationKey: ["DELETE_SCHOOL"],
    mutationFn: (schoolId: string) => school.deleteSchool(schoolId),
  });
}

// =======================================================================
// 🗓️ Study Year Hooks
// =======================================================================

/**
 * @function useGetStudyYears
 * @description Hook pour récupérer toutes les années d'étude, avec filtres optionnels.
 * @param params Les filtres pour la pagination, le tri ou la recherche (incluant potentiellement schoolId).
 */
export function useGetStudyYears(params?: TStudyYearFilter) {
  return useSuspenseQuery({
    queryKey: ["GET_STUDY_YEARS", params],
    queryFn: () => school.fetchStudyYears(params),
  });
}

/**
 * @function useGetStudyYearById
 * @description Hook pour récupérer une seule année d'étude par son ID.
 * @param yearId L'ID de l'année d'étude.
 */
export function useGetStudyYearById(yearId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_STUDY_YEAR_BY_ID", yearId],
    queryFn: () => school.fetchStudyYearById(yearId),
  });
}

/**
 * @function useCreateStudyYear
 * @description Hook pour créer une nouvelle année d'étude.
 */
export function useCreateStudyYear() {
  return useMutation({
    mutationKey: ["CREATE_STUDY_YEAR"],
    mutationFn: (data: TStudyYearCreate) => school.createStudyYear(data),
  });
}

/**
 * @function useUpdateStudyYear
 * @description Hook pour mettre à jour une année d'étude existante.
 */
export function useUpdateStudyYear() {
  return useMutation({
    mutationKey: ["UPDATE_STUDY_YEAR"],
    mutationFn: ({ data, id }: TQueryUpdate<TStudyYearUpdate>) =>
      school.updateStudyYear(id, data),
  });
}

/**
 * @function useDeleteStudyYear
 * @description Hook pour supprimer une année d'étude.
 */
export function useDeleteStudyYear() {
  return useMutation({
    mutationKey: ["DELETE_STUDY_YEAR"],
    mutationFn: (id: string) => school.deleteStudyYear(id),
  });
}
