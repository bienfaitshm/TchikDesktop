import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import {
  User,
  UserFilter,
  UserCreate,
  UserUpdate,
} from "@/packages/@core/data-access/schema-validations";
import { UserRoutes } from "../routes-constant";

export type UserData = User;

/**
 * Type définissant les paramètres de requête pour les listes.
 */
export type UserQueryParams = UserFilter;

/**
 * Type de l'objet API retourné. Le 'as const' garantit que toutes les propriétés
 * sont en lecture seule (readonly) pour le consommateur de cette API.
 */
export type UserApi = Readonly<{
  /**
   * Récupère toutes les salles de classe, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des UserData.
   */
  fetchUsers(params?: UserQueryParams): Promise<UserData[]>;

  /**
   * Récupère toutes les salles de classe, éventuellement filtrées par des paramètres.
   * @param params Les paramètres de requête pour filtrer, paginer ou trier les résultats.
   * @returns Une promesse résolue avec la liste des UserData.
   */
  searchUser(params: {
    name?: string;
    yearId?: string;
    schoolId: string;
  }): Promise<UserData[]>;

  /**
   * Récupère les détails d'une salle de classe spécifique par son ID.
   * @param userId L'identifiant unique de la salle de classe.
   * @returns Une promesse résolue avec l'objet UserData.
   */
  fetchUserById(userId: string): Promise<UserData>;

  /**
   * Crée une nouvelle salle de classe.
   * @param data L'objet de données nécessaire pour créer la salle de classe.
   * @returns Une promesse résolue avec l'objet UserData nouvellement créé.
   */
  createUser(data: UserCreate): Promise<UserData>;

  /**
   * Met à jour une salle de classe existante.
   * @param userId L'identifiant unique de la salle de classe à mettre à jour.
   * @param data Les champs partiels de UserData à modifier.
   * @returns Une promesse résolue avec l'objet UserData mis à jour.
   */
  updateUser(userId: string, data: UserUpdate): Promise<UserData>;

  /**
   * Supprime une salle de classe par son ID.
   * @param userId L'identifiant unique de la salle de classe à supprimer.
   * @returns Une promesse résolue une fois la suppression terminée (souvent avec un objet vide ou un statut de succès).
   */
  deleteUser(userId: string): Promise<void>;
}>;

/**
 * Factory de services créant l'ensemble des méthodes API pour la gestion des salles de classe.
 *
 * Cette fonction utilise l'IpcClient fourni pour interagir avec les endpoints IPC.
 *
 * @param ipcClient Le client IPC (Inter-Process Communication) pour effectuer les requêtes.
 * @returns L'objet UserApi contenant les méthodes de gestion des salles de classe.
 */
export function createUserApis(ipcClient: IpcClient): UserApi {
  return {
    fetchUsers(params) {
      // Utilisation du 'params' Usernel de l'appel pour les filtres/pagination
      return ipcClient.get(UserRoutes.ALL, { params });
    },

    searchUser(params: { name?: string; yearId?: string; schoolId: string }) {
      return ipcClient.get(UserRoutes.SEARCH, { params });
    },

    fetchUserById(userId) {
      return ipcClient.get(UserRoutes.DETAIL, { params: { userId } });
    },

    createUser(data) {
      // Envoi des données dans le corps de la requête POST
      return ipcClient.post(UserRoutes.ALL, data);
    },

    updateUser(userId, data) {
      // Envoi du corps pour la mise à jour (PATCH ou PUT, ici PUT est utilisé)
      return ipcClient.put(UserRoutes.DETAIL, data, {
        params: { userId },
      });
    },

    deleteUser(userId) {
      // La suppression ne nécessite pas de corps de requête
      return ipcClient.delete(UserRoutes.DETAIL, {
        params: { userId },
      });
    },
  } as const;
}
