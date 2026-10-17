import type { MutateOptions } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Immutable default configuration messages for mutation notifications.
 */
export const DEFAULT_MUTATION_MESSAGES = {
  successTitle: "Operation successful!",
  successDescription: "The operation was completed successfully.",
  errorTitle: "An error occurred.",
  errorDescription:
    "Please try again later. If the problem persists, contact support.",
} as const;

/**
 * Configuration options for mutation toast notifications.
 */
export interface NotificationOptions {
  showErrorNotification?: boolean;
  showSuccessNotification?: boolean;
  successMessageTitle?: string;
  successMessageDescription?: string;
  errorMessageTitle?: string;
  errorMessageDescription?: string;
}

/**
 * Combined type of TanStack Query mutate options and notification configuration options.
 */
export type MutationOptionsWithNotifications<
  TData,
  TError,
  TVariables,
  TContext,
> = MutateOptions<TData, TError, TVariables, TContext> & NotificationOptions;

/**
 * Higher-order utility function to inject toast notifications into TanStack Query mutation callbacks.
 * @param options - Combination of TanStack Query options and notification configurations.
 * @returns Enhanced mutation options with integrated success and error notifications.
 */
export function withNotifications<TData, TError, TVariables, TContext>(
  options: Partial<
    MutationOptionsWithNotifications<TData, TError, TVariables, TContext>
  > = {},
): MutateOptions<TData, TError, TVariables, TContext> {
  const {
    showErrorNotification = true,
    showSuccessNotification = true,
    successMessageTitle,
    successMessageDescription,
    errorMessageTitle,
    errorMessageDescription,
    onSuccess,
    onError,
    onSettled,
    ...restOptions
  } = options;

  return {
    ...restOptions,

    onSuccess: (data, variables, onMutateResult, context) => {
      if (showSuccessNotification) {
        toast.success(
          successMessageTitle ?? DEFAULT_MUTATION_MESSAGES.successTitle,
          {
            description:
              successMessageDescription ??
              DEFAULT_MUTATION_MESSAGES.successDescription,
          },
        );
      }
      onSuccess?.(data, variables, onMutateResult, context);
    },

    onError: (error, variables, onMutateResult, context) => {
      if (showErrorNotification) {
        const extractedMsg =
          error instanceof Error ? error.message : String(error);

        toast.error(errorMessageTitle ?? DEFAULT_MUTATION_MESSAGES.errorTitle, {
          description:
            errorMessageDescription ??
            extractedMsg ??
            DEFAULT_MUTATION_MESSAGES.errorDescription,
        });
      }
      onError?.(error, variables, onMutateResult, context);
    },

    onSettled: (data, error, variables, onMutateResult, context) => {
      onSettled?.(data, error, variables, onMutateResult, context);
    },
  };
}

/**
 *
 * @param param0
 * @returns
 * @deprecated withNotifications
 */
export function createMutationCallbacksWithNotifications<
  TData,
  TError,
  TVariables,
  TContext,
>(
  options: MutationOptionsWithNotifications<
    TData,
    TError,
    TVariables,
    TContext
  >,
): Partial<MutateOptions<TData, TError, TVariables, TContext>> {
  return withNotifications(options);
}
