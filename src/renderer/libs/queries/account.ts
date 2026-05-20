import { useMutation, useQuery } from "@tanstack/react-query";
import { users } from "@/renderer/libs/apis";
import type {
  TUserCreate,
  TUserUpdate,
  TUserFilter,
} from "@/packages/@core/data-access/schema-validations";

import { TQueryUpdate } from "./type";

export function useGetUsers(params?: TUserFilter) {
  return useQuery({
    queryKey: ["GET_USERS", params],
    queryFn: () => users.fetchUsers(params),
  });
}

export function useCreateUser() {
  return useMutation({
    mutationKey: ["CREATE_USER"],
    mutationFn: (data: TUserCreate) => users.createUser(data),
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationKey: ["UPDATE_USER"],
    mutationFn: ({ id, data }: TQueryUpdate<TUserUpdate>) =>
      users.updateUser(id, data),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationKey: ["DELETE_USER"],
    mutationFn: (userId: string) => users.deleteUser(userId),
  });
}
