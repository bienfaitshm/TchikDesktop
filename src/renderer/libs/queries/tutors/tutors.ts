import type { TutorQueryParams } from "@/packages/@core/apis/clients";
import type {
  UseQueryOptions,
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { tutors as TutorsApi } from "@/renderer/libs/apis";
import type {
  TutorCreate,
  TutorUpdate,
  TutorFilter,
} from "@/packages/@core/data-access/schema-validations";
import type { TutorDTO } from "@/packages/@core/data-access/db";

import { useMutation, useSuspenseQuery } from "../base";
import type { QueryUpdatePayload } from "../base";

/**
 * 1. Query Key Factory (Unique source de vérité pour le cache des utilisateurs)
 */
export const TutorKeys = {
  all: ["tutors"] as const,
  lists: (params?: TutorFilter) =>
    [...TutorKeys.all, "list", { params }] as const,
  options: (params?: TutorQueryParams) =>
    [...TutorKeys.all, "options", { params }] as const,
  details: () => [...TutorKeys.all, "detail"] as const,
  detail: (id: string) => [...TutorKeys.details(), id] as const,
  mutations: {
    create: () => [...TutorKeys.all, "create"] as const,
    update: () => [...TutorKeys.all, "update"] as const,
    delete: () => [...TutorKeys.all, "delete"] as const,
  },
} as const;

/**
 * 2. Hooks de Lecture (Queries)
 */

export function useGetTutors(
  params?: TutorFilter,
  options?: Partial<UseSuspenseQueryOptions<TutorDTO[]>>,
) {
  return useSuspenseQuery({
    queryKey: TutorKeys.lists(params),
    queryFn: () => TutorsApi.fetchTutors(params),
    ...options,
  });
}

/**
 * Pour la recherche ou les selects asynchrones, on préfère souvent `useQuery` standard
 * à `useSuspenseQuery` pour éviter de faire sauter l'UI (via Suspense) à chaque lettre tapée.
 */
export function useGetTutorsAsOptions(
  params?: TutorQueryParams,
  options?: Partial<UseQueryOptions<any[]>>,
) {
  return useQuery({
    queryKey: TutorKeys.options(params),
    queryFn: () => TutorsApi.fetchTutorAsOptions(params),
    placeholderData: (previousData) => previousData,
    ...options,
  });
}

/**
 * 3. Hooks d'Écriture (Mutations)
 */

export function useCreateTutor(
  options?: Partial<UseMutationOptions<TutorDTO, Error, TutorCreate>>,
) {
  return useMutation({
    mutationKey: TutorKeys.mutations.create(),
    mutationFn: (data: TutorCreate) => TutorsApi.createTutor(data),
    ...options,
  });
}

export function useUpdateTutor(
  options?: Partial<
    UseMutationOptions<TutorDTO, Error, QueryUpdatePayload<TutorUpdate>>
  >,
) {
  return useMutation({
    mutationKey: TutorKeys.mutations.update(),
    mutationFn: ({ id, data }: QueryUpdatePayload<TutorUpdate>) =>
      TutorsApi.updateTutor(id, data),
    ...options,
  });
}

export function useDeleteTutor(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: TutorKeys.mutations.delete(),
    mutationFn: (TutorId: string) => TutorsApi.deleteTutor(TutorId),
    ...options,
  });
}
