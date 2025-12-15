import { IpcClient } from "@/packages/electron-ipc-rest";
import { ClassroomRoutes } from "../routes-constant";

/**
 * Interface représentant la structure des données d'une salle de classe (Classroom).
 * Remplace 'unknown' par les propriétés réelles de votre Classroom.
 */
export interface ClassroomData {
  id: string;
  name: string;
}

/**
 * Type définissant les paramètres de requête pour les listes.
 */
export type ClassroomQueryParams = Record<string, unknown>;

/**
 * Type de l'objet API retourné. Le 'as const' garantit que toutes les propriétés
 * sont en lecture seule (readonly) pour le consommateur de cette API.
 */
export type ClassroomApi = Readonly<{
  /**
   * Récupère toutes les salles de classe, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des ClassroomData.
   */
  fetchClassrooms(params?: ClassroomQueryParams): Promise<ClassroomData[]>;

  /**
   * Récupère les détails d'une salle de classe spécifique par son ID.
   * @param classroomId L'identifiant unique de la salle de classe.
   * @returns Une promesse résolue avec l'objet ClassroomData.
   */
  fetchClassroomById(classroomId: string): Promise<ClassroomData>;

  /**
   * Crée une nouvelle salle de classe.
   * @param data L'objet de données nécessaire pour créer la salle de classe.
   * @returns Une promesse résolue avec l'objet ClassroomData nouvellement créé.
   */
  createClassroom(data: Omit<ClassroomData, "id">): Promise<ClassroomData>;

  /**
   * Met à jour une salle de classe existante.
   * @param classroomId L'identifiant unique de la salle de classe à mettre à jour.
   * @param data Les champs partiels de ClassroomData à modifier.
   * @returns Une promesse résolue avec l'objet ClassroomData mis à jour.
   */
  updateClassroom(
    classroomId: string,
    data: Partial<Omit<ClassroomData, "id">>
  ): Promise<ClassroomData>;

  /**
   * Supprime une salle de classe par son ID.
   * @param classroomId L'identifiant unique de la salle de classe à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteClassroom(classroomId: string): Promise<void>;
}>;

/**
 * Factory de services créant l'ensemble des méthodes API pour la gestion des salles de classe.
 *
 * Cette fonction utilise l'IpcClient fourni pour interagir avec les endpoints IPC.
 *
 * @param ipcClient Le client IPC (Inter-Process Communication) pour effectuer les requêtes.
 * @returns L'objet ClassroomApi contenant les méthodes de gestion des salles de classe.
 */
export function createClassroomApis(ipcClient: IpcClient): ClassroomApi {
  return {
    fetchClassrooms(params) {
      // Utilisation du 'params' optionnel de l'appel pour les filtres/pagination
      return ipcClient.get(ClassroomRoutes.ALL, { params });
    },

    fetchClassroomById(classroomId) {
      return ipcClient.get(ClassroomRoutes.DETAIL, { params: { classroomId } });
    },

    createClassroom(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(ClassroomRoutes.ALL, data);
    },

    updateClassroom(classroomId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(ClassroomRoutes.DETAIL, data, {
        params: { classroomId },
      });
    },

    deleteClassroom(classroomId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(ClassroomRoutes.DETAIL, {
        params: { classroomId },
      });
    },
  } as const;
}
