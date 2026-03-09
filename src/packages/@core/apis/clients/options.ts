import { IpcClient } from "@/packages/electron-ipc-rest";
import {
  TOptionAttributes,
  TOptionFilter,
  TOptionCreate,
  TOptionUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { OptionRoutes } from "../routes-constant";

/**
 * type représentant la structure des données d'une salle de classe (Option).
 * Remplace 'unknown' par les propriétés réelles de votre Option.
 */
export type OptionData = TOptionAttributes;

/**
 * Type définissant les paramètres de requête pour les listes.
 */
export type OptionQueryParams = TOptionFilter;

/**
 * Type de l'objet API retourné. Le 'as const' garantit que toutes les propriétés
 * sont en lecture seule (readonly) pour le consommateur de cette API.
 */
export type OptionApi = Readonly<{
  /**
   * Récupère toutes les salles de classe, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des OptionData.
   */
  fetchOptions(params?: OptionQueryParams): Promise<OptionData[]>;

  /**
   * Récupère les détails d'une salle de classe spécifique par son ID.
   * @param optionId L'identifiant unique de la salle de classe.
   * @returns Une promesse résolue avec l'objet OptionData.
   */
  fetchOptionById(optionId: string): Promise<OptionData>;

  /**
   * Crée une nouvelle salle de classe.
   * @param data L'objet de données nécessaire pour créer la salle de classe.
   * @returns Une promesse résolue avec l'objet OptionData nouvellement créé.
   */
  createOption(data: TOptionCreate): Promise<OptionData>;

  /**
   * Met à jour une salle de classe existante.
   * @param optionId L'identifiant unique de la salle de classe à mettre à jour.
   * @param data Les champs partiels de OptionData à modifier.
   * @returns Une promesse résolue avec l'objet OptionData mis à jour.
   */
  updateOption(optionId: string, data: TOptionUpdate): Promise<OptionData>;

  /**
   * Supprime une salle de classe par son ID.
   * @param optionId L'identifiant unique de la salle de classe à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteOption(optionId: string): Promise<void>;
}>;

/**
 * Factory de services créant l'ensemble des méthodes API pour la gestion des salles de classe.
 *
 * Cette fonction utilise l'IpcClient fourni pour interagir avec les endpoints IPC.
 *
 * @param ipcClient Le client IPC (Inter-Process Communication) pour effectuer les requêtes.
 * @returns L'objet OptionApi contenant les méthodes de gestion des salles de classe.
 */
export function createOptionApis(ipcClient: IpcClient): OptionApi {
  return {
    fetchOptions(params) {
      // Utilisation du 'params' optionnel de l'appel pour les filtres/pagination
      return ipcClient.get(OptionRoutes.ALL, { params });
    },

    fetchOptionById(optionId) {
      return ipcClient.get(OptionRoutes.DETAIL, { params: { optionId } });
    },

    createOption(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(OptionRoutes.ALL, data);
    },

    updateOption(optionId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(OptionRoutes.DETAIL, data, {
        params: { optionId },
      });
    },

    deleteOption(optionId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(OptionRoutes.DETAIL, {
        params: { optionId },
      });
    },
  } as const;
}
