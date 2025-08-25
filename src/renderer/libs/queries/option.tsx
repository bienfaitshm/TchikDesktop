import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import type {
    TOption,
    TOptionInsert,
} from "@/commons/types/services";
import type { TQueryUpdate } from "./type";
import * as apis from "@/renderer/libs/apis/option";


/**
 * @function useGetOptions
 * @description Hook to fetch all options for a given school.
 */
export function useGetOptions(schoolId: string) {
    return useSuspenseQuery<TOption[], Error>({
        queryKey: ["GET_OPTIONS", schoolId],
        queryFn: () => apis.getOptions(schoolId),
    });
}

/**
 * @function useCreateOption
 * @description Hook to create a new option.
 */
export function useCreateOption() {
    return useMutation<TOption, Error, TOptionInsert>({
        mutationKey: ["CREATE_OPTION"],
        mutationFn: (data) => apis.createOption(data),
    });
}

/**
 * @function useUpdateOption
 * @description Hook to update an existing option.
 */
export function useUpdateOption() {
    return useMutation<
        TOption,
        Error,
        TQueryUpdate<TOptionInsert>
    >({
        mutationKey: ["UPDATE_OPTION"],
        mutationFn: ({ data, id }) =>
            apis.updateOption(id, data),
    });
}

/**
 * @function useDeleteOption
 * @description Hook to delete an option.
 */
export function useDeleteOption() {
    return useMutation<any, Error, string>({
        mutationKey: ["DELETE_OPTION"],
        mutationFn: (optionId) =>
            apis.deleteOption(optionId),
    });
}