import type { ReactNode } from "react";
import { LocalRoomForm } from "@/renderer/components/form/seatings/local-rooms-form";
import {
  useCreateLocalRoomForm,
  useDeleteLocalRoomForm,
  useUpdateLocalRoomForm,
  type LocalRoomFormConfig,
  type LocalRoomFormData,
} from "@/renderer/libs/queries/seatings";
import {
  createBaseActionDialog,
  createDeleteActionDialog,
  type ActionDialogProps,
} from "./base.dialog-actions";

export type LocalRoomDialogProps = ActionDialogProps<
  LocalRoomFormData,
  LocalRoomFormConfig
>;

export type CreateLocalRoomDialogProps = LocalRoomDialogProps;

export type UpdateLocalRoomDialogProps = LocalRoomDialogProps & {
  localroomId: string;
  name?: string;
};

/**
 * Action dialog component for creating a new physical local room.
 * @param props - Dialog properties containing initial values and callbacks.
 * @returns Rendered creation dialog component.
 */
export const CreateLocalRoomDialog = createBaseActionDialog<
  CreateLocalRoomDialogProps,
  ReturnType<typeof useCreateLocalRoomForm>
>({
  title: "Créer un local",
  description:
    "Configurez un nouveau local physique (salle, amphithéâtre) pour organiser vos sessions de placement.",
  useForm: useCreateLocalRoomForm,
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <LocalRoomForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

CreateLocalRoomDialog.displayName = "CreateLocalRoomDialog";

/**
 * Action dialog component for updating an existing physical local room.
 * @param props - Dialog properties containing target localroomId and initial values.
 * @returns Rendered update dialog component.
 */
export const UpdateLocalRoomDialog = createBaseActionDialog<
  UpdateLocalRoomDialogProps,
  ReturnType<typeof useUpdateLocalRoomForm>
>({
  title: ({ name, defaultValues }: UpdateLocalRoomDialogProps) =>
    `Modifier le local : ${name ?? defaultValues?.name ?? ""}`,
  description:
    "Modifiez la capacité ou les dimensions du local. Ces changements affecteront les futurs placements.",
  useForm: (config) =>
    useUpdateLocalRoomForm({
      ...config,
      localroomId: config.localroomId,
    }),
  form({ formId, onSubmit, defaultValues }): ReactNode {
    return (
      <LocalRoomForm
        formId={formId}
        onSubmit={onSubmit}
        defaultValues={defaultValues}
      />
    );
  },
});

UpdateLocalRoomDialog.displayName = "UpdateLocalRoomDialog";

/**
 * Action dialog component for confirming and executing local room deletion.
 * @returns Rendered delete confirmation dialog component.
 */
export const DeleteLocalRoomDialog = createDeleteActionDialog({
  title: "Supprimer le local",
  description:
    "Attention : la suppression de ce local annulera toutes les assignations de places qui lui sont liées dans les sessions actives.",
  errorMessage: "Erreur lors de la suppression du local:",
  useDeleteForm: useDeleteLocalRoomForm,
});

DeleteLocalRoomDialog.displayName = "DeleteLocalRoomDialog";
