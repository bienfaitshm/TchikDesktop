import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import {
  SchoolForm,
  type SchoolFormData,
} from "@/renderer/components/form/school-form";
import {
  useCreateSchoolForm,
  useUpdateSchoolForm,
  useDeleteSchoolForm,
  type SchoolFormConfig,
} from "@/renderer/libs/queries/schools";

/* ==========================================================================
   1. CRÉATION
   ========================================================================== */

export type CreateSchoolDialogProps<
  TExtraProps extends Record<string, any> = {},
> = React.PropsWithChildren<
  TExtraProps &
    SchoolFormConfig & {
      defaultValues?: Partial<SchoolFormData>;
    }
>;

export const CreateSchoolDialog: React.FC<CreateSchoolDialogProps> = ({
  children,
  defaultValues,
  ...config
}) => {
  const { formId, onSubmit, isSubmitting } = useCreateSchoolForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Nouvel établissement"
      description="Renseignez les détails pour configurer votre établissement scolaire."
      formId={formId}
      isLoading={isSubmitting}
    >
      <SchoolForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   2. MODIFICATION
   ========================================================================== */
type UpdateSchoolDialogProps = {
  schoolId: string;
};

export const UpdateSchoolDialog: React.FC<
  UpdateSchoolDialogProps & CreateSchoolDialogProps
> = ({ schoolId, children, defaultValues, ...config }) => {
  const { formId, isSubmitting, onSubmit } = useUpdateSchoolForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Modifier l'établissement"
      description={`Mettez à jour les informations de ${defaultValues?.name || "l'établissement"}.`}
      formId={formId}
      isLoading={isSubmitting}
    >
      <SchoolForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit({ id: schoolId, data }, helpers as any)
        }
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   3. SUPPRESSION
   ========================================================================== */
interface DeleteSchoolDialogProps {
  children: React.ReactNode;
  schoolId: string;
  schoolName: string;
}

export const DeleteSchoolDialog: React.FC<
  DeleteSchoolDialogProps & SchoolFormConfig
> = ({ children, schoolId, schoolName, ...config }) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();

  const { deleteSchool, isDeleting } = useDeleteSchoolForm({
    ...config,
    onSuccess: () => onClose(),
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: schoolId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteSchool,
    actionArgs: [schoolName],
    errorMessage: "Erreur lors de la suppression de l'établissement:",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={schoolId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer l'établissement"
        description="Attention : cette action est irréversible. Toutes les données liées (élèves, classes, années) seront définitivement supprimées."
        itemName={schoolName}
      />

      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};

DeleteSchoolDialog.displayName = "DeleteSchoolDialog";
