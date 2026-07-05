import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useId, useRef, useEffect } from "react";
import type { BaseFormProps, BaseMutationConfig } from "./types";
import { type UseMutationResult } from "@tanstack/react-query";
import { withNotifications } from "@/renderer/libs/notifications";
import type { FieldValues } from "react-hook-form";

export function useFormBase<TData = unknown>(
  config?: BaseMutationConfig<TData>,
) {
  const formId = useId();
  const queryClient = useQueryClient();
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const notifyAndInvalidate = useCallback(
    (data: TData) => {
      const currentConfig = configRef.current;

      if (currentConfig?.mutationKey) {
        queryClient.invalidateQueries({ queryKey: currentConfig.mutationKey });
      }

      currentConfig?.onSuccess?.(data);
    },
    [queryClient],
  );

  return {
    formId,
    notifyAndInvalidate,
  };
}

type NotificationConfig = {
  success: { title: string; description: string };
  error: { title: string };
};

interface UseBaseParams<TFormData extends FieldValues, TMutateInput> {
  mutation: UseMutationResult<any, any, TMutateInput, any>;
  config?: BaseMutationConfig<TFormData>;
  getNotifications: (data: TFormData) => NotificationConfig;
  adaptData: (formData: TFormData) => TMutateInput;
  onSuccess?: (data: any) => void;
}

export function useFormBaseNotify<TFormData extends FieldValues, TMutateInput>({
  mutation,
  config,
  getNotifications,
  adaptData,
  onSuccess,
}: UseBaseParams<TFormData, TMutateInput>) {
  const { formId, notifyAndInvalidate } = useFormBase(config);

  const onSubmit: BaseFormProps<TFormData>["onSubmit"] = useCallback(
    (data, helpers) => {
      const input = adaptData(data);
      const notificationsConfig = getNotifications(data);

      mutation.mutate(
        input,
        withNotifications({
          notifications: notificationsConfig,
          onSuccess: (res) => {
            notifyAndInvalidate(res);
            helpers.reset();
            onSuccess?.(res);
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate, adaptData, getNotifications, onSuccess],
  );

  return {
    formId,
    onSubmit,
    isSubmitting: mutation.isPending,
  };
}
