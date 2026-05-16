import React, { useCallback } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import {
  OptionForm,
  type OptionFormData,
} from "@/renderer/components/form/option-form";
import {
  useCreateOptionForm,
  useUpdateOptionForm,
  useDeleteOptionForm,
  type OptionFormConfig,
} from "@/renderer/components/form/option-form.actions";
import {
  ConfirmDeleteDialog,
  useConfirm,
} from "@/renderer/components/dialog/dialog-delete";

export type OptionDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      OptionFormConfig & {
        defaultValues?: Partial<OptionFormData>;
      }
  >;

export const CreateOptionDialog: React.FC<OptionDialogProps> = ({
  children,
  defaultValues,
  ...config
}) => {
  const { formId, createOption, isCreating } = useCreateOptionForm(config);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Créer une filière</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour ajouter une nouvelle
            filière à votre établissement.
          </DialogDescription>
        </DialogHeader>

        <OptionForm
          formId={formId}
          onSubmit={createOption}
          initialValues={defaultValues}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <ButtonLoader form={formId} type="submit" isLoading={isCreating}>
            Enregistrer
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const UpdateOptionDialog: React.FC<
  OptionDialogProps<{ optionId: string }>
> = ({ defaultValues, optionId, children, ...config }) => {
  const { formId, isUpdating, updateOption } = useUpdateOptionForm(config);

  const handleSubmit = useCallback(
    async (data: OptionFormData, helpers: { reset: () => void }) => {
      await updateOption({ id: optionId, data }, helpers);
    },
    [optionId, updateOption],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            Modifier la filière : {defaultValues?.optionName ?? ""}
          </DialogTitle>
          <DialogDescription>
            Modifiez les détails de la filière. Les changements seront appliqués
            immédiatement.
          </DialogDescription>
        </DialogHeader>

        <OptionForm
          formId={formId}
          onSubmit={handleSubmit}
          initialValues={defaultValues}
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Annuler</Button>
          </DialogClose>
          <ButtonLoader form={formId} type="submit" isLoading={isUpdating}>
            Mettre à jour
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteOptionProps {
  optionId: string;
  optionName: string;
}

export const DeleteOptionDialog: React.FC<
  OptionDialogProps<DeleteOptionProps>
> = ({ children, optionId, optionName, ...config }) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();

  const { deleteOption, isDeleting } = useDeleteOptionForm({
    ...config,
    onSuccess: onClose,
  });

  const handleConfirm = useCallback(async () => {
    await deleteOption(optionId, optionName);
  }, [optionId, optionName, deleteOption]);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onOpen(optionId);
    },
    [onOpen, optionId],
  );

  return (
    <>
      <ConfirmDeleteDialog
        item={optionId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isLoading={isDeleting}
        title="Supprimer la filière"
        description="Attention : tous les documents et données associés à cette filière seront définitivement supprimés."
        itemName={optionName}
      />

      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<any>, {
            onClick: handleTriggerClick,
            disabled: isDeleting,
          })
        : children}
    </>
  );
};

DeleteOptionDialog.displayName = "DeleteOptionDialog";
