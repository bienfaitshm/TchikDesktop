import { useMutation, useQuery } from "@tanstack/react-query";
import { users } from "@/renderer/libs/apis";
import type {
  UserCreate,
  UserUpdate,
  UserFilter,
} from "@/packages/@core/data-access/schema-validations";

import { TQueryUpdate } from "./type";

export function useGetUsers(params?: UserFilter) {
  return useQuery({
    queryKey: ["GET_USERS", params],
    queryFn: () => users.fetchUsers(params),
  });
}

export function useGetSearchUsers(search: {
  name?: string;
  yearId?: string;
  schoolId: string;
}) {
  return useQuery({
    queryKey: ["GET_SEARCH_USERS", search],
    queryFn: () => users.searchUser(search),
    enabled: Boolean(search.name?.trim()),
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
