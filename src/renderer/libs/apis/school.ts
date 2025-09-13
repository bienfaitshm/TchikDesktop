import type {
  TSchool,
  TSchoolInsert,
  TStudyYear,
  TStudyYearInsert,
} from "@/commons/types/services";
import { clientApis } from "./client";

/**
 * @function getStudyYears
 * @description Client action to retrieve all study years for a given school.
 */
export const getStudyYears = (schoolId: string) => {
  return clientApis
    .get<TStudyYear[]>("study-years", {
      params: { schoolId },
    })
    .then((res) => res.data);
};

/**
 * @function createStudyYear
 * @description Client action to create a new study year.
 */
export const createStudyYear = (data: TStudyYearInsert) => {
  return clientApis
    .post<TStudyYear, TStudyYearInsert>("study-years", data)
    .then((res) => res.data);
};

/**
 * @function updateStudyYear
 * @description Client action to update an existing study year.
 */
export const updateStudyYear = (
  yearId: string,
  data: Partial<TStudyYearInsert>
) => {
  return clientApis
    .put<
      TStudyYear,
      Partial<TStudyYearInsert>
    >("study-years/:yearId", data, { params: { yearId } })
    .then((res) => res.data);
};

/**
 * @function deleteStudyYear
 * @description Client action to delete a study year.
 */
export const deleteStudyYear = (yearId: string) => {
  return clientApis
    .delete<{ message: string }>("study-years/:yearId", {
      params: { yearId },
    })
    .then((res) => res.data);
};

// --- Client Actions for Schools (Corrected from your example) ---

/**
 * @function getSchools
 * @description Client action to retrieve all schools.
 */
export const getSchools = () => {
  return clientApis.get<TSchool[]>("schools").then((res) => res.data);
};

/**
 * @function getSchoolById
 * @description Client action to retrieve a single school by its ID.
 */
export const getSchool = (schoolId: string) => {
  return clientApis
    .get<TSchool>("schools/:schoolId", { params: { schoolId } })
    .then((res) => res.data);
};

/**
 * @function createSchool
 * @description Client action to create a new school.
 */
export const createSchool = (data: TSchoolInsert) => {
  return clientApis
    .post<TSchool, TSchoolInsert>("schools", data)
    .then((res) => res.data);
};

/**
 * @function updateSchool
 * @description Client action to update an existing school.
 */
export const updateSchool = (
  schoolId: string,
  data: Partial<TSchoolInsert>
) => {
  return clientApis
    .put<
      TSchool,
      Partial<TSchoolInsert>
    >("schools/:schoolId", data, { params: { schoolId } })
    .then((res) => res.data);
};

/**
 * @function deleteSchool
 * @description Client action to delete a school.
 */
export const deleteSchool = (schoolId: string) => {
  return clientApis
    .delete<{ message: string }>("schools/:schoolId", {
      params: { schoolId },
    })
    .then((res) => res.data);
};
