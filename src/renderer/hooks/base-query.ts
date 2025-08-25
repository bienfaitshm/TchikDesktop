import { useQueryClient, UseMutationResult } from "@tanstack/react-query";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";

type SuccessCallback = () => void;

// =========================================================================
// 1. FONCTIONNALITÉ GÉNÉRIQUE ET TYPES
// =========================================================================

/**
 * @description Fonction générique pour créer un hook de gestion de ressources.
 * Inclut un onSuccessCallback pour une flexibilité maximale.
 */
export const createManagementHook = <
  TItem extends { [key: string]: any },
  TCreate extends object,
>(config: {
  itemName: string;
  queryKey: string[];
  useCreateMutation: () => UseMutationResult<TItem, Error, TCreate>;
  useUpdateMutation: () => UseMutationResult<
    TItem,
    Error,
    { id: string; data: Partial<TCreate> }
  >;
  useDeleteMutation: () => UseMutationResult<any, Error, string>;
  //   getIdKey: (item: { id: string; data: TCreate }) => string;
}) => {
  const {
    itemName,
    queryKey,
    useCreateMutation,
    useUpdateMutation,
    useDeleteMutation,
  } = config;

  return (params?: { queryKey: unknown[] }) => {
    const queryClient = useQueryClient();
    const createMutation = useCreateMutation();
    const updateMutation = useUpdateMutation();
    const deleteMutation = useDeleteMutation();

    // Fonction d'invalidation du cache
    const invalidateCache = () => {
      queryClient.invalidateQueries({ queryKey: params?.queryKey || queryKey });
    };

    /**
     * @description Gère la création d'une nouvelle ressource.
     * @param onSuccessCallback Callback à exécuter après succès (ex: fermer la modale).
     */
    const handleCreate = (
      values: TCreate,
      name: string,
      onSuccessCallback?: SuccessCallback
    ) => {
      createMutation.mutate(
        values,
        createMutationCallbacksWithNotifications({
          successMessageTitle: `${itemName} créé(e) !`,
          successMessageDescription: `Le/La ${itemName} '${name}' a été ajouté(e) avec succès.`,
          errorMessageTitle: `Échec de la création du/de la ${itemName}.`,
          onSuccess: () => {
            invalidateCache();
            onSuccessCallback?.();
          },
        })
      );
    };

    /**
     * @description Gère la mise à jour d'une ressource existante.
     * @param onSuccessCallback Callback à exécuter après succès.
     */
    const handleUpdate = (
      id: string,
      values: Partial<TCreate>,
      name: string,
      onSuccessCallback?: SuccessCallback
    ) => {
      updateMutation.mutate(
        { id, data: values } as { id: string; data: TCreate },
        createMutationCallbacksWithNotifications({
          successMessageTitle: `${itemName} mis(e) à jour !`,
          successMessageDescription: `Le/La ${itemName} '${name}' a été modifié(e) avec succès.`,
          errorMessageTitle: `Échec de la mise à jour du/de la ${itemName}.`,
          onSuccess: () => {
            invalidateCache();
            onSuccessCallback?.();
          },
        })
      );
    };

    /**
     * @description Gère la suppression d'une ressource.
     * @param onSuccessCallback Callback à exécuter après succès.
     */
    const handleDelete = (
      id: string,
      name: string,
      onSuccessCallback?: SuccessCallback
    ) => {
      deleteMutation.mutate(
        id,
        createMutationCallbacksWithNotifications({
          successMessageTitle: `${itemName} supprimé(e) !`,
          successMessageDescription: `Le/La ${itemName} '${name}' a été supprimé(e) avec succès.`,
          errorMessageTitle: `Échec de la suppression du/de la ${itemName}.`,
          onSuccess: () => {
            invalidateCache();
            onSuccessCallback?.();
          },
        })
      );
    };

    return {
      createMutation,
      updateMutation,
      deleteMutation,
      handleCreate,
      handleUpdate,
      handleDelete,
    };
  };
};
