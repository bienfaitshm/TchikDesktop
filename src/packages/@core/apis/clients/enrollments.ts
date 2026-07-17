import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import {
  EnrollmentQuickCreate,
  EnrollmentCreate,
  EnrollmentUpdate,
  EnrollmentFilter,
} from "@/packages/@core/data-access/schema-validations";
import type {
  EnrollmentTDO,
  SearchOptions,
} from "@/packages/@core/data-access/db";
import { EnrollmentRoutes } from "../routes-constant";

export type SearchEnrollmentQueryParams = Partial<
  SearchOptions<EnrollmentFilter>
>;

/**
 * Type définissant les paramètres de requête pour les listes.
 */
export type EnrollmentQueryParams = EnrollmentFilter;

/**
 * Type de l'objet API retourné. Le 'as const' garantit que toutes les propriétés
 * sont en lecture seule (readonly) pour le consommateur de cette API.
 */
export type EnrollmentApi = Readonly<{
  /**
   * Récupère toutes les salles des inscriptions, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des EnrollmentTDO.
   */
  fetchEnrollments(params?: EnrollmentQueryParams): Promise<EnrollmentTDO[]>;

  searchEnrollments(
    params?: SearchEnrollmentQueryParams,
  ): Promise<EnrollmentTDO[]>;

  /**
   * Récupère toutes les salles des inscriptions, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des EnrollmentTDO.
   */
  fetchEnrollmentHistory(
    params?: EnrollmentQueryParams,
  ): Promise<EnrollmentTDO[]>;

  /**
   * Récupère les détails d'une salle des inscriptions spécifique par son ID.
   * @param enrollmentId L'identifiant unique de la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollmentTDO.
   */
  fetchEnrollmentById(enrollmentId: string): Promise<EnrollmentTDO>;

  /**
   * Crée une nouvelle salle des inscriptions.
   * @param data L'objet de données nécessaire pour créer la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollmentTDO nouvellement créé.
   */
  createEnrollment(data: EnrollmentCreate): Promise<EnrollmentTDO>;

  /**
   * Crée une nouvelle salle des inscriptions rapides.
   * @param data L'objet de données nécessaire pour créer la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollmentTDO nouvellement créé.
   */
  createQuickEnrollment(data: EnrollmentQuickCreate): Promise<EnrollmentTDO>;

  /**
   * Met à jour une salle des inscriptions existante.
   * @param enrollmentId L'identifiant unique de la salle des inscriptions à mettre à jour.
   * @param data Les champs partiels de EnrollmentTDO à modifier.
   * @returns Une promesse résolue avec l'objet EnrollmentTDO mis à jour.
   */
  updateEnrollment(
    enrollmentId: string,
    data: EnrollmentUpdate,
  ): Promise<EnrollmentTDO>;

  /**
   * Supprime une salle des inscriptions par son ID.
   * @param enrollmentId L'identifiant unique de la salle des inscriptions à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteEnrollment(enrollmentId: string): Promise<void>;
}>;

/**
 * Factory de services créant l'ensemble des méthodes API pour la gestion des salles des inscriptions.
 *
 * Cette fonction utilise l'IpcClient fourni pour interagir avec les endpoints IPC.
 *
 * @param ipcClient Le client IPC (Inter-Process Communication) pour effectuer les requêtes.
 * @returns L'objet EnrollmentApi contenant les méthodes de gestion des salles des inscriptions.
 */
export function createEnrollmentApis(ipcClient: IpcClient): EnrollmentApi {
  return {
    fetchEnrollments(params) {
      // Utilisation du 'params' Enrollmentnel de l'appel pour les filtres/pagination
      return ipcClient.get(EnrollmentRoutes.ALL, { params });
    },
    searchEnrollments(params) {
      return ipcClient.get(EnrollmentRoutes.SEARCH, { params });
    },
    fetchEnrollmentHistory(params) {
      // Utilisation du 'params' Enrollmentnel de l'appel pour les filtres/pagination
      return ipcClient.get(EnrollmentRoutes.ALL_HISTORIES, { params });
    },

    fetchEnrollmentById(enrollmentId) {
      return ipcClient.get(EnrollmentRoutes.DETAIL, {
        params: { enrollmentId },
      });
    },

    createEnrollment(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(EnrollmentRoutes.ALL, data);
    },

    createQuickEnrollment(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(EnrollmentRoutes.QUICK_ENROLLMENT, data);
    },

    updateEnrollment(enrollmentId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(EnrollmentRoutes.DETAIL, data, {
        params: { enrollmentId },
      });
    },

    deleteEnrollment(enrollmentId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(EnrollmentRoutes.DETAIL, {
        params: { enrollmentId },
      });
    },
  } as const;
}
