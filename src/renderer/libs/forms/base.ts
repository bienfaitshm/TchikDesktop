"use client";
import { useId, useCallback, useMemo, useEffect, useRef } from "react";
import { merge } from "ts-deepmerge";
import type {
  DefaultValues,
  FieldError,
  FieldErrors,
  FieldValues,
  UseFormReset,
} from "react-hook-form";
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

export interface BaseFormProps<
  DefaultValue extends FieldValues,
  TFormData extends FieldValues = DefaultValue,
> {
  formId?: string;
  defaultValues?: DefaultValues<DefaultValue>;
  onSubmit: FormSubmitHandler<TFormData>;
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
 * Custom hook integrating React Hook Form with Zod schema validation.
 * @param config - Configuration including schema, default values, and submit handler.
 * @returns Enhanced form instance including a custom submit handler and submission state.
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
    defaultValues,
    shouldUnregister: false,
  });

  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const submit = useMemo(() => {
    return form.handleSubmit(
      async (values) => {
        if (!onSubmitRef.current) return;

        await onSubmitRef.current(values, {
          reset: (nextValues) => {
            form.reset(nextValues ?? defaultValues);
          },
        });
      },
      (_errors) => {
        const errors = getFormErrors(_errors);
        console.log("[Form Errors]", errors);
      },
    );
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
 * Base hook offering common form state mechanisms such as unique IDs and success callbacks.
 * @param config - Optional configuration containing success callbacks.
 * @returns Form base state including formId and a memoized success handler.
 */
export function useFormBase<TData = unknown>(
  config?: UseFormBaseConfig<TData>,
) {
  const formId = useId();

  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const handleSuccess = useCallback(async (data: TData) => {
    await configRef.current?.onSuccess?.(data);
  }, []);

  return {
    formId,
    handleSuccess,
  };
}

/**
 * Checks whether an item is a non-array object.
 * @param item - Target item to check.
 * @returns True if the item is a valid object, false otherwise.
 */
const isObject = (item: unknown): item is Record<string, unknown> => {
  return Boolean(item) && typeof item === "object" && !Array.isArray(item);
};

/**
 * Shallow merges default and initial form values, prioritizing initial values.
 * @param initialValues - Initial values provided to the form.
 * @param defaultValues - Fallback default values.
 * @returns Merged partial object containing combined values.
 */
export function mergeDefaultValues<T extends Record<string, unknown>>(
  initialValues: Partial<T> | undefined,
  defaultValues: Partial<T> | undefined,
): Partial<T> {
  return merge({}, { ...defaultValues }, { ...initialValues }) as Partial<T>;
}

/**
 * Deeply merges default and initial form values to prevent overwriting nested objects.
 * @param initialValues - Initial values provided to the form.
 * @param defaultValues - Fallback default values.
 * @returns Deeply merged partial object.
 */
export function mergeDefaultValuesDeep<T extends Record<string, unknown>>(
  initialValues: Partial<T> | undefined,
  defaultValues: Partial<T> | undefined,
): Partial<T> {
  if (!defaultValues) return initialValues ?? {};
  if (!initialValues) return defaultValues ?? {};

  const output: Record<string, unknown> = { ...defaultValues };

  if (isObject(defaultValues) && isObject(initialValues)) {
    Object.keys(initialValues).forEach((key) => {
      const initialVal = initialValues[key];
      const defaultVal = defaultValues[key];

      if (isObject(initialVal)) {
        if (!(key in defaultValues)) {
          output[key] = initialVal;
        } else if (isObject(defaultVal)) {
          output[key] = mergeDefaultValuesDeep(
            defaultVal as Record<string, unknown>,
            initialVal as Record<string, unknown>,
          );
        }
      } else {
        output[key] = initialVal;
      }
    });
  }

  return output as Partial<T>;
}

export interface FlatError {
  path: string;
  message: string;
  type: string;
}

/**
 * Recursively flattens React Hook Form error objects into a structured array.
 * @param errors - Field errors object from React Hook Form.
 * @param parentPath - Cumulative object key path for nested errors.
 * @returns Array of flattened error objects.
 */
export function getFormErrors(
  errors: FieldErrors,
  parentPath = "",
): FlatError[] {
  let extractedErrors: FlatError[] = [];

  for (const key in errors) {
    if (!Object.prototype.hasOwnProperty.call(errors, key)) continue;

    const currentError = errors[key];
    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if (!currentError) continue;

    if ("message" in currentError && typeof currentError.message === "string") {
      const error = currentError as FieldError;
      extractedErrors.push({
        path: currentPath,
        message: error.message ?? "No message",
        type: String(error.type),
      });
    } else {
      extractedErrors = [
        ...extractedErrors,
        ...getFormErrors(currentError as FieldErrors, currentPath),
      ];
    }
  }

  return extractedErrors;
}
