import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import {
  TutorFilter,
  BaseTutor,
} from "@/packages/@core/data-access/schema-validations";
import type { SelectOption, TutorDTO } from "@/packages/@core/data-access/db";
import { TutorRoutes } from "../routes-constant";

/** Data transfer object representing a tutor entity. */
export type TutorData = TutorDTO;

/** Query parameters used for filtering tutor list requests. */
export type TutorQueryParams = TutorFilter;

/** Combined type representing a tutor formatted as a UI select option. */
export type TutorOption = SelectOption & TutorDTO;

/**
 * Interface defining the API contract for managing tutor entities via IPC.
 */
export interface TutorApi {
  /**
   * Fetches a list of tutors based on optional search and pagination filters.
   * @param params - Query parameters to filter the list.
   * @returns A promise resolving to an array of tutors.
   */
  fetchTutors(params?: TutorQueryParams): Promise<TutorData[]>;

  /**
   * Fetches tutors formatted as select options for dropdown components.
   * @param params - Query parameters to filter search results.
   * @returns A promise resolving to an array of tutor select options.
   */
  fetchTutorAsOptions(params?: TutorQueryParams): Promise<TutorOption[]>;

  /**
   * Fetches the details of a single tutor by unique identifier.
   * @param tutorId - The unique identifier of the tutor.
   * @returns A promise resolving to the tutor details.
   */
  fetchTutorById(tutorId: string): Promise<TutorData>;

  /**
   * Creates a new tutor record.
   * @param data - The payload required to create a tutor.
   * @returns A promise resolving to the newly created tutor.
   */
  createTutor(data: BaseTutor): Promise<TutorData>;

  /**
   * Updates an existing tutor record.
   * @param tutorId - The unique identifier of the tutor to update.
   * @param data - Partial or full fields to update.
   * @returns A promise resolving to the updated tutor.
   */
  updateTutor(tutorId: string, data: BaseTutor): Promise<TutorData>;

  /**
   * Deletes a tutor by unique identifier.
   * @param tutorId - The unique identifier of the tutor to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  deleteTutor(tutorId: string): Promise<void>;
}

/**
 * Service factory creating API methods for tutor management using IPC.
 * @param ipcClient - The IPC client instance handling process communication.
 * @returns An implementation of the TutorApi interface.
 */
export function createTutorApis(ipcClient: IpcClient): TutorApi {
  return {
    fetchTutors(params) {
      return ipcClient.get(TutorRoutes.ALL, { params });
    },

    fetchTutorAsOptions(params) {
      return ipcClient.get(TutorRoutes.SEARCH, { params });
    },

    fetchTutorById(tutorId) {
      return ipcClient.get(TutorRoutes.DETAIL, { params: { tutorId } });
    },

    createTutor(data) {
      return ipcClient.post(TutorRoutes.ALL, data);
    },

    updateTutor(tutorId, data) {
      return ipcClient.put(TutorRoutes.DETAIL, data, {
        params: { tutorId },
      });
    },

    deleteTutor(tutorId) {
      return ipcClient.delete(TutorRoutes.DETAIL, {
        params: { tutorId },
      });
    },
  };
}
