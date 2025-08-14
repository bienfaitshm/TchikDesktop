import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type {
  OptionAttributes,
  SchoolAttributes,
  StudyYearAttributes,
  OptionAttributesInsert,
  SchoolAttributesInsert,
  StudyYearAttributesInsert,
} from "@/camons/types/services";
import * as apis from "@/renderer/libs/apis/school";

// --- School Hooks ---

/**
 * @function useGetSchools
 * @description Hook to fetch all schools.
 */
export function useGetSchools() {
  return useSuspenseQuery<SchoolAttributes[], Error>({
    queryKey: ["GET_SCHOOLS"],
    queryFn: () => apis.getSchools(),
  });
}

/**
 * @function useGetSchoolById
 * @description Hook to fetch a single school by its ID.
 */
export function useGetSchoolById(schoolId: string) {
  return useSuspenseQuery<SchoolAttributes, Error>({
    queryKey: ["GET_SCHOOL_BY_ID", schoolId],
    queryFn: () => apis.getSchoolById(schoolId),
  });
}

/**
 * @function useCreateSchool
 * @description Hook to create a new school.
 */
export function useCreateSchool() {
  return useMutation<SchoolAttributes, Error, SchoolAttributesInsert>({
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
    SchoolAttributes,
    Error,
    { data: Partial<SchoolAttributesInsert>; schoolId: string }
  >({
    mutationKey: ["UPDATE_SCHOOL"],
    mutationFn: ({ data, schoolId }) => apis.updateSchool(data, schoolId),
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

// --- Option Hooks ---

/**
 * @function useGetOptions
 * @description Hook to fetch all options for a given school.
 */
export function useGetOptions(schoolId: string) {
  return useSuspenseQuery<OptionAttributes[], Error>({
    queryKey: ["GET_OPTIONS", schoolId],
    queryFn: () => apis.getOptions(schoolId),
  });
}

/**
 * @function useCreateOption
 * @description Hook to create a new option.
 */
export function useCreateOption() {
  return useMutation<OptionAttributes, Error, OptionAttributesInsert>({
    mutationKey: ["CREATE_OPTION"],
    mutationFn: (data) => apis.createOption(data),
  });
}

/**
 * @function useUpdateOption
 * @description Hook to update an existing option.
 */
export function useUpdateOption() {
  return useMutation<
    OptionAttributes,
    Error,
    { data: Partial<OptionAttributes>; schoolId: string; optionId: string }
  >({
    mutationKey: ["UPDATE_OPTION"],
    mutationFn: ({ data, schoolId, optionId }) =>
      apis.updateOption(data, schoolId, optionId),
  });
}

/**
 * @function useDeleteOption
 * @description Hook to delete an option.
 */
export function useDeleteOption() {
  return useMutation<any, Error, { schoolId: string; optionId: string }>({
    mutationKey: ["DELETE_OPTION"],
    mutationFn: ({ schoolId, optionId }) =>
      apis.deleteOption(schoolId, optionId),
  });
}

// --- Study Year Hooks ---

/**
 * @function useGetStudyYears
 * @description Hook to fetch all study years for a given school.
 */
export function useGetStudyYears(schoolId: string) {
  return useSuspenseQuery<StudyYearAttributes[], Error>({
    queryKey: ["GET_STUDY_YEARS", schoolId],
    queryFn: () => apis.getStudyYears(schoolId),
  });
}

/**
 * @function useCreateStudyYear
 * @description Hook to create a new study year.
 */
export function useCreateStudyYear() {
  return useMutation<StudyYearAttributes, Error, StudyYearAttributesInsert>({
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
    StudyYearAttributes,
    Error,
    {
      data: Partial<StudyYearAttributesInsert>;
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
