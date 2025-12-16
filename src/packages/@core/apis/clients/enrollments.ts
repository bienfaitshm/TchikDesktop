import { IpcClient } from "@/packages/electron-ipc-rest";
import {
  TEnrolementQuickCreate,
  TEnrolementAttributes,
  TEnrolementCreate,
  TEnrolementUpdate,
  TEnrolementFilter,
} from "@/packages/@core/data-access/schema-validations";
import { EnrollementRoutes } from "../routes-constant";

/**
 * type représentant la structure des données d'une salle des inscriptions (Enrollement).
 * Remplace 'unknown' par les propriétés réelles de votre Enrollement.
 */
export type EnrollementData = TEnrolementAttributes;

/**
 * Type définissant les paramètres de requête pour les listes.
 */
export type EnrollementQueryParams = TEnrolementFilter;

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
   * @param enrollementId L'identifiant unique de la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollementData.
   */
  fetchEnrollementById(enrollementId: string): Promise<EnrollementData>;

  /**
   * Crée une nouvelle salle des inscriptions.
   * @param data L'objet de données nécessaire pour créer la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollementData nouvellement créé.
   */
  createEnrollement(data: TEnrolementCreate): Promise<EnrollementData>;

  /**
   * Crée une nouvelle salle des inscriptions rapides.
   * @param data L'objet de données nécessaire pour créer la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollementData nouvellement créé.
   */
  createQuickEnrollement(
    data: TEnrolementQuickCreate
  ): Promise<EnrollementData>;

  /**
   * Met à jour une salle des inscriptions existante.
   * @param enrollementId L'identifiant unique de la salle des inscriptions à mettre à jour.
   * @param data Les champs partiels de EnrollementData à modifier.
   * @returns Une promesse résolue avec l'objet EnrollementData mis à jour.
   */
  updateEnrollement(
    enrollementId: string,
    data: TEnrolementUpdate
  ): Promise<EnrollementData>;

  /**
   * Supprime une salle des inscriptions par son ID.
   * @param enrollementId L'identifiant unique de la salle des inscriptions à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteEnrollement(enrollementId: string): Promise<void>;
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

    fetchEnrollementById(enrollementId) {
      return ipcClient.get(EnrollementRoutes.DETAIL, {
        params: { enrollementId },
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

    updateEnrollement(enrollementId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(EnrollementRoutes.DETAIL, data, {
        params: { enrollementId },
      });
    },

    deleteEnrollement(enrollementId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(EnrollementRoutes.DETAIL, {
        params: { enrollementId },
      });
    },
  } as const;
}
