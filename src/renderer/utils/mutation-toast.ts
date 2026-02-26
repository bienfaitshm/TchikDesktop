import type { MutateOptions } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * @typedef {Object} StandardNotificationMessages
 * @description Defines the default and customizable messages for success and error notifications.
 * @property {string} successTitle - Default title for a successful operation.
 * @property {string} successDescription - Default description for a successful operation.
 * @property {string} errorTitle - Default title for a failed operation.
 * @property {string} errorDescription - Default description for a failed operation.
 */
interface StandardNotificationMessages {
  successTitle: string;
  successDescription: string;
  errorTitle: string;
  errorDescription: string;
}

/**
 * @constant DEFAULT_MUTATION_MESSAGES
 * @description Standardized default messages for mutation success and error notifications.
 */
const DEFAULT_MUTATION_MESSAGES: StandardNotificationMessages = {
  successTitle: "Opération réussie !",
  successDescription: "L'opération a été effectuée avec succès.",
  errorTitle: "Une erreur est survenue.",
  errorDescription:
    "Veuillez réessayer ultérieurement. Si le problème persiste, contactez le support.",
};

/**
 * @interface MutationNotificationOptions
 * @template TData The type of the data returned by the mutation.
 * @template TError The type of the error thrown by the mutation.
 * @template TVariables The type of the variables passed to the mutation.
 * @template TContext The type of the context object for the mutation.
 *
 * @description Extends `MutateOptions` from `@tanstack/react-query` to add notification control.
 * @property {boolean} [showErrorNotification=true] - Whether to display an error toast notification. Defaults to `true`.
 * @property {boolean} [showSuccessNotification=true] - Whether to display a success toast notification. Defaults to `true`.
 * @property {string} [successMessageTitle] - Custom title for the success notification. Overrides `DEFAULT_MUTATION_MESSAGES.successTitle`.
 * @property {string} [successMessageDescription] - Custom description for the success notification. Overrides `DEFAULT_MUTATION_MESSAGES.successDescription`.
 * @property {string} [errorMessageTitle] - Custom title for the error notification. Overrides `DEFAULT_MUTATION_MESSAGES.errorTitle`.
 * @property {string} [errorMessageDescription] - Custom description for the error notification. Overrides `DEFAULT_MUTATION_MESSAGES.errorDescription`.
 */
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

/**
 * @function createMutationCallbacksWithNotifications
 *
 * @template TData The type of the data returned by the mutation.
 * @template TError The type of the error thrown by the mutation.
 * @template TVariables The type of the variables passed to the mutation.
 * @template TContext The type of the context object for the mutation.
 *
 * @description A utility function that generates `onError`, `onSuccess`, and `onSettled` callbacks
 * for `@tanstack/react-query` mutations, integrating standardized toast notifications.
 * It allows for toggling notifications and customizing messages.
 *
 * @param {MutationNotificationOptions<TData, TError, TVariables, TContext>} options -
 * Configuration options for the mutation callbacks, including notification settings and custom messages.
 * These options will be merged with the default mutation options.
 *
 * @returns {Partial<MutateOptions<TData, TError, TVariables, TContext>>}
 * An object containing the `onError`, `onSuccess`, and `onSettled` callback functions,
 * ready to be spread into a `useMutation` hook.
 *
 * @example
 * ```typescript
 * import { useMutation, useQueryClient } from "@tanstack/react-query";
 * import { createMutationCallbacksWithNotifications } from './path/to/this/file'; // Assuming this file path
 * import { Button } from '@/renderer/components/ui/button'; // Example UI component
 *
 * interface User { id: string; name: string; }
 * type CreateUserVariables = { name: string };
 *
 * // Example mutation function
 * const createUser = async (variables: CreateUserVariables): Promise<User> => {
 * return new Promise((resolve, reject) => {
 * setTimeout(() => {
 * if (Math.random() > 0.3) { // Simulate success 70% of the time
 * resolve({ id: String(Date.now()), name: variables.name });
 * } else {
 * reject(new Error("Failed to create user. Network error."));
 * }
 * }, 1000);
 * });
 * };
 *
 * function UserCreationForm() {
 * const queryClient = useQueryClient();
 *
 * const { mutate, isPending } = useMutation<User, Error, CreateUserVariables>({
 * mutationFn: createUser,
 * ...createMutationCallbacksWithNotifications({
 * // Optional: Custom messages for this specific mutation
 * successMessageTitle: "Utilisateur créé !",
 * successMessageDescription: "Le nouvel utilisateur a été ajouté avec succès.",
 * errorMessageTitle: "Échec de la création d'utilisateur.",
 * // Optional: Original onSuccess/onError callbacks if needed
 * onSuccess: (data) => {
 * console.log("Custom success handler: User created!", data);
 * queryClient.invalidateQueries({ queryKey: ['users'] }); // Invalidate user list
 * },
 * onError: (error) => {
 * console.error("Custom error handler:", error.message);
 * },
 * }),
 * });
 *
 * const handleSubmit = (e: React.FormEvent) => {
 * e.preventDefault();
 * const formData = new FormData(e.currentTarget as HTMLFormElement);
 * const userName = formData.get('userName') as string;
 * if (userName) {
 * mutate({ name: userName });
 * }
 * };
 *
 * return (
 * <form onSubmit={handleSubmit} className="space-y-4">
 * <input
 * name="userName"
 * placeholder="Nom de l'utilisateur"
 * className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
 * />
 * <Button type="submit" disabled={isPending}>
 * {isPending ? "Création en cours..." : "Créer l'utilisateur"}
 * </Button>
 * </form>
 * );
 * }
 * ```
 */
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
          }
        );
      }
    },
  };
}
