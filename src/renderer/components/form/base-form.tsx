import { useCallback, useId, useMemo } from "react";
import type { DefaultValues, FieldValues, UseFormReset } from "react-hook-form";
import {
  useZodForm as useForm,
  UseZodFormReturn,
} from "@/packages/use-zod-form";
import { type QueryKey, useQueryClient } from "@tanstack/react-query";

import type { MutationKey, UseMutationResult } from "@tanstack/react-query";

export type QueryUpdatePayload<TData, TId = string> = {
  id: TId;
  data: Partial<TData>;
};

export type QueryCreatePayload<
  TData,
  TParams = undefined,
> = TParams extends undefined
  ? { data: TData }
  : { params: TParams; data: TData };

export interface FormSubmitHelpers<TFieldValues extends FieldValues> {
  reset: UseFormReset<TFieldValues>;
}

export type FormSubmitHandler<TFieldValues extends FieldValues> = (
  data: TFieldValues,
  helpers: FormSubmitHelpers<TFieldValues>,
) => void | Promise<void>;

export interface BaseFormProps<TFieldValues extends FieldValues> {
  formId?: string;
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit: FormSubmitHandler<TFieldValues>;
}

export interface MutationMetadata {
  mutationKey?: MutationKey;
}

export type EnhancedMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = UseMutationResult<TData, TError, TVariables, TContext> & MutationMetadata;

export interface BaseMutationConfig<TData = unknown> {
  mutationKey?: MutationKey;
  onSuccess?: (data: TData) => void | Promise<void>;
}

export function useZodForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  initialValues,
  onSubmit,
}: UseZodFormConfig<TFieldValues>): UseZodFormReturn<TFieldValues> {
  const mergedDefaultValues = useMemo(() => {
    return {
      ...defaultValues,
      ...initialValues,
    };
  }, [JSON.stringify(defaultValues), JSON.stringify(initialValues)]);

  const form = useForm({
    schema: schema,
    defaultValues: mergedDefaultValues,
    shouldUnregister: false,
  });

  const submit = useMemo(() => {
    return form.handleSubmit(async (values) => {
      if (!onSubmit) return;

      await onSubmit(values, {
        reset: (nextValues) => {
          form.reset(nextValues ?? mergedDefaultValues);
        },
      });
    });
  }, [form, onSubmit, mergedDefaultValues]);

  return {
    ...form,
    submit,
    isSubmitting: form.formState.isSubmitting,
  };
}

export interface UseFormBaseConfig<TData> {
  /** Les clés de requêtes à invalider automatiquement en cas de succès */
  queryKeysToInvalidate?: QueryKey;
  /** Callback optionnel exécuté après la soumission réussie du formulaire */
  onSuccess?: (data: TData) => void;
}

/**
 * @description Hook de base pour centraliser la logique commune des formulaires (ID unique et gestion du cache).
 */
export function useFormBase<TData = unknown>(
  config?: UseFormBaseConfig<TData>,
) {
  const formId = useId();
  const queryClient = useQueryClient();

  const onSuccessCallback = config?.onSuccess;
  const queryKey = config?.queryKeysToInvalidate;

  const handleSuccess = useCallback(
    (data: TData) => {
      queryClient.invalidateQueries({ queryKey });
      onSuccessCallback?.(data);
    },
    [queryClient, onSuccessCallback],
  );

  return {
    formId,
    handleSuccess,
  };
}
