import { useMutation, useSuspenseQuery } from "./base-query";
import { exportDocuments } from "@/renderer/libs/apis";

/**
 * Type utilitaire pour représenter un objet de paramètres générique.
 */
type ExportParams = Record<string, unknown>;

/**
 * Structure des données requises pour lancer une exportation.
 * @template TBody - Le type du corps de la requête.
 * @template TParams - Le type des paramètres de requête (query params).
 */
interface ExportPayload<TBody, TParams extends ExportParams = ExportParams> {
  params?: TParams;
  data: TBody;
}

/**
 * Hook pour déclencher l'exportation de documents.
 * @returns Un objet mutation pour gérer l'état de l'export (isLoading, error, etc.).
 */
export function useExportDocuments() {
  return useMutation<string, unknown, ExportPayload<unknown, ExportParams>>({
    mutationKey: ["documents", "export"],
    mutationFn: (payload: ExportPayload<unknown, ExportParams>) =>
      exportDocuments.executeExport(payload),
  });
}

/**
 * Hook pour récupérer la liste des types d'exports disponibles.
 * @returns Les données sur les exports disponibles et l'état de la requête.
 */
export function useAvailableExports<TParams extends Record<string, unknown>>(
  params?: TParams,
) {
  return useSuspenseQuery({
    queryKey: ["documents", "available-exports"],
    queryFn: () => exportDocuments.getAvailableExports(params),
    staleTime: 1000 * 60 * 5,
  });
}
