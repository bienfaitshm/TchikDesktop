import type { ReactNode } from "react";
import {
  OptionForm,
  type OptionFormData,
} from "@/renderer/components/form/option-form";
import {
  useCreateOptionForm,
  useDeleteOptionForm,
  useUpdateOptionForm,
  type OptionFormConfig,
} from "@/renderer/libs/queries/options";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type OptionDialogProps = ActionDialogProps<
  OptionFormData,
  OptionFormConfig
>;

export type CreateOptionDialogProps = OptionDialogProps;

export type UpdateOptionDialogProps = OptionDialogProps & {
  optionId: string;
  optionName?: string;
};

/**
 * Action dialog component for creating a new academic option.
 * @param props - Dialog properties containing initial form values and callbacks.
 * @returns Rendered option creation dialog component.
 */
export const CreateOptionDialog = createBaseActionDialog<
  CreateOptionDialogProps,
  ReturnType<typeof useCreateOptionForm>
>({
  title: "Créer une filière",
  description:
    "Remplissez les informations ci-dessous pour ajouter une nouvelle filière à votre établissement.",
  useForm: useCreateOptionForm,
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <OptionForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateOptionDialog.displayName = "CreateOptionDialog";

/**
 * Action dialog component for updating an existing academic option.
 * @param props - Dialog properties containing target optionId and initial form values.
 * @returns Rendered option update dialog component.
 */
export const UpdateOptionDialog = createBaseActionDialog<
  UpdateOptionDialogProps,
  ReturnType<typeof useUpdateOptionForm>
>({
  title: ({ optionName, defaultValues }: UpdateOptionDialogProps) =>
    `Modifier la filière : ${optionName ?? defaultValues?.optionName ?? ""}`,
  description:
    "Modifiez les détails de la filière. Les changements seront appliqués immédiatement.",
  useForm: useUpdateOptionForm,
  form({ formId, onSubmit, defaultValues }, { optionId }): ReactNode {
    return (
      <OptionForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit({ data, id: optionId }, helpers as any)
        }
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateOptionDialog.displayName = "UpdateOptionDialog";

/**
 * Action dialog component for confirming and executing academic option deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteOptionDialog = createDeleteActionDialog({
  title: "Supprimer la filière",
  description:
    "Attention : tous les documents et données associés à cette filière seront définitivement supprimés.",
  errorMessage: "Erreur lors de la suppression de la filière:",
  useDeleteForm: useDeleteOptionForm,
});

DeleteOptionDialog.displayName = "DeleteOptionDialog";
