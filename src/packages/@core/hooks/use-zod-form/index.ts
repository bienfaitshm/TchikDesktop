"use client";

import { useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  UseFormProps,
  UseFormReturn,
  SubmitHandler,
} from "react-hook-form";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * Props étendues de useForm.
 * On exclut 'resolver' car on l'injecte nous-mêmes via le schéma.
 */
export interface UseZodFormProps<TSchema extends z.ZodType<any, any>>
  extends Omit<UseFormProps<z.infer<TSchema>>, "resolver"> {
  /**
   * Le schéma de validation Zod.
   * Accepte ZodObject, ZodEffects (refine), etc.
   */
  schema: TSchema;

  /**
   * Handler optionnel pour la soumission valide.
   * Permet d'encapsuler la logique de soumission directement dans le hook.
   */
  onSubmit?: SubmitHandler<z.infer<TSchema>>;
}

/**
 * Type de retour combinant les méthodes de RHF et notre handler custom.
 */
export interface UseZodFormReturn<TSchema extends z.ZodType<any, any>>
  extends UseFormReturn<z.infer<TSchema>> {
  /**
   * Fonction de soumission wrapper qui exécute la validation
   * et appelle la prop onSubmit si elle est définie.
   */
  submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

// -----------------------------------------------------------------------------
// Hook Implementation
// -----------------------------------------------------------------------------

/**
 * Wrapper professionnel autour de react-hook-form et zod.
 * Simplifie l'intégration du resolver et offre une meilleure inférence de types.
 *
 * @template TSchema - Le type du schéma Zod.
 * @param {UseZodFormProps<TSchema>} props - Les options de configuration.
 * @returns {UseZodFormReturn<TSchema>} L'instance du formulaire et le handler de soumission.
 *
 * @example
 * const schema = z.object({ name: z.string().min(2) });
 * const { register, submit, formState } = useZodForm({
 * schema,
 * onSubmit: (data) => console.log(data),
 * });
 */
export function useZodForm<TSchema extends z.ZodType<any, any>>({
  schema,
  onSubmit,
  mode = "onSubmit",
  ...formProps
}: UseZodFormProps<TSchema>): UseZodFormReturn<TSchema> {
  // Initialisation du formulaire avec le resolver Zod
  const methods = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    mode,
    ...formProps,
  });

  // Mémorisation du handler pour éviter des re-render inutiles si passé en prop
  const submit = useCallback(
    methods.handleSubmit((data) => {
      if (onSubmit) {
        onSubmit(data);
      }
    }),
    [methods.handleSubmit, onSubmit]
  );

  return {
    ...methods,
    submit,
  };
}
