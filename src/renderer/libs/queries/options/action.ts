import { useCallback } from "react";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  useCreateOption,
  useDeleteOption,
  useUpdateOption,
} from "@/renderer/libs/queries/option";
import type {
  Option,
  OptionCreate,
  OptionUpdate,
} from "@/packages/@core/data-access/schema-validations";
import {
  type BaseFormProps,
  type BaseMutationConfig,
  type QueryUpdatePayload,
  useFormBase,
} from "../base";

export type OptionFormConfig = BaseMutationConfig<Option>;

/**
 * Hook pour la CRÉATION d'une option (Filière).
 */
export function useCreateOptionForm(config?: OptionFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useCreateOption();

  const onSubmit: BaseFormProps<OptionCreate>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        withNotifications({
          notifications: {
            success: {
              title: "Filière créée !",
              description: `La filière '${data.optionName}' a été ajoutée.`,
            },
            error: {
              title: "Échec de la création.",
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

/**
 * Hook pour la MISE À JOUR d'une option (Filière).
 */
export function useUpdateOptionForm(config?: OptionFormConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useUpdateOption();

  const onSubmit: BaseFormProps<QueryUpdatePayload<OptionUpdate>>["onSubmit"] =
    useCallback(
      ({ data, id }, helpers) => {
        mutation.mutate(
          { data, id },
          withNotifications({
            notifications: {
              success: {
                title: "Filière mise à jour !",
                description: `Les modifications de '${data.optionName}' ont été enregistrées.`,
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
      [mutation, notifyAndInvalidate],
    );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
  };
}

/**
 * Hook pour la SUPPRESSION d'une option (Filière).
 */
export function useDeleteOptionForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteOption();

  const deleteOption = useCallback(
    (optionId: string, optionName?: string) => {
      mutation.mutate(
        optionId,
        withNotifications({
          notifications: {
            success: {
              title: "Filière supprimée",
              description: optionName
                ? `La filière '${optionName}' a été retirée.`
                : "La filière a été supprimée.",
            },
            error: {
              title: "Échec de la suppression.",
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
    deleteOption,
    isDeleting: mutation.isPending,
  };
}
