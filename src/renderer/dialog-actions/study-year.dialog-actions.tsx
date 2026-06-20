import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import {
  ConfirmDeleteDialog,
  useAsyncConfirm,
} from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import {
  StudyYearForm,
  type StudyYearFormData,
} from "@/renderer/components/form/study-year-form";
import {
  useCreateStudyYearForm,
  useUpdateStudyYearForm,
  useDeleteStudyYearForm,
  type StudyYearFormConfig,
} from "@/renderer/libs/queries/study-years";

/* ==========================================================================
   1. CRÉATION
   ========================================================================== */

export type CreateStudyYearDialogProps<
  TExtraProps extends Record<string, any> = {},
> = React.PropsWithChildren<
  TExtraProps &
    StudyYearFormConfig & {
      defaultValues?: Partial<StudyYearFormData>;
    }
>;

export const CreateStudyYearDialog: React.FC<CreateStudyYearDialogProps> = ({
  children,
  defaultValues,
  ...config
}) => {
  const { formId, onSubmit, isSubmitting } = useCreateStudyYearForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Nouvelle année scolaire"
      description="Configurez une nouvelle période scolaire (ex: 2023-2024)."
      formId={formId}
      isLoading={isSubmitting}
    >
      <StudyYearForm
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
type UpdateStudyYearDialogProps = {
  studyYearId: string;
};

export const UpdateStudyYearDialog: React.FC<
  UpdateStudyYearDialogProps & CreateStudyYearDialogProps
> = ({ studyYearId, children, defaultValues, ...config }) => {
  const { formId, isSubmitting, onSubmit } = useUpdateStudyYearForm(config);

  return (
    <DialogForm
      trigger={children}
      title="Modifier l'année scolaire"
      description="Modifiez les dates ou l'intitulé de l'année scolaire."
      formId={formId}
      isLoading={isSubmitting}
    >
      <StudyYearForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit?.({ id: studyYearId, data }, helpers as any)
        }
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   3. SUPPRESSION
   ========================================================================== */
interface DeleteStudyYearDialogProps {
  children:
    | React.ReactNode
    | ((props: {
        onOpen: (e: React.MouseEvent) => void;
        isLoading: boolean;
      }) => React.ReactNode);
  studyYearId: string;
  yearName: string;
}

export const DeleteStudyYearDialog: React.FC<
  DeleteStudyYearDialogProps & StudyYearFormConfig
> = ({ children, studyYearId, yearName, ...config }) => {
  const { isOpen, onOpen, onClose } = useConfirm<string>();

  const { deleteStudyYear, isDeleting } = useDeleteStudyYearForm({
    ...config,
    onSuccess: () => onClose(),
  });

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: studyYearId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteStudyYear,
    actionArgs: [yearName],
    errorMessage: "Erreur lors de la suppression de l'année scolaire:",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={studyYearId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer l'année scolaire"
        description={`Êtes-vous sûr de vouloir supprimer l'année ${yearName} ? Cela pourrait affecter les inscriptions liées.`}
        itemName={yearName}
      />

      {typeof children === "function"
        ? children({ onOpen: handleTriggerClick, isLoading: isDeleting })
        : cloneElementWithProps(children, {
            onClick: handleTriggerClick,
            disabled: isDeleting,
          })}
    </>
  );
};

DeleteStudyYearDialog.displayName = "DeleteStudyYearDialog";
