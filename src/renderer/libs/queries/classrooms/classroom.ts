import { useMutation, useSuspenseQuery } from "../base";
import { classroom as classroomApi } from "@/renderer/libs/apis";
import type {
  Classroom,
  ClassroomCreate,
  ClassroomFilter,
  ClassroomUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { TQueryUpdate } from "../type";
import type { SearchClassroomQueryParams } from "@/packages/@core/apis/clients";
import type {
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import type {
  ClassroomDTO,
  SelectOption,
} from "@/packages/@core/data-access/db/queries";

/**
 * 1. Query Key Factory (Immuable et centralisée)
 */
export const classroomKeys = {
  all: ["classrooms"] as const,
  lists: (params?: ClassroomFilter) =>
    [...classroomKeys.all, "list", { params }] as const,
  options: (params?: SearchClassroomQueryParams) =>
    [...classroomKeys.all, "options", { params }] as const,
  details: () => [...classroomKeys.all, "detail"] as const,
  detail: (id: string) => [...classroomKeys.details(), id] as const,
  mutations: {
    create: () => [...classroomKeys.all, "create"] as const,
    update: () => [...classroomKeys.all, "update"] as const,
    delete: () => [...classroomKeys.all, "delete"] as const,
  },
} as const;

/**
 * 2. Hooks de Lecture (Queries)
 */

export function useGetClassrooms(
  params?: ClassroomFilter,
  options?: Partial<UseSuspenseQueryOptions<ClassroomDTO[]>>,
) {
  return useSuspenseQuery({
    queryKey: classroomKeys.lists(params),
    queryFn: () => classroomApi.fetchClassrooms(params),
    ...options,
  });
}

export function useGetClassroomAsOptions(
  params?: SearchClassroomQueryParams,
  options?: Partial<UseSuspenseQueryOptions<(SelectOption & ClassroomDTO)[]>>,
) {
  return useSuspenseQuery({
    queryKey: classroomKeys.options(params),
    queryFn: () => classroomApi.fetchClassroomAsOptions(params),
    ...options,
  });
}

export function useGetClassroomById(
  classroomId: string,
  options?: Partial<UseSuspenseQueryOptions<Classroom>>,
) {
  return useSuspenseQuery({
    queryKey: classroomKeys.detail(classroomId),
    queryFn: () => classroomApi.fetchClassroomById(classroomId),
    ...options,
  });
}

/**
 * 3. Hooks d'Écriture (Mutations)
 */

export function useCreateClassroom(
  options?: Partial<UseMutationOptions<Classroom, Error, ClassroomCreate>>,
) {
  return useMutation({
    mutationKey: classroomKeys.mutations.create(),
    mutationFn: (data: ClassroomCreate) => classroomApi.createClassroom(data),
    ...options,
  });
}

export function useUpdateClassroom(
  options?: Partial<
    UseMutationOptions<Classroom, Error, TQueryUpdate<ClassroomUpdate>>
  >,
) {
  return useMutation({
    mutationKey: classroomKeys.mutations.update(),
    mutationFn: ({ data, id }: TQueryUpdate<ClassroomUpdate>) =>
      classroomApi.updateClassroom(id, data),
    ...options,
  });
}

export function useDeleteClassroom(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: classroomKeys.mutations.delete(),
    mutationFn: (classId: string) => classroomApi.deleteClassroom(classId),
    ...options,
  });
}
