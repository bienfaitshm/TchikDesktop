import { useCallback } from "react";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import {
  useCreateLocalRoom,
  useUpdateLocalRoom,
  useDeleteLocalRoom,
} from "@/renderer/libs/queries/seating";
import type {
  LocalroomCreate as LocalroomFormData,
  LocalroomUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  type BaseFormProps,
  type UseFormBaseConfig,
  useFormBase,
} from "../base-form";

export type LocalRoomFormConfig = UseFormBaseConfig<LocalroomFormData>;

export function useCreateLocalRoomForm(config?: LocalRoomFormConfig) {
  const { formId, handleSuccess } = useFormBase(config);
  const mutation = useCreateLocalRoom();

  const onSubmit = useCallback<
    NonNullable<BaseFormProps<LocalroomFormData>["onSubmit"]>
  >(
    (data, helpers) => {
      mutation.mutate(
        data,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Local créé !",
          successMessageDescription: `Le local '${data.name}' a été ajouté avec succès.`,
          errorMessageTitle: "Échec de la création du local.",
          onSuccess: (responseData) => {
            handleSuccess?.(responseData);
            helpers?.reset?.();
          },
        }),
      );
    },
    [mutation, handleSuccess],
  );

  return { formId, onSubmit, isCreating: mutation.isPending };
}

interface UpdateLocalRoomConfig extends UseFormBaseConfig<LocalroomUpdate> {
  localRoomId: string;
}

export function useUpdateLocalRoomForm({
  localRoomId,
  ...config
}: UpdateLocalRoomConfig) {
  const { formId, handleSuccess } = useFormBase(config);
  const mutation = useUpdateLocalRoom();

  const onSubmit = useCallback<
    NonNullable<BaseFormProps<LocalroomUpdate>["onSubmit"]>
  >(
    (data, helpers) => {
      mutation.mutate(
        { id: localRoomId, data },
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Local mis à jour !",
          successMessageDescription: `Les modifications du local '${data.name || "sélectionné"}' ont été enregistrées.`,
          errorMessageTitle: "Échec de la mise à jour.",
          onSuccess: (responseData) => {
            handleSuccess(responseData);
            helpers?.reset?.(responseData);
          },
        }),
      );
    },
    [localRoomId, mutation, handleSuccess],
  );

  return { formId, onSubmit, isUpdating: mutation.isPending };
}

export function useDeleteLocalRoomForm(config?: UseFormBaseConfig<string>) {
  const { handleSuccess } = useFormBase(config);
  const mutation = useDeleteLocalRoom();

  const deleteLocalRoom = useCallback(
    async (localRoomId: string, roomName?: string) => {
      return mutation.mutateAsync(
        localRoomId,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Local supprimé",
          successMessageDescription: roomName
            ? `Le local '${roomName}' a été retiré de la liste.`
            : "Le local a été supprimé avec succès.",
          onSuccess: () => {
            handleSuccess(localRoomId);
          },
        }),
      );
    },
    [mutation, handleSuccess],
  );

  return { deleteLocalRoom, isDeleting: mutation.isPending };
}
