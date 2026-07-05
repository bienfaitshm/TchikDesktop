import { useCallback } from "react";
import {
  useCreateFeeAssignment,
  useUpdateFeeAssignment,
  useDeleteFeeAssignment,
} from "./finances";
import { useFormBaseNotify } from "../base";
import { withNotifications } from "@/renderer/libs/notifications";
import type {
  FeeAssignment,
  FeeAssignmentCreate,
  FeeAssignmentUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type { BaseMutationConfig, QueryUpdatePayload } from "../base";
import { useFormBase } from "../base";

export function useCreateFeeAssignmentForm(
  config?: BaseMutationConfig<FeeAssignment>,
) {
  const mutation = useCreateFeeAssignment();
  return useFormBaseNotify<FeeAssignmentCreate, FeeAssignmentCreate>({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Attribution créée",
        description: "L'attribution de frais a été enregistrée.",
      },
      error: { title: "Erreur lors de la création de l'attribution." },
    }),
    adaptData: (data) => data,
  });
}

export function useUpdateFeeAssignmentForm(
  config?: BaseMutationConfig<FeeAssignment>,
) {
  const mutation = useUpdateFeeAssignment();
  return useFormBaseNotify<
    QueryUpdatePayload<FeeAssignmentUpdate>,
    { data: FeeAssignmentUpdate; id: string }
  >({
    mutation,
    config,
    getNotifications: () => ({
      success: {
        title: "Attribution mise à jour",
        description: "L'attribution a été modifiée avec succès.",
      },
      error: { title: "Échec de la mise à jour de l'attribution." },
    }),
    adaptData: ({ data, id }) => ({ data, id }),
  });
}

export function useDeleteFeeAssignmentForm(config?: BaseMutationConfig<void>) {
  const { notifyAndInvalidate } = useFormBase(config);
  const mutation = useDeleteFeeAssignment();

  const deleteFeeAssignment = useCallback(
    (assignmentId: string, studentName?: string) => {
      mutation.mutate(
        assignmentId,
        withNotifications({
          notifications: {
            success: {
              title: "Attribution supprimée",
              description: studentName
                ? `L'attribution de ${studentName} a été supprimée.`
                : "L'attribution a été supprimée.",
            },
          },
          onSuccess: () => {
            notifyAndInvalidate(undefined as void);
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate],
  );

  return {
    deleteFeeAssignment,
    isDeleting: mutation.isPending,
  };
}
