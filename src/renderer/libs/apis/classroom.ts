import type {
  QueryParams,
  TClassroomInsert,
  TClassroom,
  TWithOption,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import { clientApis } from "./client";

export type GetClassroomParams = QueryParams<
  WithSchoolAndYearId,
  Partial<TClassroomInsert>
>;
/**
 * @function getClassrooms
 * @description Client action to retrieve all classrooms for a given school, optionally filtered by year.
 */
export const getClassrooms = (params: GetClassroomParams) => {
  return clientApis
    .get<TWithOption<TClassroom>[]>("classrooms", {
      params,
    })
    .then((res) => res.data);
};

export const getClassroom = (classId: string) => {
  return clientApis
    .get<TWithOption<TClassroom>>("classrooms/:classId", {
      params: { classId },
    })
    .then((res) => res.data);
};

/**
 * @function createClassroom
 * @description Client action to create a new classroom.
 */
export const createClassroom = (data: TClassroomInsert) => {
  return clientApis
    .post<TClassroom, TClassroomInsert>("classrooms", data)
    .then((res) => res.data);
};

/**
 * @function updateClassroom
 * @description Client action to update an existing classroom.
 */
export const updateClassroom = (
  classId: string,
  data: Partial<TClassroomInsert>
) => {
  return clientApis
    .put<
      TClassroom,
      Partial<TClassroomInsert>
    >("classrooms", data, { params: { classId } })
    .then((res) => res.data);
};

/**
 * @function deleteClassroom
 * @description Client action to delete a classroom.
 */
export const deleteClassroom = (classId: string) => {
  return clientApis
    .delete<{ message: string }>("classrooms", {
      params: { classId },
    })
    .then((res) => res.data);
};
