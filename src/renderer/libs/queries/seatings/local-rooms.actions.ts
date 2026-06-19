import { useCallback } from "react";
import {
  useCreateLocalRoom,
  useUpdateLocalRoom,
  useDeleteLocalRoom,
} from "./seating";
import type {
  Localroom,
  LocalroomCreate,
  LocalroomUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  type BaseFormProps,
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
} from "../base";

export type LocalRoomFormData = LocalroomCreate;
export type LocalRoomFormConfig = BaseMutationConfig<Localroom>;

/**
 * Hook pour la CRÉATION d'une salle physique (local).
 */
export function useCreateLocalRoomForm(config?: LocalRoomFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useCreateLocalRoom();

  const onSubmit: BaseFormProps<LocalroomCreate>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Local créé !",
              description: `Le local '${data.name}' a été ajouté avec succès.`,
            },
            error: {
              title: "Échec de la création du local.",
            },
          },
          onSuccess: (res) => {
            notifyAndInvalidate(res);
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

interface UpdateLocalRoomConfig extends BaseMutationConfig<Localroom> {
  localroomId: string;
}

/**
 * Hook pour la MISE À JOUR d'une salle physique (local).
 */
export function useUpdateLocalRoomForm({
  localroomId,
  ...config
}: UpdateLocalRoomConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useUpdateLocalRoom();

  const onSubmit: BaseFormProps<
    QueryUpdatePayload<LocalroomUpdate>
  >["onSubmit"] = useCallback(
    ({ data, id }, helpers) => {
      mutation.mutate(
        { data, id: id ?? localroomId },
        withNotifications({
          notifications: {
            success: {
              title: "Local mis à jour !",
              description: `Les modifications du local '${data.name || "sélectionné"}' ont été enregistrées.`,
            },
            error: {
              title: "Échec de la mise à jour.",
            },
          },
          onSuccess: (res) => {
            notifyAndInvalidate(res);
            helpers.reset();
          },
        }),
      );
    },
    [localroomId, mutation, notifyAndInvalidate],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
  };
}

/**
 * Hook pour la SUPPRESSION d'une salle physique (local).
 */
export function useDeleteLocalRoomForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteLocalRoom();

  const deleteLocalRoom = useCallback(
    async (localroomId: string, roomName?: string) => {
      return mutation.mutateAsync(
        localroomId,
        withNotifications({
          notifications: {
            success: {
              title: "Local supprimé",
              description: roomName
                ? `Le local '${roomName}' a été retiré de la liste.`
                : "Le local a été supprimé avec succès.",
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
    deleteLocalRoom,
    isDeleting: mutation.isPending,
  };
}
