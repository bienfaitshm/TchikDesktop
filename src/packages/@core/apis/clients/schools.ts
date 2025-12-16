import { IpcClient } from "@/packages/electron-ipc-rest";
import {
  TSchoolAttributes,
  TSchoolCreate,
  TSchoolFilter,
  TSchoolUpdate,
  TStudyYearAttributes,
  TStudyYearCreate,
  TStudyYearUpdate,
  TStudyYearFilter,
} from "@/packages/@core/data-access/schema-validations";
import { SchoolRoutes, StudyYearRoutes } from "../routes-constant";

/**
 * Interface représentant la structure des données d'une salle de classe (School).
 * Remplace 'unknown' par les propriétés réelles de votre School.
 */
export interface SchoolData {
  id: string;
  name: string;
}

/**
 * Type définissant les paramètres de requête pour les listes.
 */
export type SchoolQueryParams = Record<string, unknown>;

/**
 * Type de l'objet API retourné. Le 'as const' garantit que toutes les propriétés
 * sont en lecture seule (readonly) pour le consommateur de cette API.
 */
export type SchoolApi = Readonly<{
  /**
   * Récupère toutes les salles de classe, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des TSchoolAttributes.
   */
  fetchSchools(params?: TSchoolFilter): Promise<TSchoolAttributes[]>;

  /**
   * Récupère les détails d'une salle de classe spécifique par son ID.
   * @param schoolId L'identifiant unique de la salle de classe.
   * @returns Une promesse résolue avec l'objet TSchoolAttributes.
   */
  fetchSchoolById(schoolId: string): Promise<TSchoolAttributes>;

  /**
   * Crée une nouvelle salle de classe.
   * @param data L'objet de données nécessaire pour créer la salle de classe.
   * @returns Une promesse résolue avec l'objet TSchoolAttributes nouvellement créé.
   */
  createSchool(data: TSchoolCreate): Promise<TSchoolAttributes>;

  /**
   * Met à jour une salle de classe existante.
   * @param schoolId L'identifiant unique de la salle de classe à mettre à jour.
   * @param data Les champs partiels de TSchoolAttributes à modifier.
   * @returns Une promesse résolue avec l'objet TSchoolAttributes mis à jour.
   */
  updateSchool(
    schoolId: string,
    data: TSchoolUpdate
  ): Promise<TSchoolAttributes>;

  /**
   * Supprime une salle de classe par son ID.
   * @param schoolId L'identifiant unique de la salle de classe à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteSchool(schoolId: string): Promise<void>;

  /**
   * Récupère toutes les salles de classe, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des TStudyYearAttributes.
   */
  fetchStudyYear(params?: TStudyYearFilter): Promise<TStudyYearAttributes[]>;

  /**
   * Récupère les détails d'une salle de classe spécifique par son ID.
   * @param schoolId L'identifiant unique de la salle de classe.
   * @returns Une promesse résolue avec l'objet TSchoolAttributes.
   */
  fetchStudyYearById(yearId: string): Promise<TStudyYearAttributes>;

  /**
   * Crée une nouvelle salle de classe.
   * @param data L'objet de données nécessaire pour créer la salle de classe.
   * @returns Une promesse résolue avec l'objet SchoolData nouvellement créé.
   */
  createStudyYear(data: TStudyYearCreate): Promise<TStudyYearAttributes>;

  /**
   * Met à jour une salle de classe existante.
   * @param schoolId L'identifiant unique de la salle de classe à mettre à jour.
   * @param data Les champs partiels de SchoolData à modifier.
   * @returns Une promesse résolue avec l'objet SchoolData mis à jour.
   */
  updateStudyYear(yearId: string, data: TStudyYearUpdate): Promise<SchoolData>;

  /**
   * Supprime une salle de classe par son ID.
   * @param schoolId L'identifiant unique de la salle de classe à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteStudyYear(yearId: string): Promise<boolean>;
}>;

/**
 * Factory de services créant l'ensemble des méthodes API pour la gestion des salles de classe.
 *
 * Cette fonction utilise l'IpcClient fourni pour interagir avec les endpoints IPC.
 *
 * @param ipcClient Le client IPC (Inter-Process Communication) pour effectuer les requêtes.
 * @returns L'objet SchoolApi contenant les méthodes de gestion des salles de classe.
 */
export function createSchoolApis(ipcClient: IpcClient): SchoolApi {
  return {
    fetchSchools(params) {
      // Utilisation du 'params' optionnel de l'appel pour les filtres/pagination
      return ipcClient.get(SchoolRoutes.ALL, { params });
    },

    fetchSchoolById(schoolId) {
      return ipcClient.get(SchoolRoutes.DETAIL, { params: { schoolId } });
    },

    createSchool(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(SchoolRoutes.ALL, data);
    },

    updateSchool(schoolId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(SchoolRoutes.DETAIL, data, {
        params: { schoolId },
      });
    },

    deleteSchool(schoolId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(SchoolRoutes.DETAIL, {
        params: { schoolId },
      });
    },

    // StudyYear
    fetchStudyYear(params) {
      // Utilisation du 'params' optionnel de l'appel pour les filtres/pagination
      return ipcClient.get(StudyYearRoutes.ALL, { params });
    },

    fetchStudyYearById(yearId) {
      return ipcClient.get(StudyYearRoutes.DETAIL, { params: { yearId } });
    },

    createStudyYear(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(StudyYearRoutes.ALL, data);
    },

    updateStudyYear(yearId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(StudyYearRoutes.DETAIL, data, {
        params: { yearId },
      });
    },

    deleteStudyYear(yearId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(StudyYearRoutes.DETAIL, {
        params: { yearId },
      });
    },
  } as const;
}
