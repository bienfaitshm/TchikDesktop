import type { MutateOptions } from "@tanstack/react-query";
import { toast } from "sonner";

interface StandardNotificationMessages {
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
}

const DEFAULT_MUTATION_MESSAGES: StandardNotificationMessages = {
  successTitle: "Opération réussie !",
  successDescription: "L'opération a été effectuée avec succès.",
  errorTitle: "Une erreur est survenue.",
  errorDescription:
    "Veuillez réessayer ultérieurement. Si le problème persiste, contactez le support.",
};

export interface MutationNotificationOptions<
  TData,
  TError,
  TVariables,
  TContext,
> extends Partial<MutateOptions<TData, TError, TVariables, TContext>> {
  showErrorNotification?: boolean;
  showSuccessNotification?: boolean;
  successMessageTitle?: string;
  successMessageDescription?: string;
  errorMessageTitle?: string;
  errorMessageDescription?: string;
}

export function createMutationCallbacksWithNotifications<
  TData,
  TError,
  TVariables,
  TContext,
>({
  showErrorNotification = true,
  showSuccessNotification = true,
  successMessageTitle,
  successMessageDescription,
  errorMessageTitle,
  errorMessageDescription,
  onError,
  onSettled,
  onSuccess,
}: MutationNotificationOptions<TData, TError, TVariables, TContext>): Partial<
  MutateOptions<TData, TError, TVariables, TContext>
> {
  return {
    onError(error, variables, context) {
      onError?.(error, variables, context);

      if (showErrorNotification) {
        const errorDescription =
          ((error as Error)?.message as string) ||
          DEFAULT_MUTATION_MESSAGES.errorDescription;
        toast.error(errorMessageTitle || DEFAULT_MUTATION_MESSAGES.errorTitle, {
          description: errorMessageDescription || errorDescription,
        });
      }
    },
    onSettled(data, error, variables, context) {
      onSettled?.(data, error, variables, context);
    },
    onSuccess(data, variables, context) {
      onSuccess?.(data, variables, context);

      if (showSuccessNotification) {
        toast.success(
          successMessageTitle || DEFAULT_MUTATION_MESSAGES.successTitle,
          {
            description:
              successMessageDescription ||
              DEFAULT_MUTATION_MESSAGES.successDescription,
          },
        );
      }
    },
  };
}

/**
 * Configuration immuable des messages par défaut.
 */
const DEFAULT_MESSAGES = {
  successTitle: "Opération réussie !",
  successDescription: "L'opération a été effectuée avec succès.",
  errorTitle: "Une erreur est survenue.",
  errorDescription:
    "Veuillez réessayer ultérieurement. Si le problème persiste, contactez le support.",
} as const;

export interface NotificationOptions {
  showErrorNotification?: boolean;
  showSuccessNotification?: boolean;
  successMessageTitle?: string;
  successMessageDescription?: string;
  errorMessageTitle?: string;
  errorMessageDescription?: string;
}

/**
 * Union des options de mutation TanStack et de nos options de notification.
 */
export type MutationOptionsWithNotifications<
  TData,
  TError,
  TVariables,
  TContext,
> = MutateOptions<TData, TError, TVariables, TContext> & NotificationOptions;

/**
 * Higher-Order Function pour injecter des notifications Toast dans les callbacks de mutation.
 * @param options - Mélange d'options TanStack Query et de configuration de notification.
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
  } = options;

  return {
    ...options,

    onSuccess: (data, variables, context) => {
      if (showSuccessNotification) {
        toast.success(successMessageTitle ?? DEFAULT_MESSAGES.successTitle, {
          description:
            successMessageDescription ?? DEFAULT_MESSAGES.successDescription,
        });
      }
      onSuccess?.(data, variables, context);
    },

    onError: (error, variables, context) => {
      if (showErrorNotification) {
        const extractedMsg =
          error instanceof Error ? error.message : String(error);

        toast.error(errorMessageTitle ?? DEFAULT_MESSAGES.errorTitle, {
          description:
            errorMessageDescription ??
            extractedMsg ??
            DEFAULT_MESSAGES.errorDescription,
        });
      }
      onError?.(error, variables, context);
    },

    onSettled: (data, error, variables, context) => {
      onSettled?.(data, error, variables, context);
    },
  };
}
