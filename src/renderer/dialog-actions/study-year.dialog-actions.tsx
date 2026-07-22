import type { ReactNode } from "react";
import {
  StudyYearForm,
  type StudyYearFormData,
} from "@/renderer/components/form/study-year-form";
import {
  useCreateStudyYearForm,
  useDeleteStudyYearForm,
  useUpdateStudyYearForm,
  type StudyYearFormConfig,
} from "@/renderer/libs/queries/study-years";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type StudyYearDialogProps = ActionDialogProps<
  StudyYearFormData,
  StudyYearFormConfig
>;

export type CreateStudyYearDialogProps = StudyYearDialogProps;

export type UpdateStudyYearDialogProps = StudyYearDialogProps & {
  studyYearId: string;
  yearName?: string;
};

/**
 * Action dialog component for creating a new academic study year.
 * @param props - Dialog properties containing initial form values and callbacks.
 * @returns Rendered creation dialog component.
 */
export const CreateStudyYearDialog = createBaseActionDialog<
  CreateStudyYearDialogProps,
  ReturnType<typeof useCreateStudyYearForm>
>({
  title: "Nouvelle année scolaire",
  description: "Configurez une nouvelle période scolaire (ex: 2023-2024).",
  useForm: useCreateStudyYearForm,
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <StudyYearForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateStudyYearDialog.displayName = "CreateStudyYearDialog";

/**
 * Action dialog component for updating an existing academic study year.
 * @param props - Dialog properties containing target studyYearId and initial form values.
 * @returns Rendered update dialog component.
 */
export const UpdateStudyYearDialog = createBaseActionDialog<
  UpdateStudyYearDialogProps,
  ReturnType<typeof useUpdateStudyYearForm>
>({
  title: ({ yearName, defaultValues }: UpdateStudyYearDialogProps) =>
    `Modifier l'année scolaire : ${yearName ?? defaultValues?.yearName ?? ""}`,
  description: "Modifiez les dates ou l'intitulé de l'année scolaire.",
  useForm: useUpdateStudyYearForm,
  form({ formId, onSubmit, defaultValues }, { studyYearId }): ReactNode {
    return (
      <StudyYearForm
        formId={formId}
        onSubmit={(data, helpers) =>
          onSubmit({ data, id: studyYearId }, helpers as any)
        }
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateStudyYearDialog.displayName = "UpdateStudyYearDialog";

/**
 * Action dialog component for confirming and executing academic study year deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteStudyYearDialog = createDeleteActionDialog({
  title: "Supprimer l'année scolaire",
  description:
    "Attention : la suppression de cette année scolaire pourrait affecter les inscriptions et données associées.",
  errorMessage: "Erreur lors de la suppression de l'année scolaire:",
  useDeleteForm: useDeleteStudyYearForm,
});

DeleteStudyYearDialog.displayName = "DeleteStudyYearDialog";
