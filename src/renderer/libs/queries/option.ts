import { useMutation, useSuspenseQuery } from "./base-query";
import { option } from "@/renderer/libs/apis";
import type {
  TOptionFilter,
  TOptionUpdate,
  TOptionCreate,
} from "@/packages/@core/data-access/schema-validations";
import { TQueryUpdate } from "./type";

export const optionKeys = {
  all: ["options"] as const,
  lists: (params?: TOptionFilter) =>
    [...optionKeys.all, "list", { params }] as const,
  details: () => [...optionKeys.all, "detail"] as const,
  detail: (id: string) => [...optionKeys.details(), id] as const,
};

/**
 * @function useGetOptions
 * @description Hook to fetch all options
 */
export function useGetOptions(params?: TOptionFilter) {
  return useSuspenseQuery({
    queryKey: optionKeys.lists(params),
    queryFn: () => option.fetchOptions(params),
  });
}

/**
 * @function useGetOptionById
 * @description Hook to fetch one option for a given id
 */
export function useGetOptionById(optionId: string) {
  return useSuspenseQuery({
    queryKey: optionKeys.detail(optionId),
    queryFn: () => option.fetchOptionById(optionId),
  });
}

/**
 * @function useCreateOption
 * @description Hook to create a new option.
 */
export function useCreateOption() {
  return useMutation({
    mutationKey: [...optionKeys.all, "create"],
    mutationFn: (data: TOptionCreate) => option.createOption(data),
  });
}

/**
 * @function useUpdateOption
 * @description Hook to update an existing option.
 */
export function useUpdateOption() {
  return useMutation({
    mutationKey: [...optionKeys.all, "update"],
    mutationFn: ({ data, id }: TQueryUpdate<TOptionUpdate>) =>
      option.updateOption(id, data),
  });
}

/**
 * @function useDeleteOption
 * @description Hook to delete an option.
 */
export function useDeleteOption() {
  return useMutation({
    mutationKey: [...optionKeys.all, "delete"],
    mutationFn: (optionId: string) => option.deleteOption(optionId),
  });
}
