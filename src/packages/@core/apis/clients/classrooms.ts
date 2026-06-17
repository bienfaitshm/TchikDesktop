import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  ClassroomCreate,
  ClassroomFilter,
  ClassroomUpdate,
} from "@/packages/@core/data-access/schema-validations";
import type {
  SearchOptions,
  SelectOption,
} from "@/packages/@core/data-access/db/queries";
import type { ClassroomDTO } from "@/packages/@core/data-access/db/queries/classrooms";
import { ClassroomRoutes } from "../routes-constant";

export type SearchClassroomQueryParams = Partial<
  SearchOptions<ClassroomFilter>
>;

/**
 * Type de l'objet API retourné. Le 'Readonly' garantit que toutes les propriétés
 * sont immuables pour le consommateur de cette API.
 */
export type ClassroomApi = Readonly<{
  /**
   * Récupère toutes les salles de classe, éventuellement filtrées.
   */
  fetchClassrooms(params?: ClassroomFilter): Promise<ClassroomDTO[]>;

  /**
   * Récupère les salles de classe formatées pour les composants de sélection (Select).
   */
  fetchClassroomAsOptions(
    params?: SearchClassroomQueryParams,
  ): Promise<(SelectOption & ClassroomDTO)[]>;

  /**
   * Récupère les détails d'une salle de classe spécifique par son ID.
   */
  fetchClassroomById(classroomId: string): Promise<ClassroomDTO>;

  /**
   * Crée une nouvelle salle de classe.
   */
  createClassroom(data: ClassroomCreate): Promise<ClassroomDTO>;

  /**
   * Met à jour une salle de classe existante.
   */
  updateClassroom(
    classroomId: string,
    data: ClassroomUpdate,
  ): Promise<ClassroomDTO>;

  /**
   * Supprime une salle de classe par son ID.
   */
  deleteClassroom(classroomId: string): Promise<void>;
}>;

/**
 * Factory de services créant l'ensemble des méthodes API pour la gestion des salles de classe.
 *
 * @param ipcClient Le client IPC (Inter-Process Communication) pour effectuer les requêtes.
 * @returns L'objet ClassroomApi contenant les méthodes de gestion.
 */
export function createClassroomApis(ipcClient: IpcClient): ClassroomApi {
  return {
    fetchClassrooms(params) {
      return ipcClient.get(ClassroomRoutes.ALL, { params });
    },

    fetchClassroomAsOptions(params) {
      return ipcClient.get(ClassroomRoutes.SEARCH, {
        params,
      });
    },

    fetchClassroomById(classroomId) {
      return ipcClient.get(ClassroomRoutes.DETAIL, {
        params: { classId: classroomId }, // On garde 'classId' si c'est ce que l'IpcClient/Backend attend en clé
      });
    },

    createClassroom(data) {
      return ipcClient.post(ClassroomRoutes.ALL, data);
    },

    updateClassroom(classroomId, data) {
      return ipcClient.put(ClassroomRoutes.DETAIL, data, {
        params: { classId: classroomId },
      });
    },

    deleteClassroom(classroomId) {
      return ipcClient.delete(ClassroomRoutes.DETAIL, {
        params: { classId: classroomId },
      });
    },
  };
}
