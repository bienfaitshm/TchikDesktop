import { useCallback, useId } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import {
  useCreateSeatingSession,
  useUpdateSeatingSession,
  useDeleteSeatingSession,
} from "@/renderer/libs/queries/seating";
import { SeatingSessionCreateSchema } from "@/packages/@core/data-access/schema-validations";
import { TQueryUpdate } from "@/renderer/libs/queries/type";
import type { BaseFormProps } from "./base-form";
import { z } from "zod";

export type SeatingSessionData = z.infer<typeof SeatingSessionCreateSchema>;

interface UseSeatingSessionFormConfig {
  mutationKeys?: unknown[];
  onSuccess?: (data?: any) => void;
  keepDirtyOnSuccess?: boolean;
}

/**
 * Hook de base optimisé
 */
export function useSeatingSessionFormBase(
  config?: UseSeatingSessionFormConfig,
) {
  const formId = useId();
  const queryClient = useQueryClient();

  const handleSuccess = useCallback(
    (data: any, helpers?: any) => {
      if (config?.mutationKeys) {
        queryClient.invalidateQueries({ queryKey: config.mutationKeys });
      }

      config?.onSuccess?.(data);

      if (!config?.keepDirtyOnSuccess) {
        helpers?.reset?.();
      }
    },
    [queryClient, config],
  );

  return { formId, handleSuccess };
}

/**
 * CRÉATION : Focus sur la clarté et le feedback immédiat
 */
export function useCreateSeatingSessionForm(
  config?: UseSeatingSessionFormConfig,
) {
  const { formId, handleSuccess } = useSeatingSessionFormBase(config);
  const mutation = useCreateSeatingSession();

  const createSeatingSession: BaseFormProps<SeatingSessionData>["onSubmit"] =
    useCallback(
      (data, helpers) => {
        mutation.mutate(
          data,
          createMutationCallbacksWithNotifications({
            successMessageTitle: "Session créée !",
            successMessageDescription: `La session "${data.sessionName}" est maintenant disponible.`,
            errorMessageTitle: "Erreur lors de la création",
            onSuccess: (res) => handleSuccess(res, helpers),
          }),
        );
      },
      [mutation, handleSuccess],
    );

  return {
    formId,
    onSubmit: createSeatingSession,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * MISE À JOUR : Gestion de l'ID et feedback précis
 */
export function useUpdateSeatingSessionForm(
  config?: UseSeatingSessionFormConfig,
) {
  const { formId, handleSuccess } = useSeatingSessionFormBase({
    keepDirtyOnSuccess: true,
    ...config,
  });
  const mutation = useUpdateSeatingSession();

  const updateSeatingSession: BaseFormProps<
    TQueryUpdate<SeatingSessionData>
  >["onSubmit"] = useCallback(
    ({ data, id }, helpers) => {
      mutation.mutate(
        { data, id },
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Mise à jour réussie",
          successMessageDescription: `Les changements sur "${data.sessionName}" ont été enregistrés.`,
          onSuccess: (res) => handleSuccess(res, helpers),
        }),
      );
    },
    [mutation, handleSuccess],
  );

  return {
    formId,
    onSubmit: updateSeatingSession,
    isLoading: mutation.isPending,
  };
}

/**
 * SUPPRESSION : Ajout d'une gestion de promesse pour les modales de confirmation
 */
export function useDeleteSeatingSessionForm(
  config?: UseSeatingSessionFormConfig,
) {
  const queryClient = useQueryClient();
  const mutation = useDeleteSeatingSession();

  const deleteSeatingSession = useCallback(
    async (id: string, name?: string) => {
      return mutation.mutateAsync(
        id,
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Session supprimée",
          successMessageDescription: name
            ? `"${name}" a été retirée.`
            : "La session a été supprimée.",
          onSuccess: () => {
            if (config?.mutationKeys) {
              queryClient.invalidateQueries({ queryKey: config.mutationKeys });
            }
            config?.onSuccess?.();
          },
        }),
      );
    },
    [mutation, config, queryClient],
  );

  return {
    deleteSeatingSession,
    isDeleting: mutation.isPending,
  };
}
