import type { EnrollmentQuickCreate } from "@/packages/@core/data-access/schema-validations";
import type { ClassroomEnrollment } from "@/packages/@core/data-access/db/schemas";
import { useCreateQuickEnrollment } from "@/renderer/libs/queries/enrollments";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useCallback } from "react";

export const useQuickEnrollement = (params?: {
  onSuccess?(data: ClassroomEnrollment): void;
}) => {
  const quickEnrolementMutation = useCreateQuickEnrollment();

  const onSubmit = useCallback((value: EnrollmentQuickCreate) => {
    quickEnrolementMutation.mutate(
      value,
      createMutationCallbacksWithNotifications({
        onSuccess: params?.onSuccess,
      }),
    );
  }, []);

  return { quickEnrolementMutation, onSubmit };
};
