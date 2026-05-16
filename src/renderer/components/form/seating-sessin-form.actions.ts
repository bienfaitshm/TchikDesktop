import { useCallback } from "react";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import {
  useCreateSeatingSession,
  useUpdateSeatingSession,
  useDeleteSeatingSession,
} from "@/renderer/libs/queries/seating";
import { SeatingSessionCreateSchema } from "@/packages/@core/data-access/schema-validations";
import {
  type BaseFormProps,
  type UseFormBaseConfig,
  useFormBase,
} from "./base-form";
import { z } from "zod";

export type SeatingSessionData = z.infer<typeof SeatingSessionCreateSchema>;
export type SeatingSessionFormConfig = UseFormBaseConfig<SeatingSessionData>;

export function useCreateSeatingSessionForm(config?: SeatingSessionFormConfig) {
  const { formId, handleSuccess } = useFormBase(config);
  const mutation = useCreateSeatingSession();

  const createSeatingSession = useCallback<
    NonNullable<BaseFormProps<SeatingSessionData>["onSubmit"]>
  >(
    (data, helpers) => {
      mutation.mutate(
        data,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Session créée !",
          successMessageDescription: `La session "${data.sessionName}" est maintenant disponible.`,
          errorMessageTitle: "Erreur lors de la création",
          onSuccess: (responseData) => {
            handleSuccess?.(responseData);
            helpers?.reset?.();
          },
        }),
      );
    },
    [mutation, handleSuccess],
  );

  return {
    formId,
    onSubmit: createSeatingSession,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

interface UpdateConfig extends SeatingSessionFormConfig {
  sessionId: string;
}

export function useUpdateSeatingSessionForm({
  sessionId,
  ...config
}: UpdateConfig) {
  const { formId, handleSuccess } = useFormBase(config);
  const mutation = useUpdateSeatingSession();

  const updateSeatingSession = useCallback<
    NonNullable<BaseFormProps<SeatingSessionData>["onSubmit"]>
  >(
    (data, helpers) => {
      mutation.mutate(
        { id: sessionId, data },
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Mise à jour réussie",
          successMessageDescription: `Les changements sur "${data.sessionName}" ont été enregistrés.`,
          onSuccess: (responseData) => {
            handleSuccess(responseData);
            helpers?.reset?.(responseData);
          },
        }),
      );
    },
    [sessionId, mutation, handleSuccess],
  );

  return {
    formId,
    onSubmit: updateSeatingSession,
    isUpdating: mutation.isPending,
  };
}

export function useDeleteSeatingSessionForm(
  config?: UseFormBaseConfig<string>,
) {
  const { handleSuccess } = useFormBase(config);
  const mutation = useDeleteSeatingSession();

  const deleteSeatingSession = useCallback(
    async (id: string, name?: string) => {
      return mutation.mutateAsync(
        id,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Session supprimée",
          successMessageDescription: name
            ? `"${name}" a été retirée.`
            : "La session a été supprimée.",
          onSuccess: () => handleSuccess(id),
        }),
      );
    },
    [mutation, handleSuccess],
  );

  return {
    deleteSeatingSession,
    isDeleting: mutation.isPending,
  };
}
