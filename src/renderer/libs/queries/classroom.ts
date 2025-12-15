import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { classroom } from "@/renderer/libs/apis";

export const GET_CLASSROOMS_KEY = "GET_CLASSROOMS";

/**
 * @function useGetClassrooms
 * @description Hook to fetch all classrooms for a given school, optionally filtered by year.
 */
export function useGetClassrooms(params: any) {
  return useSuspenseQuery({
    queryKey: [GET_CLASSROOMS_KEY, params],
    queryFn: () => classroom.fetchClassrooms(params),
  });
}

export function useGetClassroomById(classroomId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_CLASSROOM_BY_ID", classroomId],
    queryFn: () => classroom.fetchClassroomById(classroomId),
  });
}

/**
 * @function useCreateClassroom
 * @description Hook to create a new classroom.
 */
export function useCreateClassroom() {
  return useMutation({
    mutationKey: ["CREATE_CLASSROOM"],
    mutationFn: (data: any) => classroom.createClassroom(data),
  });
}

/**
 * @function useUpdateClassroom
 * @description Hook to update an existing classroom.
 */
export function useUpdateClassroom() {
  return useMutation({
    mutationKey: ["UPDATE_CLASSROOM"],
    mutationFn: ({ data, id }: any) => classroom.updateClassroom(id, data),
  });
}

/**
 * @function useDeleteClassroom
 * @description Hook to delete a classroom.
 */
export function useDeleteClassroom() {
  return useMutation<any, Error, string>({
    mutationKey: ["DELETE_CLASSROOM"],
    mutationFn: (classId) => classroom.deleteClassroom(classId),
  });
}
