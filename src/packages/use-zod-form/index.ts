"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  type UseFormProps,
  type UseFormReturn,
  type SubmitHandler,
} from "react-hook-form";
import type { z } from "zod";

/**
 * Props étendues de useForm basées directement sur la forme du schéma Zod.
 */
export interface UseZodFormProps<
  TSchema extends z.ZodType<any, any, any>,
> extends Omit<UseFormProps<z.output<TSchema>>, "resolver"> {
  /**
   * Le schéma de validation Zod (ZodObject, ZodEffects, etc.).
   */
  schema: TSchema;

  /**
   * Handler de soumission typé automatiquement selon le schéma Zod.
   */
  onSubmit?: SubmitHandler<z.output<TSchema>>;
}

/**
 * Type de retour combinant les méthodes de RHF et notre handler de soumission.
 */
export interface UseZodFormReturn<
  TSchema extends z.ZodType<any, any, any>,
> extends UseFormReturn<z.output<TSchema>> {
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
export function useZodForm<TSchema extends z.ZodType<any, any, any>>({
  schema,
  onSubmit,
  mode = "onSubmit",
  ...formProps
}: UseZodFormProps<TSchema>): UseZodFormReturn<TSchema> {
  const methods = useForm<z.output<TSchema>>({
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
