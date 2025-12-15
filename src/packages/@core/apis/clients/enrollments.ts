import { IpcClient } from "@/packages/electron-ipc-rest";
import { EnrollementRoutes } from "../routes-constant";

/**
 * Interface représentant la structure des données d'une salle des inscriptions (Enrollement).
 * Remplace 'unknown' par les propriétés réelles de votre Enrollement.
 */
export interface EnrollementData {
  id: string;
  name: string;
}

/**
 * Type définissant les paramètres de requête pour les listes.
 */
export type EnrollementQueryParams = Record<string, unknown>;

/**
 * Type de l'objet API retourné. Le 'as const' garantit que toutes les propriétés
 * sont en lecture seule (readonly) pour le consommateur de cette API.
 */
export type EnrollementApi = Readonly<{
  /**
   * Récupère toutes les salles des inscriptions, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des EnrollementData.
   */
  fetchEnrollements(
    params?: EnrollementQueryParams
  ): Promise<EnrollementData[]>;

  /**
   * Récupère toutes les salles des inscriptions, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des EnrollementData.
   */
  fetchEnrollementHistory(
    params?: EnrollementQueryParams
  ): Promise<EnrollementData[]>;

  /**
   * Récupère les détails d'une salle des inscriptions spécifique par son ID.
   * @param EnrollementId L'identifiant unique de la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollementData.
   */
  fetchEnrollementById(EnrollementId: string): Promise<EnrollementData>;

  /**
   * Crée une nouvelle salle des inscriptions.
   * @param data L'objet de données nécessaire pour créer la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollementData nouvellement créé.
   */
  createEnrollement(
    data: Omit<EnrollementData, "id">
  ): Promise<EnrollementData>;

  /**
   * Crée une nouvelle salle des inscriptions rapides.
   * @param data L'objet de données nécessaire pour créer la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollementData nouvellement créé.
   */
  createQuickEnrollement(
    data: Omit<EnrollementData, "id">
  ): Promise<EnrollementData>;

  /**
   * Met à jour une salle des inscriptions existante.
   * @param EnrollementId L'identifiant unique de la salle des inscriptions à mettre à jour.
   * @param data Les champs partiels de EnrollementData à modifier.
   * @returns Une promesse résolue avec l'objet EnrollementData mis à jour.
   */
  updateEnrollement(
    EnrollementId: string,
    data: Partial<Omit<EnrollementData, "id">>
  ): Promise<EnrollementData>;

  /**
   * Supprime une salle des inscriptions par son ID.
   * @param EnrollementId L'identifiant unique de la salle des inscriptions à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteEnrollement(EnrollementId: string): Promise<void>;
}>;

/**
 * Factory de services créant l'ensemble des méthodes API pour la gestion des salles des inscriptions.
 *
 * Cette fonction utilise l'IpcClient fourni pour interagir avec les endpoints IPC.
 *
 * @param ipcClient Le client IPC (Inter-Process Communication) pour effectuer les requêtes.
 * @returns L'objet EnrollementApi contenant les méthodes de gestion des salles des inscriptions.
 */
export function createEnrollementApis(ipcClient: IpcClient): EnrollementApi {
  return {
    fetchEnrollements(params) {
      // Utilisation du 'params' Enrollementnel de l'appel pour les filtres/pagination
      return ipcClient.get(EnrollementRoutes.ALL, { params });
    },

    fetchEnrollementHistory(params) {
      // Utilisation du 'params' Enrollementnel de l'appel pour les filtres/pagination
      return ipcClient.get(EnrollementRoutes.ALL_HISTORIES, { params });
    },

    fetchEnrollementById(EnrollementId) {
      return ipcClient.get(EnrollementRoutes.DETAIL, {
        params: { EnrollementId },
      });
    },

    createEnrollement(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(EnrollementRoutes.ALL, data);
    },

    createQuickEnrollement(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(EnrollementRoutes.QUICK_ENROLLEMENT, data);
    },

    updateEnrollement(EnrollementId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(EnrollementRoutes.DETAIL, data, {
        params: { EnrollementId },
      });
    },

    deleteEnrollement(EnrollementId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(EnrollementRoutes.DETAIL, {
        params: { EnrollementId },
      });
    },
  } as const;
}
