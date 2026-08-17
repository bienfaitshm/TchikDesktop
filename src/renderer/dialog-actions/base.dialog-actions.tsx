import React, { ReactNode } from "react";
import { DefaultValues, FieldValues } from "react-hook-form";
import { DialogForm, type DialogFormProps } from "@/components/dialog/form";
import { BaseFormProps } from "@/renderer/libs/forms";
import { BaseMutationConfig } from "@/renderer/libs/queries/base";
import { useConfirm } from "../hooks/use-confirm";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { cloneElementWithProps } from "@/renderer/utils/react";

export type BaseFormConfig<TData = unknown> = {
  mutationKeys?: readonly unknown[];
  onSuccess?: (data?: TData) => void;
};

export type ActionDialogProps<
  TFieldValues extends FieldValues = FieldValues,
  TExtraProps extends object = {},
> = React.PropsWithChildren<
  TExtraProps &
    Pick<DialogFormProps, "open" | "onOpenChange" | "modal"> & {
      defaultValues?: DefaultValues<TFieldValues>;
      mutationKey?: readonly unknown[];
      onSuccess?: (data?: unknown) => void;
    }
>;

export type DialogLabel<TProps> = string | ((props: TProps) => string);

export type CreateBaseActionDialogConfig<
  TProps extends ActionDialogProps<FieldValues, object>,
  TFormProps extends BaseFormProps<FieldValues>,
> = {
  title: DialogLabel<TProps>;
  description: DialogLabel<TProps>;
  submitText?: string;
  useForm: (config?: TProps) => TFormProps & { isSubmitting?: boolean };
  form: (
    actions: TFormProps & Pick<TProps, "defaultValues">,
    props: TProps,
  ) => ReactNode;
};

/**
 * Creates a generic action dialog component bound to a react-hook-form hook.
 * @param config - Configuration including title, description, form hook, and render function.
 * @returns A React functional component rendering the modal form dialog.
 */
export function createBaseActionDialog<
  TProps extends ActionDialogProps<FieldValues, object>,
  TFormProps extends BaseFormProps<FieldValues>,
>({
  description,
  form,
  title,
  submitText,
  useForm,
}: CreateBaseActionDialogConfig<TProps, TFormProps>): React.FC<TProps> {
  const ActionDialog: React.FC<TProps> = (props) => {
    const { children, defaultValues, onOpenChange, open, modal } = props;

    const actions = useForm(props);

    const formActions = {
      ...actions,
      defaultValues,
    };

    const resolvedTitle = typeof title === "function" ? title(props) : title;
    const resolvedDescription =
      typeof description === "function" ? description(props) : description;

    return (
      <DialogForm
        modal={modal}
        trigger={children}
        title={resolvedTitle}
        description={resolvedDescription}
        formId={actions.formId}
        isLoading={actions.isSubmitting}
        open={open}
        onOpenChange={onOpenChange}
        submitText={submitText}
      >
        {form(formActions, props)}
      </DialogForm>
    );
  };

  ActionDialog.displayName = "BaseActionDialog";
  return ActionDialog;
}

export type DeleteFormHookResult = {
  onDelete: (id: string, name?: string) => void;
  isDeleting: boolean;
};

export type CreateDeleteActionDialogConfig<
  TMutationConfig extends BaseMutationConfig = BaseMutationConfig,
> = {
  title: string;
  description: string;
  errorMessage?: string;
  useDeleteForm: (config?: TMutationConfig) => DeleteFormHookResult;
};

export type DeleteActionDialogProps = ActionDialogProps<
  FieldValues,
  BaseMutationConfig
> & {
  id: string;
  name?: string;
};

/**
 * Creates a confirmation dialog component for handling delete operations.
 * @param config - Deletion dialog options including title, description, and delete hook.
 * @returns A React functional component rendering the delete confirmation modal.
 */
export function createDeleteActionDialog<
  TMutationConfig extends BaseMutationConfig = BaseMutationConfig,
>({
  title,
  description,
  useDeleteForm,
  errorMessage = "An error occurred while deleting:",
}: CreateDeleteActionDialogConfig<TMutationConfig>): React.FC<DeleteActionDialogProps> {
  const DeleteActionDialog: React.FC<DeleteActionDialogProps> = ({
    children,
    onOpenChange,
    open,
    id,
    name,
    ...config
  }) => {
    const { isOpen, onOpen, onClose } = useConfirm<string>({
      open,
      onOpenChange,
    });

    const { isDeleting, onDelete } = useDeleteForm({
      ...(config as unknown as TMutationConfig),
      onSuccess: () => onClose(),
    });

    const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
      id,
      onOpenConfirm: onOpen,
      onCloseConfirm: onClose,
      onConfirmAction: onDelete,
      actionArgs: [name],
      errorMessage,
    });

    return (
      <>
        <ConfirmDeleteDialog
          id={id}
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={handleConfirm}
          isPending={isDeleting}
          title={title}
          description={description}
          itemName={name}
        />

        {cloneElementWithProps(children, {
          onClick: handleTriggerClick,
          disabled: isDeleting,
        })}
      </>
    );
  };

  DeleteActionDialog.displayName = "DeleteActionDialog";
  return DeleteActionDialog;
}
