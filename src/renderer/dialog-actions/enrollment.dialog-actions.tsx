import React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import type {
  EnrollmentCreate,
  EnrollmentQuickCreate,
} from "@/packages/@core/data-access/schema-validations";
import {
  EnrollmentForm,
  QuickEnrollmentForm,
} from "@/renderer/components/form";

import {
  useUpdateEnrollmentForm,
  useDeleteEnrollmentForm,
  useCreateQuickEnrollmentForm,
  type EnrollmentFormConfig,
  type EnrollmentFormContext,
} from "@/renderer/libs/queries/enrollements";

import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";

type SchoolYearId = { schoolId: string; yearId: string };

export type DialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      EnrollmentFormContext &
      EnrollmentFormConfig & {
        defaultValues?: Partial<EnrollmentCreate | EnrollmentQuickCreate>;
      }
  >;

/**
 * Dialogue : Inscription Complète (Create)
 */
export const CreateEnrollmentDialog: React.FC<DialogProps> = ({
  children,
  defaultValues,
  schoolId,
  yearId,
  ...config
}) => {
  const { formId, onSubmit, isSubmitting, searchClassroom, searchUser } =
    useCreateQuickEnrollmentForm(config, { schoolId, yearId });

  return (
    <DialogForm
      trigger={children}
      title="Dossier d'Inscription"
      description=" Remplissez le formulaire complet pour procéder à l'enrôlement de
            l'élève."
      formId={formId}
      isLoading={isSubmitting}
      submitText=" Valider l'inscription"
    >
      <div className="py-4">
        <QuickEnrollmentForm
          formId={formId}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          classrooms={searchClassroom}
          students={searchUser}
        />
      </div>
    </DialogForm>
  );
};

type UpdateEnrollmentDialogProps = {
  enrollmentId: string;
  fullName?: string;
};

export const UpdateEnrollmentDialog: React.FC<
  UpdateEnrollmentDialogProps & SchoolYearId & DialogProps
> = ({
  enrollmentId,
  children,
  schoolId,
  yearId,
  fullName,
  defaultValues,
  ...config
}) => {
  const { formId, isSubmitting, onSubmit, searchClassroom } =
    useUpdateEnrollmentForm(config, { schoolId, yearId });

  const handleSubmit = React.useCallback(
    (data, helpers) =>
      onSubmit(
        { id: enrollmentId, data },
        { reset: (updatedData) => helpers.reset(updatedData) },
      ),
    [onSubmit, enrollmentId],
  );

  return (
    <DialogForm
      trigger={children}
      title={`Modifier l'Inscription${fullName ? ` de ${fullName}` : ""}`}
      description="Mettez à jour les informations de l'élève pour l'année scolaire en cours."
      formId={formId}
      isLoading={isSubmitting}
      submitText="Mettre à jour"
    >
      <div className="py-4">
        <EnrollmentForm
          formId={formId}
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          classrooms={searchClassroom.options}
        />
      </div>
    </DialogForm>
  );
};

interface DeleteProps {
  enrollmentId: string;
  studentName: string;
}

export const DeleteEnrollmentDialog: React.FC<DialogProps<DeleteProps>> = ({
  children,
  enrollmentId,
  studentName,
  ...config
}) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();

  const { deleteEnrollment, isDeleting } = useDeleteEnrollmentForm({
    ...config,
    onSuccess: (id) => {
      config.onSuccess?.(id as any);
      onClose();
    },
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: enrollmentId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteEnrollment,
    actionArgs: [studentName],
    errorMessage: "Erreur lors de la suppression de la filière:",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={enrollmentId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer l'inscription"
        description="Attention : Cette action est irréversible. L'élève sera désinscrit et ses données d'enrôlement supprimées."
        itemName={studentName}
      />

      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};

DeleteEnrollmentDialog.displayName = "DeleteEnrollmentDialog";
