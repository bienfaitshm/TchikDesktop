import {
  TClassroom,
  TClassroomInsert,
  TWithOption,
} from "@/camons/types/services";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import * as apis from "@/renderer/libs/apis/classroom";

export const GET_CLASSROOMS_KEY = "GET_CLASSROOMS";

// --- Classroom Hooks ---

/**
 * @function useGetClassrooms
 * @description Hook to fetch all classrooms for a given school, optionally filtered by year.
 */
export function useGetClassrooms(params: apis.GetClassroomParams) {
  return useSuspenseQuery<TWithOption<TClassroom>[], Error>({
    queryKey: [GET_CLASSROOMS_KEY, params],
    queryFn: () => apis.getClassrooms(params),
  });
}

export function useGetClassroom(classId: string) {
  return useSuspenseQuery<TWithOption<TClassroom>, Error>({
    queryKey: ["GET_CLASSROOM_BY_ID", classId],
    queryFn: () => apis.getClassroom(classId),
  });
}

/**
 * @function useCreateClassroom
 * @description Hook to create a new classroom.
 */
export function useCreateClassroom() {
  return useMutation<TClassroom, Error, TClassroomInsert>({
    mutationKey: ["CREATE_CLASSROOM"],
    mutationFn: (data) => apis.createClassroom(data),
  });
}

/**
 * @function useUpdateClassroom
 * @description Hook to update an existing classroom.
 */
export function useUpdateClassroom() {
  return useMutation<
    TClassroom,
    Error,
    { data: Partial<TClassroom>; classId: string }
  >({
    mutationKey: ["UPDATE_CLASSROOM"],
    mutationFn: ({ data, classId }) => apis.updateClassroom(classId, data),
  });
}

/**
 * @function useDeleteClassroom
 * @description Hook to delete a classroom.
 */
export function useDeleteClassroom() {
  return useMutation<any, Error, { classId: string }>({
    mutationKey: ["DELETE_CLASSROOM"],
    mutationFn: ({ classId }) => apis.deleteClassroom(classId),
  });
}
