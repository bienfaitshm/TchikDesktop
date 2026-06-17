import { useCallback } from "react";
import { z } from "zod";
import {
  useCreateSeatingSession,
  useUpdateSeatingSession,
  useDeleteSeatingSession,
} from "./seating";
import { SeatingSessionCreateSchema } from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  type BaseFormProps,
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
} from "../base";

export type SeatingSessionData = z.infer<typeof SeatingSessionCreateSchema>;
export type SeatingSessionFormConfig = BaseMutationConfig<any>;

/**
 * Hook pour la CRÉATION d'une session de placement.
 */
export function useCreateSeatingSessionForm(config?: SeatingSessionFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useCreateSeatingSession();

  const onSubmit: BaseFormProps<SeatingSessionData>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Session créée !",
              description: `La session "${data.sessionName}" est maintenant disponible.`,
            },
            error: {
              title: "Erreur lors de la création",
            },
          },
          onSuccess: (responseData) => {
            notifyAndInvalidate(responseData);
            helpers.reset();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
  };
}

interface UpdateConfig extends BaseMutationConfig<any> {
  sessionId: string;
}

/**
 * Hook pour la MISE À JOUR d'une session de placement.
 */
export function useUpdateSeatingSessionForm({
  sessionId,
  ...config
}: UpdateConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useUpdateSeatingSession();

  const onSubmit: BaseFormProps<
    QueryUpdatePayload<SeatingSessionData>
  >["onSubmit"] = useCallback(
    ({ data, id }, helpers) => {
      mutation.mutate(
        { id: id ?? sessionId, data },
        withNotifications({
          notifications: {
            success: {
              title: "Mise à jour réussie",
              description: `Les changements sur "${data.sessionName}" ont été enregistrés.`,
            },
            error: {
              title: "Échec de la mise à jour.",
            },
          },
          onSuccess: (responseData) => {
            notifyAndInvalidate(responseData);
            helpers.reset();
          },
        }),
      );
    },
    [sessionId, mutation, notifyAndInvalidate],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
  };
}

/**
 * Hook pour la SUPPRESSION d'une session de placement.
 */
export function useDeleteSeatingSessionForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteSeatingSession();

  const deleteSeatingSession = useCallback(
    async (id: string, name?: string) => {
      return mutation.mutateAsync(
        id,
        withNotifications({
          notifications: {
            success: {
              title: "Session supprimée",
              description: name
                ? `"${name}" a été retirée.`
                : "La session a été supprimée.",
            },
            error: {
              title: "Erreur de suppression",
            },
          },
          onSuccess: () => {
            notifyAndInvalidate(undefined as void);
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteSeatingSession,
    isDeleting: mutation.isPending,
  };
}
