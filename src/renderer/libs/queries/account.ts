import { useMutation, useQuery } from "@tanstack/react-query";
import { users } from "@/renderer/libs/apis";
import type {
  UserCreate,
  UserUpdate,
  UserFilter,
} from "@/packages/@core/data-access/schema-validations";

import { TQueryUpdate } from "./type";
import type { SearchUserQueryParams } from "@/packages/@core/apis/clients";

export function useGetUsers(params?: UserFilter) {
  return useQuery({
    queryKey: ["GET_USERS", params],
    queryFn: () => users.fetchUsers(params),
  });
}

export function useGetUsersAsOption(params?: SearchUserQueryParams) {
  return useQuery({
    queryKey: ["GET_SEARCH_USERS", params],
    queryFn: () => users.fetchAsOptions(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateUser() {
  return useMutation({
    mutationKey: ["CREATE_USER"],
    mutationFn: (data: UserCreate) => users.createUser(data),
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationKey: ["UPDATE_USER"],
    mutationFn: ({ id, data }: TQueryUpdate<UserUpdate>) =>
      users.updateUser(id, data),
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationKey: ["DELETE_USER"],
    mutationFn: (userId: string) => users.deleteUser(userId),
  });
}
