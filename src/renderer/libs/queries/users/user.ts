import type { SearchUserQueryParams } from "@/packages/@core/apis/clients";
import type {
  UseQueryOptions,
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

import { useQuery } from "@tanstack/react-query";
import { users as usersApi } from "@/renderer/libs/apis";
import type {
  User,
  UserCreate,
  UserUpdate,
  UserFilter,
} from "@/packages/@core/data-access/schema-validations";

import { useMutation, useSuspenseQuery } from "../base";
import type { QueryUpdatePayload } from "../base";

/**
 * 1. Query Key Factory (Unique source de vérité pour le cache des utilisateurs)
 */
export const userKeys = {
  all: ["users"] as const,
  lists: (params?: UserFilter) =>
    [...userKeys.all, "list", { params }] as const,
  options: (params?: SearchUserQueryParams) =>
    [...userKeys.all, "options", { params }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  mutations: {
    create: () => [...userKeys.all, "create"] as const,
    update: () => [...userKeys.all, "update"] as const,
    delete: () => [...userKeys.all, "delete"] as const,
  },
} as const;

/**
 * 2. Hooks de Lecture (Queries)
 */

export function useGetUsers(
  params?: UserFilter,
  options?: Partial<UseSuspenseQueryOptions<User[]>>,
) {
  return useSuspenseQuery({
    queryKey: userKeys.lists(params),
    queryFn: () => usersApi.fetchUsers(params),
    ...options,
  });
}

/**
 * Pour la recherche ou les selects asynchrones, on préfère souvent `useQuery` standard
 * à `useSuspenseQuery` pour éviter de faire sauter l'UI (via Suspense) à chaque lettre tapée.
 */
export function useGetUsersAsOptions(
  params?: SearchUserQueryParams,
  options?: Partial<UseQueryOptions<any[]>>,
) {
  return useQuery({
    queryKey: userKeys.options(params),
    queryFn: () => usersApi.fetchUserAsOptions(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

/**
 * 3. Hooks d'Écriture (Mutations)
 */

export function useCreateUser(
  options?: Partial<UseMutationOptions<User, Error, UserCreate>>,
) {
  return useMutation({
    mutationKey: userKeys.mutations.create(),
    mutationFn: (data: UserCreate) => usersApi.createUser(data),
    ...options,
  });
}

export function useUpdateUser(
  options?: Partial<
    UseMutationOptions<User, Error, QueryUpdatePayload<UserUpdate>>
  >,
) {
  return useMutation({
    mutationKey: userKeys.mutations.update(),
    mutationFn: ({ id, data }: QueryUpdatePayload<UserUpdate>) =>
      usersApi.updateUser(id, data),
    ...options,
  });
}

export function useDeleteUser(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: userKeys.mutations.delete(),
    mutationFn: (userId: string) => usersApi.deleteUser(userId),
    ...options,
  });
}
