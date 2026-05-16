import { useCallback } from "react";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import {
  useCreateOption,
  useDeleteOption,
  useUpdateOption,
} from "@/renderer/libs/queries/option";
import { TQueryUpdate } from "@/renderer/libs/queries/type";
import type { TOptionCreate as OptionFormData } from "@/packages/@core/data-access/schema-validations";
import {
  type BaseFormProps,
  type UseFormBaseConfig,
  useFormBase,
} from "./base-form";

export type OptionFormConfig = UseFormBaseConfig<OptionFormData>;

/**
 * Hook pour la CRÉATION d'une option.
 */
export function useCreateOptionForm(config?: OptionFormConfig) {
  const { formId, handleSuccess } = useFormBase(config);
  const mutation = useCreateOption();

  const createOption: BaseFormProps<OptionFormData>["onSubmit"] = useCallback(
    (data, helpers) => {
      mutation.mutate(
        data,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Filière créée !",
          successMessageDescription: `La filière '${data.optionName}' a été ajoutée.`,
          errorMessageTitle: "Échec de la création.",
          onSuccess: (data) => {
            handleSuccess?.(data);
            helpers?.reset?.();
          },
        }),
      );
    },
    [mutation, handleSuccess],
  );

  return { formId, createOption, isCreating: mutation.isPending };
}

/**
 * Hook pour la MISE À JOUR d'une option.
 */
export function useUpdateOptionForm(config?: OptionFormConfig) {
  const { formId, handleSuccess } = useFormBase(config);
  const mutation = useUpdateOption();

  const updateOption: BaseFormProps<TQueryUpdate<OptionFormData>>["onSubmit"] =
    useCallback(
      ({ data, id }, helpers) => {
        mutation.mutate(
          { data, id },
          createMutationCallbacksWithNotifications({
            successMessageTitle: "Filière mise à jour !",
            successMessageDescription: `Les modifications de '${data.optionName}' ont été enregistrées.`,
            errorMessageTitle: "Échec de la mise à jour.",
            onSuccess: (data) => {
              handleSuccess(data);
              helpers?.reset?.();
            },
          }),
        );
      },
      [mutation, handleSuccess],
    );

  return { formId, updateOption, isUpdating: mutation.isPending };
}

/**
 * Hook pour la SUPPRESSION d'une option.
 */
export function useDeleteOptionForm(config?: UseFormBaseConfig<string>) {
  const mutation = useDeleteOption();

  const deleteOption = useCallback(
    (optionId: string, optionName?: string) => {
      mutation.mutate(
        optionId,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Filière supprimée",
          successMessageDescription: optionName
            ? `La filière '${optionName}' a été retirée.`
            : "La filière a été supprimée.",
          onSuccess: () => config?.onSuccess?.(optionId),
        }),
      );
    },
    [mutation, config],
  );

  return { deleteOption, isDeleting: mutation.isPending };
}
