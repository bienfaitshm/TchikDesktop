import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  ClassAttributes,
  OptionAttributes,
  SchoolAttributes,
  StudyYearAttributes,
} from "@/camons/types/services";
import * as apis from "@/renderer/libs/apis/school";

// --- School Hooks ---

/**
 * @function useGetSchools
 * @description Hook to fetch all schools.
 */
export function useGetSchools() {
  return useQuery<SchoolAttributes[], Error>({
    queryKey: ["GET_SCHOOLS"],
    queryFn: () => apis.getSchools(),
  });
}

/**
 * @function useGetSchoolById
 * @description Hook to fetch a single school by its ID.
 */
export function useGetSchoolById(schoolId: string) {
  return useQuery<SchoolAttributes, Error>({
    queryKey: ["GET_SCHOOL_BY_ID", schoolId],
    queryFn: () => apis.getSchoolById(schoolId),
    enabled: !!schoolId, // Only run query if schoolId is available
  });
}

/**
 * @function useCreateSchool
 * @description Hook to create a new school.
 */
export function useCreateSchool() {
  return useMutation<SchoolAttributes, Error, SchoolAttributes>({
    mutationKey: ["CREATE_SCHOOL"],
    mutationFn: (data) => apis.createSchool(data),
    // Consider adding onSuccess to invalidate 'GET_SCHOOLS' query
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
    { data: Partial<SchoolAttributes>; schoolId: string }
  >({
    mutationKey: ["UPDATE_SCHOOL"],
    mutationFn: ({ data, schoolId }) => apis.updateSchool(data, schoolId),
    // Consider adding onSuccess to invalidate 'GET_SCHOOLS' or 'GET_SCHOOL_BY_ID' queries
  });
}

/**
 * @function useDeleteSchool
 * @description Hook to delete a school.
 */
export function useDeleteSchool() {
  return useMutation<{ message: string }, Error, string>({
    mutationKey: ["DELETE_SCHOOL"],
    mutationFn: (schoolId) => apis.deleteSchool(schoolId),
    // Consider adding onSuccess to invalidate 'GET_SCHOOLS' query
  });
}

// --- Classroom Hooks ---

/**
 * @function useGetClassrooms
 * @description Hook to fetch all classrooms for a given school, optionally filtered by year.
 */
export function useGetClassrooms(schoolId: string, yearId?: string) {
  return useQuery<ClassAttributes[], Error>({
    queryKey: ["GET_CLASSROOMS", schoolId, yearId],
    queryFn: () => apis.getClassrooms(schoolId, yearId),
    enabled: !!schoolId, // Only run query if schoolId is available
  });
}

/**
 * @function useCreateClassroom
 * @description Hook to create a new classroom.
 */
export function useCreateClassroom() {
  return useMutation<
    ClassAttributes,
    Error,
    { data: ClassAttributes; schoolId: string; yearId: string }
  >({
    mutationKey: ["CREATE_CLASSROOM"],
    mutationFn: ({ data, schoolId, yearId }) =>
      apis.createClassroom(data, schoolId, yearId),
    // Consider adding onSuccess to invalidate 'GET_CLASSROOMS' query
  });
}

/**
 * @function useUpdateClassroom
 * @description Hook to update an existing classroom.
 */
export function useUpdateClassroom() {
  return useMutation<
    ClassAttributes,
    Error,
    { data: Partial<ClassAttributes>; schoolId: string; classId: string }
  >({
    mutationKey: ["UPDATE_CLASSROOM"],
    mutationFn: ({ data, schoolId, classId }) =>
      apis.updateClassroom(data, schoolId, classId),
    // Consider adding onSuccess to invalidate 'GET_CLASSROOMS' query
  });
}

/**
 * @function useDeleteClassroom
 * @description Hook to delete a classroom.
 */
export function useDeleteClassroom() {
  return useMutation<
    { message: string },
    Error,
    { schoolId: string; classId: string }
  >({
    mutationKey: ["DELETE_CLASSROOM"],
    mutationFn: ({ schoolId, classId }) =>
      apis.deleteClassroom(schoolId, classId),
    // Consider adding onSuccess to invalidate 'GET_CLASSROOMS' query
  });
}

// --- Option Hooks ---

/**
 * @function useGetOptions
 * @description Hook to fetch all options for a given school.
 */
export function useGetOptions(schoolId: string) {
  return useQuery<OptionAttributes[], Error>({
    queryKey: ["GET_OPTIONS", schoolId],
    queryFn: () => apis.getOptions(schoolId),
    enabled: !!schoolId,
  });
}

/**
 * @function useCreateOption
 * @description Hook to create a new option.
 */
export function useCreateOption() {
  return useMutation<
    OptionAttributes,
    Error,
    { data: OptionAttributes; schoolId: string; yearId: string }
  >({
    mutationKey: ["CREATE_OPTION"],
    mutationFn: ({ data, schoolId, yearId }) =>
      apis.createOption(data, schoolId, yearId),
    // Consider adding onSuccess to invalidate 'GET_OPTIONS' query
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
    // Consider adding onSuccess to invalidate 'GET_OPTIONS' query
  });
}

/**
 * @function useDeleteOption
 * @description Hook to delete an option.
 */
export function useDeleteOption() {
  return useMutation<
    { message: string },
    Error,
    { schoolId: string; optionId: string }
  >({
    mutationKey: ["DELETE_OPTION"],
    mutationFn: ({ schoolId, optionId }) =>
      apis.deleteOption(schoolId, optionId),
    // Consider adding onSuccess to invalidate 'GET_OPTIONS' query
  });
}

// --- Study Year Hooks ---

/**
 * @function useGetStudyYears
 * @description Hook to fetch all study years for a given school.
 */
export function useGetStudyYears(schoolId: string) {
  return useQuery<StudyYearAttributes[], Error>({
    queryKey: ["GET_STUDY_YEARS", schoolId],
    queryFn: () => apis.getStudyYears(schoolId),
    enabled: !!schoolId,
  });
}

/**
 * @function useCreateStudyYear
 * @description Hook to create a new study year.
 */
export function useCreateStudyYear() {
  return useMutation<
    StudyYearAttributes,
    Error,
    { data: StudyYearAttributes; schoolId: string }
  >({
    mutationKey: ["CREATE_STUDY_YEAR"],
    mutationFn: ({ data, schoolId }) => apis.createStudyYear(data, schoolId),
    // Consider adding onSuccess to invalidate 'GET_STUDY_YEARS' query
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
      data: Partial<StudyYearAttributes>;
      schoolId: string;
      studyYearId: string;
    }
  >({
    mutationKey: ["UPDATE_STUDY_YEAR"],
    mutationFn: ({ data, schoolId, studyYearId }) =>
      apis.updateStudyYear(data, schoolId, studyYearId),
    // Consider adding onSuccess to invalidate 'GET_STUDY_YEARS' query
  });
}

/**
 * @function useDeleteStudyYear
 * @description Hook to delete a study year.
 */
export function useDeleteStudyYear() {
  return useMutation<
    { message: string },
    Error,
    { schoolId: string; studyYearId: string }
  >({
    mutationKey: ["DELETE_STUDY_YEAR"],
    mutationFn: ({ schoolId, studyYearId }) =>
      apis.deleteStudyYear(schoolId, studyYearId),
    // Consider adding onSuccess to invalidate 'GET_STUDY_YEARS' query
  });
}
