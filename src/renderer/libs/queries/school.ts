import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type {
  TSchool,
  TSchoolInsert,
  TStudyYear,
  TStudyYearInsert,
} from "@/commons/types/services";
import * as apis from "@/renderer/libs/apis/school";

// --- School Hooks ---

/**
 * @function useGetSchools
 * @description Hook to fetch all schools.
 */
export function useGetSchools() {
  return useSuspenseQuery<TSchool[], Error>({
    queryKey: ["GET_SCHOOLS"],
    queryFn: () => apis.getSchools(),
  });
}

/**
 * @function useGetSchoolById
 * @description Hook to fetch a single school by its ID.
 */
export function useGetSchoolById(schoolId: string) {
  return useSuspenseQuery<TSchool, Error>({
    queryKey: ["GET_SCHOOL_BY_ID", schoolId],
    queryFn: () => apis.getSchool(schoolId),
  });
}

/**
 * @function useCreateSchool
 * @description Hook to create a new school.
 */
export function useCreateSchool() {
  return useMutation<TSchool, Error, TSchoolInsert>({
    mutationKey: ["CREATE_SCHOOL"],
    mutationFn: (data) => apis.createSchool(data),
  });
}

/**
 * @function useUpdateSchool
 * @description Hook to update an existing school.
 */
export function useUpdateSchool() {
  return useMutation<
    TSchool,
    Error,
    { data: Partial<TSchoolInsert>; schoolId: string }
  >({
    mutationKey: ["UPDATE_SCHOOL"],
    mutationFn: ({ data, schoolId }) => apis.updateSchool(schoolId, data),
  });
}

/**
 * @function useDeleteSchool
 * @description Hook to delete a school.
 */
export function useDeleteSchool() {
  return useMutation<any, Error, string>({
    mutationKey: ["DELETE_SCHOOL"],
    mutationFn: (schoolId) => apis.deleteSchool(schoolId),
  });
}

// --- Study Year Hooks ---

/**
 * @function useGetStudyYears
 * @description Hook to fetch all study years for a given school.
 */
export function useGetStudyYears(schoolId: string) {
  return useSuspenseQuery<TStudyYear[], Error>({
    queryKey: ["GET_STUDY_YEARS", schoolId],
    queryFn: () => apis.getStudyYears(schoolId),
  });
}

/**
 * @function useCreateStudyYear
 * @description Hook to create a new study year.
 */
export function useCreateStudyYear() {
  return useMutation<TStudyYear, Error, TStudyYearInsert>({
    mutationKey: ["CREATE_STUDY_YEAR"],
    mutationFn: (data) => apis.createStudyYear(data),
  });
}

/**
 * @function useUpdateStudyYear
 * @description Hook to update an existing study year.
 */
export function useUpdateStudyYear() {
  return useMutation<
    TStudyYear,
    Error,
    {
      data: Partial<TStudyYearInsert>;
      schoolId: string;
      studyYearId: string;
    }
  >({
    mutationKey: ["UPDATE_STUDY_YEAR"],
    mutationFn: ({ data, schoolId, studyYearId }) =>
      apis.updateStudyYear(data, schoolId, studyYearId),
  });
}

/**
 * @function useDeleteStudyYear
 * @description Hook to delete a study year.
 */
export function useDeleteStudyYear() {
  return useMutation<any, Error, { schoolId: string; studyYearId: string }>({
    mutationKey: ["DELETE_STUDY_YEAR"],
    mutationFn: ({ schoolId, studyYearId }) =>
      apis.deleteStudyYear(schoolId, studyYearId),
  });
}
