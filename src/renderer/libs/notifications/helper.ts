import type { MutateOptions } from "@tanstack/react-query";
import type {
  MutateOptionsWithNotifications,
  NotificationMessages,
} from "./types";

const DEFAULT_MESSAGES = {
  success: {
    title: "Opération réussie !",
    description: "L'opération a été effectuée avec succès.",
  },
  error: {
    title: "Une erreur est survenue.",
    description: "Veuillez réessayer ultérieurement.",
  },
} as const;

/**
 * Extrait proprement le message d'une erreur inconnue
 */
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return DEFAULT_MESSAGES.error.description;
};

/**
 * Créateur de décorateur de mutation (Open/Closed Principle)
 * Permet de lier n'importe quelle librairie de Toast à TanStack Query.
 */
export function createMutationNotifier(notifier: {
  success: (msg: NotificationMessages) => void;
  error: (msg: NotificationMessages) => void;
}) {
  return function useMutationWithNotifications<
    TData,
    TError,
    TVariables,
    TContext,
  >(
    options: MutateOptionsWithNotifications<
      TData,
      TError,
      TVariables,
      TContext
    > = {},
  ): MutateOptions<TData, TError, TVariables, TContext> {
    const { notifications, onSuccess, onError, onSettled, ...tanstackOptions } =
      options;

    return {
      ...tanstackOptions,

      onSuccess: (data, variables, onMutateResult, context) => {
        const config = notifications?.success;

        if (config?.enabled !== false) {
          notifier.success({
            title: config?.title ?? DEFAULT_MESSAGES.success.title,
            description:
              config?.description ?? DEFAULT_MESSAGES.success.description,
          });
        }
        onSuccess?.(data, variables, onMutateResult, context);
      },

      onError: (error, variables, onMutateResult, context) => {
        const config = notifications?.error;

        if (config?.enabled !== false) {
          const fallbackDescription = config?.formatError
            ? config.formatError(error)
            : extractErrorMessage(error);

          notifier.error({
            title: config?.title ?? DEFAULT_MESSAGES.error.title,
            description: config?.description ?? fallbackDescription,
          });
        }
        onError?.(error, variables, onMutateResult, context);
      },

      onSettled: (data, error, variables, onMutateResult, context) => {
        onSettled?.(data, error, variables, onMutateResult, context);
      },
    };
  };
}
