import type { ReactNode } from "react";
import { ClassroomForm } from "@/renderer/components/form/classroom-form";
import {
  useCreateClassroomForm,
  useDeleteClassroomForm,
  useGenerateClassroomSuggestion,
  useUpdateClassroomForm,
  type ClassroomFormConfig,
  type ClassroomFormData,
} from "@/renderer/libs/queries/classrooms";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";
import { wrapUpdateFunc } from "../libs/queries/base";

export type ClassroomDialogProps = ActionDialogProps<
  ClassroomFormData,
  ClassroomFormConfig
>;

export type CreateClassroomDialogProps = ClassroomDialogProps & {
  schoolId: string;
};

export type UpdateClassroomDialogProps = ClassroomDialogProps & {
  schoolId: string;
  classId: string;
  identifier?: string;
};

/**
 * Action dialog component for creating a new classroom entity.
 * @param props - Dialog properties containing schoolId context and initial values.
 * @returns Rendered classroom creation dialog component.
 */
export const CreateClassroomDialog = createBaseActionDialog<
  CreateClassroomDialogProps,
  ReturnType<typeof useCreateClassroomForm>
>({
  title: "Créer une salle de classe",
  description:
    "Remplissez les informations ci-dessous pour ajouter une nouvelle salle à votre établissement.",
  useForm: useCreateClassroomForm,
  form({
    formId,
    onSubmit,
    searchOptions,
    sectionOptions,
    generateSuggestion,
    defaultValues,
  }): ReactNode {
    const { handleGenerate, isGenerating } = useGenerateClassroomSuggestion({
      onGenerateSuggestion: generateSuggestion,
    });

    return (
      <ClassroomForm
        formId={formId}
        onSubmit={onSubmit}
        isGenerating={isGenerating}
        onGenerateSuggestion={handleGenerate}
        searchOption={searchOptions}
        sectionOptions={sectionOptions || []}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateClassroomDialog.displayName = "CreateClassroomDialog";

/**
 * Action dialog component for updating an existing classroom entity.
 * @param props - Dialog properties containing target schoolId, classId, and initial values.
 * @returns Rendered classroom update dialog component.
 */
export const UpdateClassroomDialog = createBaseActionDialog<
  UpdateClassroomDialogProps,
  ReturnType<typeof useUpdateClassroomForm>
>({
  title: ({ identifier }: UpdateClassroomDialogProps) =>
    `Modifier la salle : ${identifier ?? ""}`,
  description:
    "Modifiez les détails de la salle de classe. Les changements seront appliqués immédiatement après l'enregistrement.",
  useForm: useUpdateClassroomForm,
  form(
    {
      formId,
      onSubmit,
      searchOptions,
      sectionOptions,
      generateSuggestion,
      defaultValues,
    },
    { classId: id },
  ): ReactNode {
    const { handleGenerate, isGenerating } = useGenerateClassroomSuggestion({
      onGenerateSuggestion: generateSuggestion,
    });

    return (
      <ClassroomForm
        formId={formId}
        onSubmit={wrapUpdateFunc(onSubmit, id)}
        isGenerating={isGenerating}
        onGenerateSuggestion={handleGenerate}
        searchOption={searchOptions}
        sectionOptions={sectionOptions}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateClassroomDialog.displayName = "UpdateClassroomDialog";

/**
 * Action dialog component for confirming and executing classroom deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteClassroomDialog = createDeleteActionDialog({
  title: "Supprimer la salle de classe",
  description:
    "Tous les documents, membres et emplois du temps associés seront définitivement supprimés.",
  errorMessage: "Erreur lors de la suppression de la salle:",
  useDeleteForm: useDeleteClassroomForm,
});

DeleteClassroomDialog.displayName = "DeleteClassroomDialog";
