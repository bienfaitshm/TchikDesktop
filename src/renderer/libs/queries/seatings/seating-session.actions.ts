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
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
  useFormBaseNotify,
} from "../base";

export type SeatingSessionData = z.infer<typeof SeatingSessionCreateSchema>;
export type SeatingSessionFormConfig = BaseMutationConfig<SeatingSessionData>;

export interface UpdateSeatingSessionConfig extends BaseMutationConfig<
  Partial<SeatingSessionData>
> {
  sessionId?: string;
}

const CREATE_SEATING_SESSION_NOTIFICATIONS = {
  success: {
    title: "Session créée !",
    description: "La session est maintenant disponible.",
  },
  error: {
    title: "Erreur lors de la création",
  },
};

const UPDATE_SEATING_SESSION_NOTIFICATIONS = {
  success: {
    title: "Mise à jour réussie",
    description: "Les changements ont été enregistrés.",
  },
  error: {
    title: "Échec de la mise à jour.",
  },
};

/**
 * Builds notification configurations for seating session deletions.
 * @param name - Optional name of the session being removed.
 * @returns Notification configuration object.
 */
const getDeleteSeatingSessionNotifications = (name?: string) => ({
  success: {
    title: "Session supprimée",
    description: name
      ? `"${name}" a été retirée.`
      : "La session a été supprimée.",
  },
  error: {
    title: "Erreur de suppression",
  },
});

/**
 * Form hook managing seating session creation operations.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state, submission handlers, and pending status.
 */
export function useCreateSeatingSessionForm(config?: SeatingSessionFormConfig) {
  const mutation = useCreateSeatingSession();

  const adaptData = useCallback((data: SeatingSessionData) => data, []);

  return useFormBaseNotify<
    SeatingSessionData,
    SeatingSessionData,
    SeatingSessionData
  >({
    mutation,
    config,
    getNotifications: () => CREATE_SEATING_SESSION_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Form hook managing seating session update operations.
 * @param params - Combined configuration parameters containing optional sessionId.
 * @returns Form state, submission handlers, and pending status.
 */
export function useUpdateSeatingSessionForm({
  sessionId,
  ...config
}: UpdateSeatingSessionConfig = {}) {
  const mutation = useUpdateSeatingSession();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<Partial<SeatingSessionData>>) => ({
      data,
      id: id ?? sessionId ?? "",
    }),
    [sessionId],
  );

  return useFormBaseNotify<
    QueryUpdatePayload<Partial<SeatingSessionData>>,
    { data: Partial<SeatingSessionData>; id: string },
    Partial<SeatingSessionData>
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_SEATING_SESSION_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Hook for executing seating session deletion operations.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing the delete callback and pending state.
 */
export function useDeleteSeatingSessionForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteSeatingSession();

  const deleteSeatingSession = useCallback(
    async (id: string, name?: string) => {
      return mutation.mutateAsync(
        id,
        withNotifications({
          notifications: getDeleteSeatingSessionNotifications(name),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteSeatingSession,
    isDeleting: mutation.isPending,
    onDelete: deleteSeatingSession,
  };
}
