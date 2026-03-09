import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { option } from "@/renderer/libs/apis";
import {
  TOptionFilter,
  TOptionUpdate,
  TOptionCreate,
} from "@/packages/@core/data-access/schema-validations";
import { TQueryUpdate } from "./type";

/**
 * @function useGetOptions
 * @description Hook to fetch all options
 */
export function useGetOptions(params?: TOptionFilter) {
  return useSuspenseQuery({
    queryKey: ["GET_OPTIONS", params],
    queryFn: () => option.fetchOptions(params),
  });
}

/**
 * @function useGetOptions
 * @description Hook to fetch one option for a given id
 */
export function useGetOptionById(optionId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_OPTIONS", optionId],
    queryFn: () => option.fetchOptionById(optionId),
  });
}
/**
 * @function useCreateOption
 * @description Hook to create a new option.
 */
export function useCreateOption() {
  return useMutation({
    mutationKey: ["CREATE_OPTION"],
    mutationFn: (data: TOptionCreate) => option.createOption(data),
  });
}

/**
 * @function useUpdateOption
 * @description Hook to update an existing option.
 */
export function useUpdateOption() {
  return useMutation({
    mutationKey: ["UPDATE_OPTION"],
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
    mutationKey: ["DELETE_OPTION"],
    mutationFn: (optionId: string) => option.deleteOption(optionId),
  });
}
