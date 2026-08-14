"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
  type SubmitHandler,
  type FieldValues,
} from "react-hook-form";
import type { z } from "zod";

/**
 * Extended properties for `useZodForm`, leveraging a Zod schema as the primary source of truth.
 * @template TSchema - Generic field values type derived from the Zod schema.
 */
export interface UseZodFormProps<TSchema extends FieldValues> extends Omit<
  UseFormProps<TSchema>,
  "resolver"
> {
  /** The Zod validation schema instance. */
  schema: z.ZodType<TSchema, TSchema>;

  /** Optional typed submission handler executed upon successful form validation. */
  onSubmit?: SubmitHandler<TSchema>;
}

/**
 * Return type combining standard React Hook Form utilities with an encapsulated submit handler.
 * @template TSchema - Generic field values type derived from the Zod schema.
 */
export interface UseZodFormReturn<
  TSchema extends FieldValues,
> extends UseFormReturn<TSchema> {
  /** Ready-to-use submit handler wrapping RHF's internal handleSubmit execution. */
  submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

/**
 * Production-ready wrapper unifying react-hook-form and zod validation with strict typing.
 * @template TSchema - Inferrable schema type extending standard form field values.
 * @param props - Form configuration containing the validation schema and submit callback.
 * @returns Augmented React Hook Form controls including a simplified submit method.
 */
export function useZodForm<TSchema extends FieldValues>({
  schema,
  onSubmit,
  mode = "onSubmit",
  ...formProps
}: UseZodFormProps<TSchema>): UseZodFormReturn<TSchema> {
  const methods = useForm<TSchema>({
    ...formProps,
    resolver: zodResolver(schema),
    mode,
  });

  const onSubmitRef = React.useRef(onSubmit);

  React.useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  const submit = React.useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      await methods.handleSubmit(
        async (data, event) => {
          console.log("Avec form.getValues", methods.getValues());
          console.log("Avec le valeur de form.handleSubmit", data);
          if (onSubmitRef.current) {
            await onSubmitRef.current(data, event);
          }
        },
        (errors) => {
          console.log("Errors", errors);
        },
      )(e);
    },
    [methods],
  );

  return {
    ...methods,
    submit,
  };
}
