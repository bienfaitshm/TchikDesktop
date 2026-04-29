import { IpcClient } from "@/packages/electron-ipc-rest";
import { DocumentMetadata } from "@/packages/electron-data-exporter";
import {} from "@/packages/@core/data-access/schema-validations";
import { DocumentExportRoutes } from "../routes-constant";

export type DocumentExportApi = Readonly<{
  getAvailableExports(): Promise<DocumentMetadata[]>;
  executeExport<TData, TParams extends Record<string, unknown> = {}>(
    data: TData,
    params?: TParams,
  ): Promise<string>;
}>;

/**
 * Factory de services créant l'ensemble des méthodes API pour la gestion des salles de classe.
 *
 * Cette fonction utilise l'IpcClient fourni pour interagir avec les endpoints IPC.
 *
 * @param ipcClient Le client IPC (Inter-Process Communication) pour effectuer les requêtes.
 * @returns L'objet DocumentExportApi contenant les méthodes de gestion des salles de classe.
 */
export function createDocumentExportApis(
  ipcClient: IpcClient,
): DocumentExportApi {
  return {
    executeExport(data, params) {
      return ipcClient.post(DocumentExportRoutes.EXPORTS, data, { params });
    },
    getAvailableExports() {
      return ipcClient.get(DocumentExportRoutes.INFOS);
    },
  } as const;
}
