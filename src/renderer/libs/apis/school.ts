import type {
  ClassAttributes,
  OptionAttributes,
  SchoolAttributes,
  StudyYearAttributes,
  WithSchoolAndYearId,
  WithSchoolId,
  ClassAttributesInsert,
  OptionAttributesInsert,
  SchoolAttributesInsert,
  StudyYearAttributesInsert,
} from "@/camons/types/services";
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
  return clientApis
    .get<ClassAttributes[]>("classrooms", {
      params: { schoolId, yearId },
    })
    .then((res) => res.data);
};

/**
 * @function createClassroom
 * @description Client action to create a new classroom.
 */
export const createClassroom = (data: ClassAttributesInsert) => {
  return clientApis
    .post<ClassAttributes, ClassAttributesInsert>("classrooms", data)
    .then((res) => res.data);
};

/**
 * @function updateClassroom
 * @description Client action to update an existing classroom.
 */
export const updateClassroom = (
  data: Partial<ClassAttributesInsert>,
  schoolId: string,
  classId: string
) => {
  return clientApis
    .put<
      ClassAttributes,
      Partial<ClassAttributesInsert>
    >("classrooms", data, { params: { schoolId, classId } })
    .then((res) => res.data);
};

/**
 * @function deleteClassroom
 * @description Client action to delete a classroom.
 */
export const deleteClassroom = (schoolId: string, classId: string) => {
  return clientApis
    .delete<{ message: string }>("classrooms", {
      params: { schoolId, classId },
    })
    .then((res) => res.data);
};

// --- Client Actions for Options ---

/**
 * @function getOptions
 * @description Client action to retrieve all options for a given school.
 */
export const getOptions = (schoolId: string) => {
  return clientApis
    .get<OptionAttributes[]>("options", {
      params: { schoolId },
    })
    .then((res) => res.data);
};

/**
 * @function createOption
 * @description Client action to create a new option.
 */
export const createOption = (data: OptionAttributesInsert) => {
  return clientApis
    .post<OptionAttributes, OptionAttributesInsert>("options", data)
    .then((res) => res.data);
};

/**
 * @function updateOption
 * @description Client action to update an existing option.
 */
export const updateOption = (
  data: Partial<OptionAttributesInsert>,
  schoolId: string,
  optionId: string
) => {
  return clientApis
    .put<
      OptionAttributes,
      Partial<OptionAttributesInsert>
    >("options", data, { params: { schoolId, optionId } })
    .then((res) => res.data);
};

/**
 * @function deleteOption
 * @description Client action to delete an option.
 */
export const deleteOption = (schoolId: string, optionId: string) => {
  return clientApis
    .delete<{ message: string }>("options", {
      params: { schoolId, optionId },
    })
    .then((res) => res.data);
};

// --- Client Actions for StudyYears ---

/**
 * @function getStudyYears
 * @description Client action to retrieve all study years for a given school.
 */
export const getStudyYears = (schoolId: string) => {
  return clientApis
    .get<StudyYearAttributes[]>("study-years", {
      params: { schoolId },
    })
    .then((res) => res.data);
};

/**
 * @function createStudyYear
 * @description Client action to create a new study year.
 */
export const createStudyYear = (data: StudyYearAttributesInsert) => {
  return clientApis
    .post<StudyYearAttributes, StudyYearAttributesInsert>("study-years", data)
    .then((res) => res.data);
};

/**
 * @function updateStudyYear
 * @description Client action to update an existing study year.
 */
export const updateStudyYear = (
  data: Partial<StudyYearAttributesInsert>,
  schoolId: string,
  studyYearId: string
) => {
  return clientApis
    .put<
      StudyYearAttributes,
      Partial<StudyYearAttributesInsert>
    >("study-years", data, { params: { schoolId, studyYearId } })
    .then((res) => res.data);
};

/**
 * @function deleteStudyYear
 * @description Client action to delete a study year.
 */
export const deleteStudyYear = (schoolId: string, studyYearId: string) => {
  return clientApis
    .delete<{ message: string }>("study-years", {
      params: { schoolId, studyYearId },
    })
    .then((res) => res.data);
};

// --- Client Actions for Schools (Corrected from your example) ---

/**
 * @function getSchools
 * @description Client action to retrieve all schools.
 */
export const getSchools = () => {
  return clientApis.get<SchoolAttributes[]>("schools").then((res) => res.data);
};

/**
 * @function getSchoolById
 * @description Client action to retrieve a single school by its ID.
 */
export const getSchoolById = (schoolId: string) => {
  return clientApis
    .get<SchoolAttributes>(`schools/${schoolId}`)
    .then((res) => res.data);
};

/**
 * @function createSchool
 * @description Client action to create a new school.
 */
export const createSchool = (data: SchoolAttributesInsert) => {
  return clientApis
    .post<SchoolAttributes, SchoolAttributesInsert>("schools", data)
    .then((res) => res.data);
};

/**
 * @function updateSchool
 * @description Client action to update an existing school.
 */
export const updateSchool = (
  data: Partial<SchoolAttributesInsert>,
  schoolId: string
) => {
  return clientApis
    .put<
      SchoolAttributes,
      Partial<SchoolAttributesInsert>
    >("schools", data, { params: { schoolId } })
    .then((res) => res.data);
};

/**
 * @function deleteSchool
 * @description Client action to delete a school.
 */
export const deleteSchool = (schoolId: string) => {
  return clientApis
    .delete<{ message: string }>("schools", {
      params: { schoolId },
    })
    .then((res) => res.data);
};
