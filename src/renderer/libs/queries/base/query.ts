import {
  useMutation as useMutationTQ,
  useSuspenseQuery as useSuspenseQueryTQ,
  UseSuspenseQueryOptions,
  UseMutationOptions,
  UseMutationResult,
  QueryClient,
  DefaultError,
  MutationKey,
} from "@tanstack/react-query";

/**
 * useMutation Wrapper
 * Ajoute la mutationKey au résultat pour faciliter le tracking ou l'invalidation
 * dans les composants parents.
 */
export function useMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  queryClient?: QueryClient,
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> & {
  mutationKey: MutationKey | undefined;
} {
  const mutationKey = options.mutationKey;

  const mutation = useMutationTQ(options, queryClient);

  return {
    ...mutation,
    mutationKey,
  };
}

/**
 * useSuspenseQuery Wrapper
 * Retourne le résultat de la requête ainsi que la queryKey utilisée.
 * Utile pour l'invalidation manuelle ou le préchargement.
 */
export function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
>(
  options: UseSuspenseQueryOptions<TQueryFnData, TError, TData>,
  queryClient?: QueryClient,
) {
  const queryKey = options.queryKey;
  const query = useSuspenseQueryTQ(options, queryClient);

  return {
    ...query,
    queryKey,
  };
}
