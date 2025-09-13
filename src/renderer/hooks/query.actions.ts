import { TEnrolement, TQuickEnrolementInsert } from "@/commons/types/services";
import { useCreateQuickEnrolement } from "@/renderer/libs/queries/enrolement";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useCallback } from "react";

export const useQuickEnrollement = (params?: {
  onSuccess?(data: TEnrolement): void;
}) => {
  const quickEnrolementMutation = useCreateQuickEnrolement();

  const onSubmit = useCallback((value: TQuickEnrolementInsert) => {
    quickEnrolementMutation.mutate(
      value,
      createMutationCallbacksWithNotifications({
        onSuccess: params?.onSuccess,
      })
    );
  }, []);

  return { quickEnrolementMutation, onSubmit };
};
