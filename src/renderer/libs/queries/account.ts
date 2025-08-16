import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/renderer/libs/apis/account";
import {
  QueryParams,
  TUserInsert,
  WithSchoolAndYearId,
} from "@/commons/types/services";

export function useGetUsers(
  params?: QueryParams<
    WithSchoolAndYearId,
    Partial<TUserInsert & { classroomId: string }>
  >
) {
  return useQuery({
    queryKey: ["GET_USERS", params],
    queryFn: () => getUsers(params),
  });
}

export function useCreateUser() {
  return useMutation({
    mutationKey: ["CREATE_USER"],
    mutationFn: (data: TUserInsert) => createUser(data),
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationKey: ["UPDATE_USER"],
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<TUserInsert>;
    }) => updateUser(userId, data),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationKey: ["DELETE_USER"],
    mutationFn: (userId: string) => deleteUser(userId),
  });
}
