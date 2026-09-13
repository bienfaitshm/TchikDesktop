import type { ReactNode } from "react";
import type {
  EnrollmentCreate,
  EnrollmentQuickCreate,
} from "@/packages/@core/data-access/schema-validations";
import {
  EnrollmentForm,
  QuickEnrollmentForm,
} from "@/renderer/components/form";
import { MarkStudentsAsProDeoForm } from "../forms/mark-as-prodeo-form";
import {
  useCreateQuickEnrollmentForm,
  useDeleteEnrollmentForm,
  useMarkStudentAsProdeoForm,
  useUpdateEnrollmentForm,
  type EnrollmentFormConfig,
  type EnrollmentFormContext,
} from "@/renderer/libs/queries/enrollements";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "@/renderer/dialog-actions/base.dialog-actions";
import { wrapUpdateFunc } from "@/renderer/libs/queries/base";
import { Suspense } from "@/renderer/libs/queries/suspense";

export type EnrollmentDialogProps = ActionDialogProps<
  EnrollmentCreate | EnrollmentQuickCreate,
  EnrollmentFormConfig
> &
  EnrollmentFormContext;

export type CreateEnrollmentDialogProps = EnrollmentDialogProps;

export type UpdateEnrollmentDialogProps = EnrollmentDialogProps & {
  enrollmentId: string;
  fullName?: string;
};

/**
 * Action dialog component for creating a new student enrollment record.
 * @param props - Dialog properties containing school and academic year context.
 * @returns Rendered enrollment creation dialog component.
 */
export const CreateEnrollmentDialog = createBaseActionDialog<
  CreateEnrollmentDialogProps,
  ReturnType<typeof useCreateQuickEnrollmentForm>
>({
  title: "Dossier d'Inscription",
  description:
    "Remplissez le formulaire complet pour procéder à l'enrôlement de l'élève.",
  submitText: "Valider l'inscription",
  useForm: useCreateQuickEnrollmentForm,
  form({
    formId,
    onSubmit,
    searchClassroom,
    searchUser,
    defaultValues,
    searchTutor,
  }): ReactNode {
    return (
      <div className="py-4">
        <QuickEnrollmentForm
          formId={formId}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          classrooms={searchClassroom}
          students={searchUser}
          tutors={searchTutor}
        />
      </div>
    );
  },
});

CreateEnrollmentDialog.displayName = "CreateEnrollmentDialog";

/**
 * Action dialog component for updating an existing student enrollment record.
 * @param props - Dialog properties containing target enrollmentId and student name.
 * @returns Rendered enrollment update dialog component.
 */
export const UpdateEnrollmentDialog = createBaseActionDialog<
  UpdateEnrollmentDialogProps,
  ReturnType<typeof useUpdateEnrollmentForm>
>({
  title: ({ fullName }: UpdateEnrollmentDialogProps) =>
    `Modifier l'Inscription${fullName ? ` de ${fullName}` : ""}`,
  description:
    "Mettez à jour les informations de l'élève pour l'année scolaire en cours.",
  submitText: "Mettre à jour",
  useForm: useUpdateEnrollmentForm,
  form(
    { formId, onSubmit, searchClassroom, searchTutor, defaultValues },
    { enrollmentId },
  ): ReactNode {
    return (
      <div className="py-4">
        <EnrollmentForm
          formId={formId}
          onSubmit={wrapUpdateFunc(onSubmit, enrollmentId)}
          defaultValues={defaultValues}
          classrooms={searchClassroom}
          tutors={searchTutor}
        />
      </div>
    );
  },
});

UpdateEnrollmentDialog.displayName = "UpdateEnrollmentDialog";

type MarkStudentAsProDeoDialogProps = ActionDialogProps<
  EnrollmentCreate | EnrollmentQuickCreate,
  EnrollmentFormConfig
> & {
  enrollmentId: string;
  fullName?: string;
  schoolId: string;
};

/**
 * Dialogue d'action pour accorder le statut Pro Deo (exonération de frais) à un élève.
 */
export const MarkStudentAsProDeoDialog = createBaseActionDialog<
  MarkStudentAsProDeoDialogProps,
  ReturnType<typeof useMarkStudentAsProdeoForm>
>({
  title: ({ fullName }: MarkStudentAsProDeoDialogProps) =>
    fullName
      ? `Accorder le statut Pro Deo à ${fullName}`
      : "Accorder le statut Pro Deo",
  description:
    "Sélectionnez les frais ou tranches pour lesquels cet élève bénéficiera d'une exonération.",
  submitText: "Appliquer l'exonération",
  useForm: (props) =>
    useMarkStudentAsProdeoForm({
      fullName: props?.fullName,
      enrollmentId: props?.enrollmentId ?? "",
      mutationKey: props?.mutationKey,
      onSuccess: props?.onSuccess,
    }),
  form(
    { formId, onSubmit, feeAssignmentOptions },
    { enrollmentId, schoolId },
  ): ReactNode {
    return (
      <div className="py-2">
        <Suspense
          fallback={
            <div className="space-y-3 py-3 animate-pulse">
              <div className="h-8 bg-muted rounded-md w-full" />
              <div className="h-10 bg-muted rounded-md w-full" />
              <div className="h-28 bg-muted rounded-lg w-full" />
            </div>
          }
        >
          <MarkStudentsAsProDeoForm
            formId={formId}
            enrollmentId={enrollmentId}
            defaultValues={{
              enrollmentIds: [enrollmentId],
              schoolId: schoolId,
            }}
            assignmentsOptions={feeAssignmentOptions}
            onSubmit={onSubmit}
          />
        </Suspense>
      </div>
    );
  },
});

MarkStudentAsProDeoDialog.displayName = "MarkStudentAsProDeoDialog";

/**
 * Action dialog component for confirming and executing student enrollment deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteEnrollmentDialog = createDeleteActionDialog({
  title: "Supprimer l'inscription",
  description:
    "Attention : Cette action est irréversible. L'élève sera désinscrit et ses données d'enrôlement supprimées.",
  errorMessage: "Erreur lors de la suppression de l'inscription:",
  useDeleteForm: useDeleteEnrollmentForm,
});

DeleteEnrollmentDialog.displayName = "DeleteEnrollmentDialog";
