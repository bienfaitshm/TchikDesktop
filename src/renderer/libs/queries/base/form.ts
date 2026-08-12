import { useCallback, useId, useRef } from "react";
import {
  useQueryClient,
  type MutationKey,
  type UseMutationResult,
} from "@tanstack/react-query";
import type { FieldValues } from "react-hook-form";
import type {
  BaseFormProps,
  BaseMutationConfig,
  FormSubmitHandler,
  QueryUpdatePayload,
} from "./types";
import { withNotifications } from "@/renderer/libs/notifications";

/** Notification configuration defining standard success and error messages. */
export type NotificationConfig = {
  success: { title: string; description?: string };
  error: { title: string; description?: string };
};

/** Resolver type accepting either a static notification object or a factory function. */
export type NotificationResolver<T = void> =
  NotificationConfig | ((data?: T) => NotificationConfig);

/**
 * Normalizes static or functional notification configurations into a unified getter function.
 * @param notification - Static configuration or factory function.
 * @returns A uniform getter function returning NotificationConfig.
 */
function resolveNotificationGetter<T>(
  notification?: NotificationResolver<T>,
): (data?: T) => NotificationConfig {
  return (data?: T) => {
    if (typeof notification === "function") {
      return notification(data);
    }
    return (
      notification ?? {
        success: { title: "" },
        error: { title: "" },
      }
    );
  };
}

/**
 * Base hook providing unique accessibility IDs and query cache invalidation utilities.
 * @template TData - Expected response payload type from the mutation.
 * @param config - Mutation key and success callback options.
 * @returns An object containing a unique form ID and cache invalidation callback.
 */
export function useFormBase<TData = unknown>(
  config?: BaseMutationConfig<TData>,
) {
  const formId = useId();
  const queryClient = useQueryClient();
  const configRef = useRef(config);
  configRef.current = config;

  const notifyAndInvalidate = useCallback(
    (data?: TData) => {
      const currentConfig = configRef.current;

      if (currentConfig?.mutationKey) {
        queryClient.invalidateQueries({ queryKey: currentConfig.mutationKey });
      }

      currentConfig?.onSuccess?.(data as TData);
    },
    [queryClient],
  );

  return {
    formId,
    notifyAndInvalidate,
  };
}

/** Parameters required by the `useFormBaseNotify` hook. */
export interface UseBaseParams<
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData = unknown,
  TError = Error,
> {
  mutation: UseMutationResult<TReturnData, TError, TMutateInput, unknown>;
  config?: BaseMutationConfig<TReturnData>;
  getNotifications: (data: TFormData) => NotificationConfig;
  adaptData?: (formData: TFormData) => TMutateInput;
  onSuccess?: (data: TReturnData) => void;
}

/**
 * Binds React Hook Form submission logic to a React Query mutation with UI notifications.
 * @template TFormData - Form values structure.
 * @template TMutateInput - Payload expected by the mutation function.
 * @template TReturnData - Response payload returned by the mutation.
 * @template TError - Mutation error type.
 * @param params - Configuration including mutation instance, data mapper, and notifications.
 * @returns Object providing formId, onSubmit handler, and submission state.
 */
export function useFormBaseNotify<
  TFormData extends FieldValues,
  TMutateInput,
  TReturnData = unknown,
  TError = Error,
