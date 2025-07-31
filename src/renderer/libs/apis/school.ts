import type {
  ClassAttributes,
  OptionAttributes,
  SchoolAttributes,
  StudyYearAttributes,
  WithSchoolAndYearId,
  WithSchoolId,
} from "@/camons/types/services";
import { TResponse, actionFn } from "@/camons/libs/electron-apis/utils";
import { clientApis } from "./client";

export type WithSchoolIdParams<T extends {} = {}> = WithSchoolId<T>;
export type WithSchoolAndYearIdParams<T extends {} = {}> =
  WithSchoolAndYearId<T>;

// --- Client Actions for Classrooms ---

/**
 * @function getClassrooms
 * @description Client action to retrieve all classrooms for a given school, optionally filtered by year.
 */
export const getClassrooms = (schoolId: string, yearId?: string) => {
  return actionFn(
    clientApis.get<TResponse<ClassAttributes[]>>("classrooms", {
      params: { schoolId, yearId },
    })
  ).then((res) => res.data);
};

/**
 * @function createClassroom
 * @description Client action to create a new classroom.
 */
export const createClassroom = (
  data: Omit<ClassAttributes, "yearId" | "schoolId">,
  schoolId: string,
  yearId: string
) => {
  return actionFn(
    clientApis.post<
      TResponse<ClassAttributes>,
      WithSchoolAndYearId<ClassAttributes>
    >("classrooms", { ...data, schoolId, yearId })
  ).then((res) => res.data);
};

/**
 * @function updateClassroom
 * @description Client action to update an existing classroom.
 */
export const updateClassroom = (
  data: Partial<ClassAttributes>,
  schoolId: string,
  classId: string
) => {
  return actionFn(
    clientApis.put<TResponse<ClassAttributes>, Partial<ClassAttributes>>(
      "classrooms",
      data,
      { params: { schoolId, classId } }
    )
  ).then((res) => res.data);
};

/**
 * @function deleteClassroom
 * @description Client action to delete a classroom.
 */
export const deleteClassroom = (schoolId: string, classId: string) => {
  return actionFn(
    clientApis.delete<TResponse<{ message: string }>>("classrooms", {
      params: { schoolId, classId },
    })
  ).then((res) => res.data);
};

// --- Client Actions for Options ---

/**
 * @function getOptions
 * @description Client action to retrieve all options for a given school.
 */
export const getOptions = (schoolId: string) => {
  return actionFn(
    clientApis.get<TResponse<OptionAttributes[]>>("options", {
      params: { schoolId },
    })
  ).then((res) => res.data);
};

/**
 * @function createOption
 * @description Client action to create a new option.
 */
export const createOption = (
  data: OptionAttributes,
  schoolId: string,
  yearId: string
) => {
  return actionFn(
    clientApis.post<
      TResponse<OptionAttributes>,
      WithSchoolAndYearId<OptionAttributes>
    >(
      "options",
      { ...data, schoolId, yearId } // Data and params merged as per server expectation
    )
  ).then((res) => res.data);
};

/**
 * @function updateOption
 * @description Client action to update an existing option.
 */
export const updateOption = (
  data: Partial<OptionAttributes>,
  schoolId: string,
  optionId: string
) => {
  return actionFn(
    clientApis.put<TResponse<OptionAttributes>, Partial<OptionAttributes>>(
      "options",
      data,
      { params: { schoolId, optionId } }
    )
  ).then((res) => res.data);
};

/**
 * @function deleteOption
 * @description Client action to delete an option.
 */
export const deleteOption = (schoolId: string, optionId: string) => {
  return actionFn(
    clientApis.delete<TResponse<{ message: string }>>("options", {
      params: { schoolId, optionId },
    })
  ).then((res) => res.data);
};

// --- Client Actions for StudyYears ---

/**
 * @function getStudyYears
 * @description Client action to retrieve all study years for a given school.
 */
export const getStudyYears = (schoolId: string) => {
  return actionFn(
    clientApis.get<TResponse<StudyYearAttributes[]>>("study-years", {
      params: { schoolId },
    })
  ).then((res) => res.data);
};

/**
 * @function createStudyYear
 * @description Client action to create a new study year.
 */
export const createStudyYear = (
  data: StudyYearAttributes,
  schoolId: string
) => {
  return actionFn(
    clientApis.post<
      TResponse<StudyYearAttributes>,
      WithSchoolId<StudyYearAttributes>
    >("study-years", { ...data, schoolId })
  ).then((res) => res.data);
};

/**
 * @function updateStudyYear
 * @description Client action to update an existing study year.
 */
export const updateStudyYear = (
  data: Partial<StudyYearAttributes>,
  schoolId: string,
  studyYearId: string
) => {
  return actionFn(
    clientApis.put<
      TResponse<StudyYearAttributes>,
      Partial<StudyYearAttributes>
    >("study-years", data, { params: { schoolId, studyYearId } })
  ).then((res) => res.data);
};

/**
 * @function deleteStudyYear
 * @description Client action to delete a study year.
 */
export const deleteStudyYear = (schoolId: string, studyYearId: string) => {
  return actionFn(
    clientApis.delete<TResponse<{ message: string }>>("study-years", {
      params: { schoolId, studyYearId },
    })
  ).then((res) => res.data);
};

// --- Client Actions for Schools (Corrected from your example) ---

/**
 * @function getSchools
 * @description Client action to retrieve all schools.
 */
export const getSchools = () => {
  return actionFn(
    clientApis.get<TResponse<SchoolAttributes[]>>("schools")
  ).then((res) => res.data);
};

/**
 * @function getSchoolById
 * @description Client action to retrieve a single school by its ID.
 */
export const getSchoolById = (schoolId: string) => {
  return actionFn(
    clientApis.get<TResponse<SchoolAttributes>>(
      `schools/${schoolId}` // Direct path for specific school
    )
  ).then((res) => res.data);
};

/**
 * @function createSchool
 * @description Client action to create a new school.
 */
export const createSchool = (data: Omit<SchoolAttributes, "schoolId">) => {
  return actionFn(
    clientApis.post<
      TResponse<SchoolAttributes>,
      Omit<SchoolAttributes, "schoolId">
    >("schools", data)
  ).then((res) => res.data);
};

/**
 * @function updateSchool
 * @description Client action to update an existing school.
 */
export const updateSchool = (
  data: Partial<SchoolAttributes>,
  schoolId: string
) => {
  return actionFn(
    clientApis.put<TResponse<SchoolAttributes>, Partial<SchoolAttributes>>(
      "schools",
      data,
      { params: { schoolId } }
    )
  ).then((res) => res.data);
};

/**
 * @function deleteSchool
 * @description Client action to delete a school.
 */
export const deleteSchool = (schoolId: string) => {
  return actionFn(
    clientApis.delete<TResponse<{ message: string }>>("schools", {
      params: { schoolId },
    })
  ).then((res) => res.data);
};
