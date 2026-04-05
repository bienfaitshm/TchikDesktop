import { useCallback, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import {
  useCreateLocalRoom,
  useUpdateLocalRoom,
  useDeleteLocalRoom,
} from "@/renderer/libs/queries/seating";
import { TQueryUpdate } from "@/renderer/libs/queries/type";
import type {
  TLocalRoomCreate as LocalRoomFormData,
  TLocalRoomUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseFormProps } from "../base-form";

interface UseLocalRoomFormConfig {
  mutationKeys?: unknown[];
  onSuccess?: (data?: any) => void;
}

/**
 * Hook interne pour la logique partagée des formulaires de gestion des locaux.
 */
function useLocalRoomFormBase(config?: UseLocalRoomFormConfig) {
  const formId = useId();
  const queryClient = useQueryClient();

  const notifyAndInvalidate = useCallback(
    (data: any) => {
      if (config?.mutationKeys) {
        queryClient.invalidateQueries({ queryKey: config.mutationKeys });
      }
      config?.onSuccess?.(data);
    },
    [queryClient, config],
  );

  return {
    formId,
    notifyAndInvalidate,
  };
}

/**
 * Hook pour la CRÉATION d'un local (salle).
 */
export function useCreateLocalRoomForm(config?: UseLocalRoomFormConfig) {
  const { formId, notifyAndInvalidate } = useLocalRoomFormBase(config);
  const mutation = useCreateLocalRoom();

  const createLocalRoom: BaseFormProps<LocalRoomFormData>["onSubmit"] =
    useCallback(
      (data, helpers) => {
        mutation.mutate(
          data,
          createMutationCallbacksWithNotifications({
            successMessageTitle: "Local créé !",
            successMessageDescription: `Le local '${data.name}' a été ajouté avec succès.`,
            errorMessageTitle: "Échec de la création du local.",
            onSuccess: (responseData) => {
              notifyAndInvalidate?.(responseData);
              helpers?.reset?.();
            },
          }),
        );
      },
      [mutation, notifyAndInvalidate],
    );

  return { formId, createLocalRoom, isCreating: mutation.isPending };
}

/**
 * Hook pour la MISE À JOUR d'un local.
 */
export function useUpdateLocalRoomForm(config?: UseLocalRoomFormConfig) {
  const { formId, notifyAndInvalidate } = useLocalRoomFormBase(config);
  const mutation = useUpdateLocalRoom();

  const updateLocalRoom: BaseFormProps<
    TQueryUpdate<TLocalRoomUpdate>
  >["onSubmit"] = useCallback(
    ({ data, id }, helpers) => {
      mutation.mutate(
        { data, id },
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Local mis à jour !",
          successMessageDescription: `Les modifications du local '${data.name || "sélectionné"}' ont été enregistrées.`,
          errorMessageTitle: "Échec de la mise à jour.",
          onSuccess: (responseData) => {
            notifyAndInvalidate(responseData);
            helpers?.reset?.();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return { formId, updateLocalRoom, isUpdating: mutation.isPending };
}

/**
 * Hook pour la SUPPRESSION d'un local.
 */
export function useDeleteLocalRoomForm(config?: UseLocalRoomFormConfig) {
  const mutation = useDeleteLocalRoom();
  const { notifyAndInvalidate } = useLocalRoomFormBase(config);
  const deleteLocalRoom = useCallback(
    (localRoomId: string, roomName?: string) => {
      mutation.mutate(
        localRoomId,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Local supprimé",
          successMessageDescription: roomName
            ? `Le local '${roomName}' a été retiré de la liste.`
            : "Le local a été supprimé avec succès.",
          onSuccess: () => {
            notifyAndInvalidate(undefined);
            config?.onSuccess?.();
          },
        }),
      );
    },
    [mutation, config],
  );

  return { deleteLocalRoom, isDeleting: mutation.isPending };
}
