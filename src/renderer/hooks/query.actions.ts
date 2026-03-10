import {
  TEnrolementAttributes,
  TEnrolementQuickCreate,
} from "@/packages/@core/data-access/schema-validations";
import { useCreateQuickEnrolement } from "@/renderer/libs/queries/enrolement";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useCallback } from "react";

export const useQuickEnrollement = (params?: {
  onSuccess?(data: TEnrolementAttributes): void;
}) => {
  const quickEnrolementMutation = useCreateQuickEnrolement();

  const onSubmit = useCallback((value: TEnrolementQuickCreate) => {
    quickEnrolementMutation.mutate(
      value,
      createMutationCallbacksWithNotifications({
        onSuccess: params?.onSuccess,
      }),
    );
  }, []);

  return { quickEnrolementMutation, onSubmit };
};
