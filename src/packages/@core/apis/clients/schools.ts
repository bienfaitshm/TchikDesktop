import { IpcClient } from "@/packages/electron-ipc-rest";
import { SchoolRoutes } from "../routes-constant";

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
   * @returns Une promesse résolue avec la liste des SchoolData.
   */
  fetchSchools(params?: SchoolQueryParams): Promise<SchoolData[]>;

  /**
   * Récupère les détails d'une salle de classe spécifique par son ID.
   * @param SchoolId L'identifiant unique de la salle de classe.
   * @returns Une promesse résolue avec l'objet SchoolData.
   */
  fetchSchoolById(SchoolId: string): Promise<SchoolData>;

  /**
   * Crée une nouvelle salle de classe.
   * @param data L'objet de données nécessaire pour créer la salle de classe.
   * @returns Une promesse résolue avec l'objet SchoolData nouvellement créé.
   */
  createSchool(data: Omit<SchoolData, "id">): Promise<SchoolData>;

  /**
   * Met à jour une salle de classe existante.
   * @param SchoolId L'identifiant unique de la salle de classe à mettre à jour.
   * @param data Les champs partiels de SchoolData à modifier.
   * @returns Une promesse résolue avec l'objet SchoolData mis à jour.
   */
  updateSchool(
    SchoolId: string,
    data: Partial<Omit<SchoolData, "id">>
  ): Promise<SchoolData>;

  /**
   * Supprime une salle de classe par son ID.
   * @param SchoolId L'identifiant unique de la salle de classe à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteSchool(SchoolId: string): Promise<void>;
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

    fetchSchoolById(SchoolId) {
      return ipcClient.get(SchoolRoutes.DETAIL, { params: { SchoolId } });
    },

    createSchool(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(SchoolRoutes.ALL, data);
    },

    updateSchool(SchoolId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(SchoolRoutes.DETAIL, data, {
        params: { SchoolId },
      });
    },

    deleteSchool(SchoolId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(SchoolRoutes.DETAIL, {
        params: { SchoolId },
      });
    },
  } as const;
}