>({
  mutation,
  config,
  getNotifications,
  adaptData = (data) => data as unknown as TMutateInput,
  onSuccess,
}: UseBaseParams<TFormData, TMutateInput, TReturnData, TError>) {
  const { formId, notifyAndInvalidate } = useFormBase<TReturnData>(config);

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
            helpers?.reset();
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

/** Parameters required by the `useFormBaseDelete` hook. */
export type FormBaseDeleteParams = {
  config?: BaseMutationConfig<void>;
  getNotifications?: NotificationResolver<string>;
  useDelete: () => UseMutationResult<void, Error, string, unknown> & {
    readonly mutationKey?: MutationKey;
  };
};

/**
 * Hook managing entity deletion workflows with UI notification support.
 * @param params - Delete hook accessor, notification resolvers, and mutation options.
 * @returns Object containing deletion status and execution handler.
 */
export function useFormBaseDelete({
  useDelete,
  config,
  getNotifications,
}: FormBaseDeleteParams) {
  const mutation = useDelete();
  const { notifyAndInvalidate } = useFormBase<void>(config);
  const resolveNotifications = resolveNotificationGetter(getNotifications);

  const onDelete = useCallback(
    async (id: string, value?: string) => {
      return mutation.mutateAsync(
        id,
        withNotifications({
          notifications: resolveNotifications(value),
          onSuccess: () => {
            notifyAndInvalidate();
          },
        }),
      );
    },
    [mutation, notifyAndInvalidate, resolveNotifications],
  );

  return {
    isDeleting: mutation.isPending,
    onDelete,
  };
}

/** Parameters required by the `useFormBaseCreate` hook. */
export type FormBaseCreateParams<TCreate extends FieldValues> = {
  config?: BaseMutationConfig<TCreate>;
  notification?: NotificationResolver<TCreate>;
  useCreate: (config?: BaseMutationConfig<TCreate>) => UseMutationResult<
    TCreate,
    Error,
    TCreate,
    unknown
  > & {
    readonly mutationKey?: MutationKey;
  };
};

/**
 * Specialized form hook for entity creation operations.
 * @template TCreate - Created entity data shape.
 * @param params - Creation hook accessor, notification configs, and base options.
 * @returns Standard form properties suitable for form integration.
 */
export function useFormBaseCreate<TCreate extends FieldValues>({
  useCreate,
  config,
  notification,
}: FormBaseCreateParams<TCreate>): BaseFormProps<TCreate> {
  const mutation = useCreate(config);
  const getNotifications = resolveNotificationGetter(notification);

  return useFormBaseNotify<TCreate, TCreate, TCreate>({
    mutation,
    config,
    getNotifications,
  });
}

/** Parameters required by the `useFormBaseUpdate` hook. */
export type FormBaseUpdateParams<TUpdate> = {
  id?: string;
  config?: BaseMutationConfig<TUpdate>;
  notification?: NotificationResolver<QueryUpdatePayload<TUpdate>>;
  useUpdate: (config?: BaseMutationConfig<TUpdate>) => UseMutationResult<
    TUpdate,
    Error,
    QueryUpdatePayload<TUpdate>,
    unknown
  > & {
    readonly mutationKey?: MutationKey;
  };
};

/**
 * Specialized form hook for entity update operations with automatic ID integration.
 * @template TUpdate - Target record type.
 * @param params - Update hook accessor, target record ID, and configuration parameters.
 * @returns Standard form properties for update forms.
 */
export function useFormBaseUpdate<TUpdate>({
  id,
  notification,
  useUpdate,
  config,
}: FormBaseUpdateParams<TUpdate>): BaseFormProps<QueryUpdatePayload<TUpdate>> {
  const mutation = useUpdate(config);

  const adaptData = useCallback(
    ({
      data,
      id: payloadId,
    }: QueryUpdatePayload<TUpdate>): QueryUpdatePayload<TUpdate> => ({
      id: payloadId ?? id ?? "",
      data,
    }),
    [id],
  );

  return useFormBaseNotify<
    QueryUpdatePayload<TUpdate>,
    QueryUpdatePayload<TUpdate>,
    TUpdate
  >({
    mutation,
    config,
    getNotifications: resolveNotificationGetter(notification),
    adaptData,
  });
}

/**
 * Wraps an update submission handler to merge an external entity ID into the form payload.
 * @template TUpdate - Form field values type.
 * @param onSubmit - Payload-based submit handler.
 * @param id - External entity unique identifier.
 * @returns Wrapped submit handler accepting form fields directly.
 */
export function wrapUpdateFunc<TUpdate extends FieldValues>(
  onSubmit: FormSubmitHandler<QueryUpdatePayload<TUpdate>>,
  id: string,
): FormSubmitHandler<TUpdate> {
  return (data, helpers) => onSubmit({ data, id }, helpers as any);
}
