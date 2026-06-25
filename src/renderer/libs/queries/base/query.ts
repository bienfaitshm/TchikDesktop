import { useMemo } from "react";
import {
  useMutation as useMutationTQ,
  useSuspenseQuery as useSuspenseQueryTQ,
  type UseSuspenseQueryOptions,
  type UseMutationOptions,
  type UseMutationResult,
  type QueryClient,
  type DefaultError,
  type MutationKey,
  type QueryKey,
  type UseSuspenseQueryResult,
} from "@tanstack/react-query";

/**
 * useMutation Wrapper
 * Enrichit le résultat de la mutation avec sa mutationKey de manière performante.
 */
export function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TContext> & {
  readonly mutationKey: MutationKey | undefined;
} {
  const mutationResult = useMutationTQ(options, queryClient);
  const mutationKey = options.mutationKey;

  return useMemo(
    () => ({
      ...mutationResult,
      mutationKey,
    }),
    [mutationResult, mutationKey],
  );
}

/**
 * useSuspenseQuery Wrapper
 * Retourne le résultat de la requête ainsi que la queryKey de manière stable.
 */
export function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
>(
  options: UseSuspenseQueryOptions<TQueryFnData, TError, TData>,
  queryClient?: QueryClient,
): UseSuspenseQueryResult<TData, TError> & {
  readonly queryKey: QueryKey;
} {
  const queryResult = useSuspenseQueryTQ(options, queryClient);
  const queryKey = options.queryKey;

  return useMemo(
    () => ({
      ...queryResult,
      queryKey,
    }),
    [queryResult, queryKey],
  );
}
