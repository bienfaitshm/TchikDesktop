"use client";

import { useId, useCallback, useEffect, useRef } from "react";
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

/**
 * Helper object passed to submission handlers containing reset actions.
 * @template TFieldValues - Type structure of the form fields.
 */
export interface FormSubmitHelpers<TFieldValues extends FieldValues> {
  /** Function to reset form fields to new or default values. */
  reset: UseFormReset<TFieldValues>;
}

/**
 * Async or sync submit handler type receiving validated form data and helpers.
 * @template TFieldValues - Type structure of the form fields.
 */
export type FormSubmitHandler<TFieldValues extends FieldValues> = (
  data: TFieldValues,
  helpers?: FormSubmitHelpers<TFieldValues>,
) => void | Promise<void>;

/**
 * Base properties required by form components.
 * @template DefaultValue - Initial default values shape.
 * @template TFormData - Resulting form data shape.
 */
export interface BaseFormProps<
  DefaultValue extends FieldValues,
  TFormData extends FieldValues = DefaultValue,
> {
  /** Optional HTML form element identifier. */
  formId?: string;
  /** Fallback default values for form fields. */
  defaultValues?: DefaultValues<DefaultValue>;
  /** Callback triggered upon valid form submission. */
  onSubmit: FormSubmitHandler<TFormData>;
}

/**
 * Metadata configuration for React Query mutation operations.
 */
export interface MutationMetadata {
  /** Optional key used by React Query to identify the mutation. */
  mutationKey?: MutationKey;
}

/**
 * Enhanced React Query mutation result decorated with metadata.
 * @template TData - Type of data returned by the mutation.
 * @template TError - Type of error thrown by the mutation.
 * @template TVariables - Variables accepted by the mutation.
 * @template TContext - Mutation context type.
 */
export type EnhancedMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
> = UseMutationResult<TData, TError, TVariables, TContext> & MutationMetadata;

/**
 * Base configuration options for mutation execution.
 * @template TData - Type of data returned upon success.
 */
export interface BaseMutationConfig<TData = unknown> {
  /** Key identifying the mutation query. */
  mutationKey?: MutationKey;
  /** Callback triggered upon successful mutation execution. */
  onSuccess?: (data: TData) => void | Promise<void>;
}

/**
 * Configuration options for the `useZodForm` custom hook.
 * @template TFieldValues - Type structure of the form fields.
 */
export interface UseZodFormConfig<TFieldValues extends FieldValues> {
  /** Zod validation schema. */
  schema: z.ZodType<TFieldValues, TFieldValues>;
  /** Default field values to populate initially. */
  defaultValues?: DefaultValues<TFieldValues>;
  /** Custom submission callback logic. */
  onSubmit?: FormSubmitHandler<TFieldValues>;
}

/**
 * Custom hook integrating React Hook Form with Zod schema validation.
 * @param config - Options including schema, default values, and submission handler.
 * @returns Form controller instance with enhanced submit handler and status.
 */
export function useZodForm<TFieldValues extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
}: UseZodFormConfig<TFieldValues>): UseZodFormReturn<TFieldValues> & {
  isSubmitting: boolean;
} {
  const form = useForm({
    schema,
    defaultValues,
    shouldUnregister: true,
  });

  const onSubmitRef = useRef(onSubmit);

  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const submit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      await form.handleSubmit(
        async (values) => {
          if (!onSubmitRef.current) return;
          console.log("Avec form.getValues", form.getValues());
          console.log("Avec le valeur de form.handleSubmit", values);
          await onSubmitRef.current(values, {
            reset: (nextValues) => {
              form.reset(nextValues ?? defaultValues);
            },
          });
        },
        (errors) => {
          console.log("Errors", errors);
        },
      )(e);
    },
    [form, defaultValues],
  );

  return {
    ...form,
    submit,
    isSubmitting: form.formState.isSubmitting,
  };
}

/**
 * Configuration for the `useFormBase` hook.
 * @template TData - Data shape expected by the success callback.
 */
export interface UseFormBaseConfig<TData> {
  /** Optional success handler called when form operations succeed. */
  onSuccess?: (data: TData) => void | Promise<void>;
}

/**
 * Returns baseline form state utilities including unique IDs and success callbacks.
 * @param config - Configuration containing operational callbacks.
 * @returns Object containing the unique formId and memoized handleSuccess callback.
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
 * Shallow merges default and initial values, giving priority to initial values.
 * @param initialValues - Initial form field values.
 * @param defaultValues - Fallback default field values.
 * @returns Shallowly merged object prioritizing initialValues.
 */
export function mergeDefaultValues<T extends FieldValues>(
  initialValues: DefaultValues<T> | undefined,
  defaultValues: DefaultValues<T> | undefined,
): Partial<T> {
  return {
    ...(defaultValues ?? {}),
    ...(initialValues ?? {}),
  } as Partial<T>;
}

/**
 * Deeply merges default and initial form values using deep merge utility.
 * @param initialValues - Initial nested form field values.
 * @param defaultValues - Fallback default nested field values.
 * @returns Deeply merged partial object.
 */
export function mergeDefaultValuesDeep<T extends FieldValues>(
  initialValues?: DefaultValues<T> | undefined,
  defaultValues?: DefaultValues<T> | undefined,
): DefaultValues<T> {
  return merge(defaultValues ?? {}, initialValues ?? {}) as DefaultValues<T>;
}

/**
 * Flattened error representation containing target path and message.
 */
export interface FlatError {
  /** Dot-notation object path to the field in error. */
  path: string;
  /** Error message describing validation failure. */
  message: string;
  /** React Hook Form error classification type. */
  type: string;
}

/**
 * Recursively flattens React Hook Form field errors into an array.
 * @param errors - Nested field errors object.
 * @param parentPath - Accumulator string for nested object keys.
 * @returns Array of flat error objects with complete paths.
 */
export function getFormErrors(
  errors: FieldErrors,
  parentPath = "",
): FlatError[] {
  const extractedErrors: FlatError[] = [];

  for (const key in errors) {
    if (!Object.prototype.hasOwnProperty.call(errors, key)) continue;

    const currentError = errors[key];
    if (!currentError) continue;

    const currentPath = parentPath ? `${parentPath}.${key}` : key;

    if ("message" in currentError && typeof currentError.message === "string") {
      const error = currentError as FieldError;
      extractedErrors.push({
        path: currentPath,
        message: error.message ?? "No message",
        type: String(error.type),
      });
    } else {
      extractedErrors.push(
        ...getFormErrors(currentError as FieldErrors, currentPath),
      );
    }
  }

  return extractedErrors;
}
