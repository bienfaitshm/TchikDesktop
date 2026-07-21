import { useCallback } from "react";
import type {
  Localroom,
  LocalroomCreate,
  LocalroomUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import {
  useCreateLocalRoom,
  useDeleteLocalRoom,
  useUpdateLocalRoom,
} from "./seating";

export type LocalRoomFormData = LocalroomCreate;
export type LocalRoomFormConfig = BaseMutationConfig<Localroom>;

export interface UpdateLocalRoomConfig extends BaseMutationConfig<LocalroomUpdate> {
  localroomId?: string;
}

const CREATE_LOCAL_ROOM_NOTIFICATIONS = {
  success: {
    title: "Local créé !",
    description: "Le local a été ajouté avec succès.",
  },
  error: {
    title: "Échec de la création du local.",
  },
};

const UPDATE_LOCAL_ROOM_NOTIFICATIONS = {
  success: {
    title: "Local mis à jour !",
    description: "Les modifications du local ont été enregistrées.",
  },
  error: {
    title: "Échec de la mise à jour.",
  },
};

/**
 * Builds notification configurations for local room deletions.
 * @param roomName - Optional name of the room being removed.
 * @returns Notification configuration object.
 */
const getDeleteLocalRoomNotifications = (roomName?: string) => ({
  success: {
    title: "Local supprimé",
    description: roomName
      ? `Le local '${roomName}' a été retiré de la liste.`
      : "Le local a été supprimé avec succès.",
  },
  error: {
    title: "Erreur de suppression",
  },
});

/**
 * Custom form hook for creating physical local room entities.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state, submit handler, and pending status.
 */
export function useCreateLocalRoomForm(config?: LocalRoomFormConfig) {
  const mutation = useCreateLocalRoom();

  const adaptData = useCallback((data: LocalroomCreate) => data, []);

  return useFormBaseNotify<LocalroomCreate, LocalroomCreate, Localroom>({
    mutation,
    config,
    getNotifications: () => CREATE_LOCAL_ROOM_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom form hook for updating existing physical local room entities.
 * @param params - Combined configuration parameters containing optional localroomId.
 * @returns Form state, submit handler, and pending status.
 */
export function useUpdateLocalRoomForm({
  localroomId,
  ...config
}: UpdateLocalRoomConfig = {}) {
  const mutation = useUpdateLocalRoom();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<LocalroomUpdate>) => ({
      data,
      id: id ?? localroomId ?? "",
    }),
    [localroomId],
  );

  return useFormBaseNotify<
    QueryUpdatePayload<LocalroomUpdate>,
    { data: LocalroomUpdate; id: string },
    LocalroomUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_LOCAL_ROOM_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom hook managing physical local room deletion actions and pending state.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing the delete callback and pending state.
 */
export function useDeleteLocalRoomForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteLocalRoom();

  const deleteLocalRoom = useCallback(
    async (localroomId: string, roomName?: string) => {
      return mutation.mutateAsync(
        localroomId,
        withNotifications({
          notifications: getDeleteLocalRoomNotifications(roomName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteLocalRoom,
    isDeleting: mutation.isPending,
    onDelete: deleteLocalRoom,
  };
}
