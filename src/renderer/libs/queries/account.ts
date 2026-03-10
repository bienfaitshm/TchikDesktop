import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/renderer/libs/apis";

import { TQueryUpdate } from "./type";

export function useGetUsers(
  params?: QueryParams<
    WithSchoolAndYearId,
    Partial<TUserInsert & { classroomId: string }>
  >,
) {
  return useQuery({
    queryKey: ["GET_USERS", params],
    queryFn: () => getUsers(params),
  });
}

export function useCreateUser() {
  return useMutation<TUser, Error, TUserInsert>({
    mutationKey: ["CREATE_USER"],
    mutationFn: (data) => createUser(data),
  });
}

export function useUpdateUser() {
  return useMutation<TUser, Error, TQueryUpdate<TUserInsert>>({
    mutationKey: ["UPDATE_USER"],
    mutationFn: ({ id, data }) => updateUser(id, data),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationKey: ["DELETE_USER"],
    mutationFn: (userId: string) => deleteUser(userId),
  });
}
