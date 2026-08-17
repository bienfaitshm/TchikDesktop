import type { ReactNode } from "react";
import {
  SeatingSessionForm,
  type SeatingSessionData,
} from "@/renderer/components/form/seatings/seating-session-form";
import {
  useCreateSeatingSessionForm,
  useDeleteSeatingSessionForm,
  useUpdateSeatingSessionForm,
  type SeatingSessionFormConfig,
} from "@/renderer/libs/queries/seatings/seating-session.actions";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type SeatingSessionDialogProps = ActionDialogProps<
  SeatingSessionData,
  SeatingSessionFormConfig
>;

export type CreateSeatingSessionDialogProps = SeatingSessionDialogProps;

export type UpdateSeatingSessionDialogProps = SeatingSessionDialogProps & {
  sessionId: string;
  sessionName?: string;
};

/**
 * Action dialog component for creating a new seating session entity.
 * @param props - Dialog properties containing initial values and callbacks.
 * @returns Rendered creation dialog component.
 */
export const CreateSeatingSessionDialog = createBaseActionDialog<
  CreateSeatingSessionDialogProps,
  ReturnType<typeof useCreateSeatingSessionForm>
>({
  title: "Nouvelle session de mise en place",
  description: "Configurez une nouvelle session d'examen ou de concours.",
  useForm: useCreateSeatingSessionForm,
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <SeatingSessionForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateSeatingSessionDialog.displayName = "CreateSeatingSessionDialog";

/**
 * Action dialog component for updating an existing seating session entity.
 * @param props - Dialog properties containing target sessionId and initial values.
 * @returns Rendered update dialog component.
 */
export const UpdateSeatingSessionDialog = createBaseActionDialog<
  UpdateSeatingSessionDialogProps,
  ReturnType<typeof useUpdateSeatingSessionForm>
>({
  title: ({ sessionName, defaultValues }: UpdateSeatingSessionDialogProps) =>
    `Modifier la session : ${sessionName ?? defaultValues?.sessionName ?? ""}`,
  description: "Mettez à jour les paramètres de la session de placement.",
  useForm: (config) =>
    useUpdateSeatingSessionForm({
      ...config,
      sessionId: config?.sessionId,
    }),
  form({ formId, onSubmit, defaultValues }, { sessionId: id }): ReactNode {
    return (
      <SeatingSessionForm
        formId={formId}
        onSubmit={(data, helpers) => onSubmit({ data, id }, helpers as any)}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateSeatingSessionDialog.displayName = "UpdateSeatingSessionDialog";

/**
 * Action dialog component for confirming and executing seating session deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteSeatingSessionDialog = createDeleteActionDialog({
  title: "Supprimer la session ?",
  description:
    "Cette action est irréversible. Toutes les assignations de places et les plans de salle liés à cette session seront définitivement perdus.",
  errorMessage: "Erreur lors de la suppression de la session:",
  useDeleteForm: useDeleteSeatingSessionForm,
});

DeleteSeatingSessionDialog.displayName = "DeleteSeatingSessionDialog";
