import { useCallback, useId, useMemo } from "react";
import type {
  DefaultValues,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { ZodSchema } from "zod";
import { useZodForm as useForm } from "@/packages/use-zod-form";
import { type QueryKey, useQueryClient } from "@tanstack/react-query";

export type FormSubmitHelpers<TFieldValues extends FieldValues> = {
  reset: (values?: DefaultValues<TFieldValues>) => void;
};

export type FormSubmitHandler<TFieldValues extends FieldValues> = (
  data: TFieldValues,
  helpers: FormSubmitHelpers<TFieldValues>,
) => void | Promise<void>;

export type BaseFormProps<TFieldValues extends FieldValues> = {
  formId?: string;
  initialValues?: DefaultValues<TFieldValues>;
  onSubmit?: FormSubmitHandler<TFieldValues>;
};

export interface UseZodFormConfig<TFieldValues extends FieldValues> {
  schema: ZodSchema<TFieldValues>;
  defaultValues: DefaultValues<TFieldValues>;
  initialValues?: DefaultValues<TFieldValues>;
  onSubmit?: FormSubmitHandler<TFieldValues>;
}

export type UseZodFormReturn<TFieldValues extends FieldValues> =
  UseFormReturn<TFieldValues> & {
    submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
    isSubmitting: boolean;
  };

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
