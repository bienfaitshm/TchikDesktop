"use client";

import * as React from "react";
import { useId, useCallback, useMemo } from "react";
import type { DefaultValues, FieldValues, UseFormReset } from "react-hook-form";
import {
  useZodForm as useForm,
  type UseZodFormReturn,
} from "@/packages/use-zod-form";
import type { MutationKey, UseMutationResult } from "@tanstack/react-query";
import type { z } from "zod";

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

export interface UseZodFormConfig<TFieldValues extends FieldValues> {
  schema: z.Schema<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  onSubmit?: FormSubmitHandler<TFieldValues>;
}

/**
 * @description Hook étendant react-hook-form avec Zod, optimisant la stabilité des valeurs par défaut.
 */
export function useZodForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
}: UseZodFormConfig<TFieldValues>): UseZodFormReturn<
  z.ZodType<TFieldValues>
> & { isSubmitting?: boolean } {
  const form = useForm({
    schema,
    defaultValues: defaultValues,
    shouldUnregister: false,
  });

  const onSubmitRef = React.useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  const submit = useMemo(() => {
    return form.handleSubmit(async (values) => {
      if (!onSubmitRef.current) return;

      await onSubmitRef.current(values, {
        reset: (nextValues) => {
          form.reset(nextValues ?? defaultValues);
        },
      });
    });
  }, [form, defaultValues]);

  return {
    ...form,
    submit,
    isSubmitting: form.formState.isSubmitting,
  };
}

export interface UseFormBaseConfig<TData> {
  onSuccess?: (data: TData) => void | Promise<void>;
}

/**
 * @description Hook de base pour centraliser la logique commune des formulaires (ID unique et gestion du cache).
 */
export function useFormBase<TData = unknown>(
  config?: UseFormBaseConfig<TData>,
) {
  const formId = useId();

  const configRef = React.useRef(config);
  configRef.current = config;

  const handleSuccess = useCallback(async (data: TData) => {
    await configRef.current?.onSuccess?.(data);
  }, []);

  return {
    formId,
    handleSuccess,
  };
}

const isObject = (item: any): item is Record<string, any> => {
  return item && typeof item === "object" && !Array.isArray(item);
};

/**
 * Fusionne les valeurs par défaut et initiales (Shallow Merge).
 * Les valeurs initiales écrasent les valeurs par défaut.
 */
export function mergeDefaultValues<T extends Record<string, any>>(
  initialValues: Partial<T> | undefined,
  defaultValues: Partial<T> | undefined,
): Partial<T> {
  return {
    ...defaultValues,
    ...initialValues,
  } as Partial<T>;
}

/**
 * Fusionne récursivement deux objets (Deep Merge) pour éviter la perte
 * de sous-propriétés dans les formulaires complexes.
 */
export function mergeDefaultValuesDeep<T extends Record<string, any>>(
  initialValues: Partial<T> | undefined,
  defaultValues: Partial<T> | undefined,
): Partial<T> {
  if (!defaultValues) return initialValues ?? {};
  if (!initialValues) return defaultValues ?? {};

  const output = { ...defaultValues };

  if (isObject(defaultValues) && isObject(initialValues)) {
    Object.keys(initialValues).forEach((key) => {
      if (isObject(initialValues[key])) {
        if (!(key in defaultValues)) {
          Object.assign(output, { [key]: initialValues[key] });
        } else {
          output[key as keyof T] = mergeDefaultValuesDeep(
            defaultValues[key],
            initialValues[key],
          ) as any;
        }
      } else {
        Object.assign(output, { [key]: initialValues[key] });
      }
    });
  }

  return output;
}
