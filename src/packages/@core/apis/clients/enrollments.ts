import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import {
  EnrollmentQuickCreate,
  EnrollmentCreate,
  EnrollmentUpdate,
  EnrollmentFilter,
} from "@/packages/@core/data-access/schema-validations";
import type {
  ClassroomEnrollment,
  User,
  Classroom,
} from "@/packages/@core/data-access/db/schemas";
import { EnrollmentRoutes } from "../routes-constant";

/**
 * type représentant la structure des données d'une salle des inscriptions (Enrollment).
 * Remplace 'unknown' par les propriétés réelles de votre Enrollment.
 */
export type EnrollmentData = ClassroomEnrollment & {
  student: User & { fullName?: string };
  classroom: Classroom;
};

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
   * @returns Une promesse résolue avec la liste des EnrollmentData.
   */
  fetchEnrollments(params?: EnrollmentQueryParams): Promise<EnrollmentData[]>;

  /**
   * Récupère toutes les salles des inscriptions, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des EnrollmentData.
   */
  fetchEnrollmentHistory(
    params?: EnrollmentQueryParams,
  ): Promise<EnrollmentData[]>;

  /**
   * Récupère les détails d'une salle des inscriptions spécifique par son ID.
   * @param enrolementId L'identifiant unique de la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollmentData.
   */
  fetchEnrollmentById(enrolementId: string): Promise<EnrollmentData>;

  /**
   * Crée une nouvelle salle des inscriptions.
   * @param data L'objet de données nécessaire pour créer la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollmentData nouvellement créé.
   */
  createEnrollment(data: EnrollmentCreate): Promise<EnrollmentData>;

  /**
   * Crée une nouvelle salle des inscriptions rapides.
   * @param data L'objet de données nécessaire pour créer la salle des inscriptions.
   * @returns Une promesse résolue avec l'objet EnrollmentData nouvellement créé.
   */
  createQuickEnrollment(data: EnrollmentQuickCreate): Promise<EnrollmentData>;

  /**
   * Met à jour une salle des inscriptions existante.
   * @param enrolementId L'identifiant unique de la salle des inscriptions à mettre à jour.
   * @param data Les champs partiels de EnrollmentData à modifier.
   * @returns Une promesse résolue avec l'objet EnrollmentData mis à jour.
   */
  updateEnrollment(
    enrolementId: string,
    data: EnrollmentUpdate,
  ): Promise<EnrollmentData>;

  /**
   * Supprime une salle des inscriptions par son ID.
   * @param enrolementId L'identifiant unique de la salle des inscriptions à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteEnrollment(enrolementId: string): Promise<void>;
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

    fetchEnrollmentHistory(params) {
      // Utilisation du 'params' Enrollmentnel de l'appel pour les filtres/pagination
      return ipcClient.get(EnrollmentRoutes.ALL_HISTORIES, { params });
    },

    fetchEnrollmentById(enrolementId) {
      return ipcClient.get(EnrollmentRoutes.DETAIL, {
        params: { enrolementId },
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

    updateEnrollment(enrolementId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(EnrollmentRoutes.DETAIL, data, {
        params: { enrolementId },
      });
    },

    deleteEnrollment(enrolementId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(EnrollmentRoutes.DETAIL, {
        params: { enrolementId },
      });
    },
  } as const;
}
