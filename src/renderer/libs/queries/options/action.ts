import { useCallback } from "react";
import type {
  Option,
  OptionCreate,
  OptionUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { withNotifications } from "@/renderer/libs/notifications";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase, useFormBaseNotify } from "../base";
import { useCreateOption, useDeleteOption, useUpdateOption } from "./option";

export type OptionFormConfig = BaseMutationConfig<Option>;

const CREATE_OPTION_NOTIFICATIONS = {
  success: {
    title: "Filière créée !",
    description: "La filière a été ajoutée.",
  },
  error: {
    title: "Échec de la création.",
  },
};

const UPDATE_OPTION_NOTIFICATIONS = {
  success: {
    title: "Filière mise à jour !",
    description: "Les modifications ont été enregistrées.",
  },
  error: {
    title: "Échec de la mise à jour.",
  },
};

/**
 * Builds notification configurations for academic option deletions.
 * @param optionName - Optional name of the option being removed.
 * @returns Notification configuration object.
 */
const getDeleteOptionNotifications = (optionName?: string) => ({
  success: {
    title: "Filière supprimée",
    description: optionName
      ? `La filière '${optionName}' a été retirée.`
      : "La filière a été supprimée.",
  },
  error: {
    title: "Échec de la suppression.",
  },
});

/**
 * Custom form hook for creating academic options.
 * @param config - Optional base mutation configuration settings.
 * @returns Form state, submit handler, and pending status.
 */
export function useCreateOptionForm(config?: OptionFormConfig) {
  const mutation = useCreateOption();

  const adaptData = useCallback((data: OptionCreate) => data, []);

  return useFormBaseNotify<OptionCreate, OptionCreate, Option>({
    mutation,
    config,
    getNotifications: () => CREATE_OPTION_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom form hook for updating existing academic options.
 * @param config - Optional base mutation configuration settings for OptionUpdate.
 * @returns Form state, submit handler, and pending status.
 */
export function useUpdateOptionForm(config?: BaseMutationConfig<OptionUpdate>) {
  const mutation = useUpdateOption();

  const adaptData = useCallback(
    ({ data, id }: QueryUpdatePayload<OptionUpdate>) => ({ data, id }),
    [],
  );

  return useFormBaseNotify<
    QueryUpdatePayload<OptionUpdate>,
    { data: OptionUpdate; id: string },
    OptionUpdate
  >({
    mutation,
    config,
    getNotifications: () => UPDATE_OPTION_NOTIFICATIONS,
    adaptData,
  });
}

/**
 * Custom hook managing academic option deletion actions and pending state.
 * @param config - Optional base mutation configuration settings.
 * @returns Object containing the delete callback and pending state.
 */
export function useDeleteOptionForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const mutation = useDeleteOption();

  const deleteOption = useCallback(
    (optionId: string, optionName?: string) => {
      mutation.mutate(
        optionId,
        withNotifications({
          notifications: getDeleteOptionNotifications(optionName),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteOption,
    isDeleting: mutation.isPending,
    onDelete: deleteOption,
  };
}
