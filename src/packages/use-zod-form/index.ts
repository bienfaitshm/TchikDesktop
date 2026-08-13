"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
  type SubmitHandler,
  FieldValues,
} from "react-hook-form";
import type { z } from "zod";

/**
 * Props étendues de useForm basées directement sur la forme du schéma Zod.
 */
export interface UseZodFormProps<TSchema extends FieldValues> extends Omit<
  UseFormProps<TSchema>,
  "resolver"
> {
  /**
   * Le schéma de validation Zod (ZodObject, ZodEffects, etc.).
   */
  schema: z.ZodType<TSchema>;

  /**
   * Handler de soumission typé automatiquement selon le schéma Zod.
   */
  onSubmit?: SubmitHandler<TSchema>;
}

/**
 * Type de retour combinant les méthodes de RHF et notre handler de soumission.
 */
export interface UseZodFormReturn<
  TSchema extends FieldValues,
> extends UseFormReturn<TSchema> {
  /**
   * Fonction de soumission qui encapsule handleSubmit de RHF.
   */
  submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

/**
 * Wrapper de production combinant react-hook-form et zod avec une inférence stricte.
 * Le schéma Zod est la source unique de vérité pour le typage.
 *
 * @template TSchema - Le schéma Zod hérité.
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
  onSubmitRef.current = onSubmit;

  const submit = React.useMemo(() => {
    return methods.handleSubmit(async (data, event) => {
      if (onSubmitRef.current) {
        await onSubmitRef.current(data, event);
      }
    });
  }, [methods.handleSubmit]);

  return {
    ...methods,
    submit,
  };
}
