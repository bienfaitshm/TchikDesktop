import React, { useState, useCallback } from "react";
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
  ClassroomForm,
  type ClassroomFormData,
} from "@/renderer/components/form/classroom-form";
import {
  useCreateClassroomForm,
  useUpdateClassroomForm,
  useDeleteClassroomForm,
  type ClassroomFormConfig,
} from "@/renderer/components/form/classroom-form.actions";
import {
  ConfirmDeleteDialog,
  useConfirm,
} from "@/renderer/components/dialog/dialog-delete";

export type ClassroomDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      ClassroomFormConfig & {
        defaultValues?: Partial<ClassroomFormData>;
      }
  >;

interface CreateClassroomProps {
  schoolId: string;
}

export const ClassroomDialogCreateForm: React.FC<
  ClassroomDialogProps<CreateClassroomProps>
> = ({ schoolId, children, defaultValues, ...config }) => {
  const [open, setOpen] = useState(false);

  const { formId, generateSuggestion, isCreating, onSubmit, selectItems } =
    useCreateClassroomForm(schoolId, {
      ...config,
      onSuccess: (data) => {
        config.onSuccess?.(data);
        setOpen(false);
      },
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Créer une salle de classe</DialogTitle>
          <DialogDescription>
            Remplissez les informations ci-dessous pour ajouter une nouvelle
            salle à votre établissement.
          </DialogDescription>
        </DialogHeader>

        <ClassroomForm
          formId={formId}
          onSubmit={onSubmit}
          onGenerateSuggestion={generateSuggestion}
          options={selectItems}
          initialValues={defaultValues}
        />

        <DialogFooter className="gap-2 sm:gap-0">
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

interface UpdateClassroomProps {
  schoolId: string;
  classId: string;
}

export const ClassroomDialogUpdateForm: React.FC<
  ClassroomDialogProps<UpdateClassroomProps>
> = ({ defaultValues, classId, schoolId, children, ...config }) => {
  const [open, setOpen] = useState(false);

  const { formId, isUpdating, onSubmit, selectItems, generateSuggestion } =
    useUpdateClassroomForm({
      ...config,
      schoolId,
      classroomId: classId,
      onSuccess: (data) => {
        config.onSuccess?.(data);
        setOpen(false);
      },
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] md:max-w-[700px] lg:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>
            Modifier la salle : {defaultValues?.identifier ?? ""}
          </DialogTitle>
          <DialogDescription>
            Modifiez les détails de la salle de classe. Les changements seront
            appliqués immédiatement après l'enregistrement.
          </DialogDescription>
        </DialogHeader>

        <ClassroomForm
          formId={formId}
          onSubmit={onSubmit}
          onGenerateSuggestion={generateSuggestion}
          options={selectItems}
          initialValues={defaultValues}
        />

        <DialogFooter className="gap-2 sm:gap-0">
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

interface DeleteClassroomProps {
  classId: string;
  identifier: string;
}

export const ClassroomDialogDeleteForm: React.FC<
  ClassroomDialogProps<DeleteClassroomProps>
> = ({ children, classId, identifier, ...config }) => {
  const { isOpen, onClose, onOpen } = useConfirm<string>();

  const { isDeleting, deleteClassroom } = useDeleteClassroomForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const handleConfirm = useCallback(async () => {
    try {
      await deleteClassroom(classId, identifier);
    } catch (error) {
      console.error("Erreur lors de la suppression de la salle:", error);
    }
  }, [classId, identifier, deleteClassroom]);

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onOpen(classId);
    },
    [onOpen, classId],
  );

  return (
    <>
      <ConfirmDeleteDialog
        item={classId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isLoading={isDeleting}
        title="Supprimer la salle de classe"
        description="Tous les documents, membres et emplois du temps associés seront définitivement retirés de la base de données."
        itemName={identifier}
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

ClassroomDialogDeleteForm.displayName = "ClassroomDialogDeleteForm";
