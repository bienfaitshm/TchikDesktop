import * as React from "react";
import { DialogForm } from "@/renderer/components/dialog/form";
import { ConfirmDeleteDialog } from "@/renderer/components/dialog/confirm-delete";
import { useAsyncConfirm } from "@/renderer/components/dialog/confirm-delete";
import { useConfirm } from "@/renderer/hooks/use-confirm";
import { cloneElementWithProps } from "@/renderer/utils/react";
import { ClassroomForm } from "@/renderer/components/form/classroom-form";

import {
  useCreateClassroomForm,
  useUpdateClassroomForm,
  useDeleteClassroomForm,
  useGenerateClassroomSuggestion,
  type ClassroomFormConfig,
  type ClassroomFormData,
} from "@/renderer/libs/queries/classrooms";

export type ClassroomDialogProps<TExtraProps extends Record<string, any> = {}> =
  React.PropsWithChildren<
    TExtraProps &
      ClassroomFormConfig & {
        defaultValues?: Partial<ClassroomFormData>;
      }
  >;

/* ==========================================================================
   1. CRÉATION
   ========================================================================== */
interface CreateClassroomProps {
  schoolId: string;
}

export const ClassroomDialogCreateForm: React.FC<
  ClassroomDialogProps<CreateClassroomProps>
> = ({ schoolId, children, defaultValues, ...config }) => {
  const {
    formId,
    generateSuggestion,
    searchOption,
    sectionOptions,
    isSubmitting,
    onSubmit,
  } = useCreateClassroomForm(schoolId, config);
  const { handleGenerate, isGenerating } = useGenerateClassroomSuggestion({
    onGenerateSuggestion: generateSuggestion,
  });

  return (
    <DialogForm
      trigger={children}
      title="Créer une salle de classe"
      description="Remplissez les informations ci-dessous pour ajouter une nouvelle salle à votre établissement."
      formId={formId}
      isLoading={isSubmitting}
    >
      <ClassroomForm
        formId={formId}
        onSubmit={onSubmit}
        isGenerating={isGenerating}
        onGenerateSuggestion={handleGenerate}
        searchOption={searchOption}
        sectionOptions={sectionOptions}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   2. MODIFICATION
   ========================================================================== */
interface UpdateClassroomProps {
  schoolId: string;
  classId: string;
}

export const ClassroomDialogUpdateForm: React.FC<
  ClassroomDialogProps<UpdateClassroomProps>
> = ({ defaultValues, classId, schoolId, children, ...config }) => {
  const {
    formId,
    isSubmitting,
    onSubmit,
    searchOption,
    sectionOptions,
    generateSuggestion,
  } = useUpdateClassroomForm({
    ...config,
    schoolId,
    classroomId: classId,
  });

  const { handleGenerate, isGenerating } = useGenerateClassroomSuggestion({
    onGenerateSuggestion: generateSuggestion,
  });

  return (
    <DialogForm
      trigger={children}
      title={`Modifier la salle : ${defaultValues?.identifier ?? ""}`}
      description="Modifiez les détails de la salle de classe. Les changements seront appliqués immédiatement après l'enregistrement."
      formId={formId}
      isLoading={isSubmitting}
    >
      <ClassroomForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit?.({ id: classId, data }, helpers as any)
        }
        isGenerating={isGenerating}
        onGenerateSuggestion={handleGenerate}
        searchOption={searchOption}
        sectionOptions={sectionOptions}
        defaultValues={defaultValues}
      />
    </DialogForm>
  );
};

/* ==========================================================================
   3. SUPPRESSION
   ========================================================================== */
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

  const { handleConfirm, handleTriggerClick } = useAsyncConfirm({
    id: classId,
    onOpenConfirm: onOpen,
    onCloseConfirm: onClose,
    onConfirmAction: deleteClassroom,
    actionArgs: [identifier],
    errorMessage: "Erreur lors de la suppression de la salle:",
  });

  return (
    <>
      <ConfirmDeleteDialog
        id={classId}
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        isPending={isDeleting}
        title="Supprimer la salle de classe"
        description="Tous les documents, membres et emplois du temps associés seront définitivement retirés de la base de données."
        itemName={identifier}
      />

      {cloneElementWithProps(children, {
        onClick: handleTriggerClick,
        disabled: isDeleting,
      })}
    </>
  );
};

ClassroomDialogDeleteForm.displayName = "ClassroomDialogDeleteForm";
