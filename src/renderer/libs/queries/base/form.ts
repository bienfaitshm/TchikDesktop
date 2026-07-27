import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useId, useRef, useEffect } from "react";
import type { BaseFormProps, BaseMutationConfig } from "./types";
import { type UseMutationResult } from "@tanstack/react-query";
import { withNotifications } from "@/renderer/libs/notifications";
import type { FieldValues } from "react-hook-form";

export type NotificationConfig = {
  success: { title: string; description?: string };
  error: { title: string; description?: string };
};

/**
 * Base hook providing common form state mechanisms, such as unique IDs and Query Client cache invalidation.
 * @template TData - The expected response data type from the mutation.
 * @param config - Optional configuration object containing mutation key and success callback.
 * @returns Object containing a unique formId and a memoized notification/invalidation callback.
 */
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

export interface UseBaseParams<
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData = unknown,
  TError = Error,
> {
  mutation: UseMutationResult<TReturnData, TError, TMutateInput, unknown>;
  config?: BaseMutationConfig<TReturnData>;
  getNotifications: (data: TFormData) => NotificationConfig;
  adaptData: (formData: TFormData) => TMutateInput;
  onSuccess?: (data: TReturnData) => void;
}

/**
 * Higher-level form hook binding React Hook Form submission handlers to React Query mutations with UI notifications.
 * @template TFormData - The form field values structure.
 * @template TMutateInput - The variable structure required by the mutation.
 * @template TReturnData - The data type returned by the mutation response.
 * @template TError - The error type thrown by the mutation.
 * @param params - Parameters object containing mutation instance, data adapters, and notification resolvers.
 * @returns Object exposing formId, submission handler, and submission pending state.
 */
export function useFormBaseNotify<
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData extends FieldValues = {},
  TError = Error,
>({
  mutation,
  config,
  getNotifications,
  adaptData,
  onSuccess,
}: UseBaseParams<TFormData, TMutateInput, TReturnData, TError>) {
  const { formId, notifyAndInvalidate } = useFormBase<TReturnData>(config);

  const onSubmit: BaseFormProps<TFormData, TReturnData>["onSubmit"] =
    useCallback(
      (data, helpers) => {
        const input = adaptData(data);
        const notificationsConfig = getNotifications(data);

        mutation.mutate(
          input,
          withNotifications({
            notifications: notificationsConfig,
            onSuccess: (res) => {
              notifyAndInvalidate(res);
              helpers.reset(res);
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
