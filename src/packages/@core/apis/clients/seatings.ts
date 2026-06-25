import { IpcClient } from "@/packages/electron-ipc-rest/ipc.client";
import type {
  TClassroom,
  TUser,
} from "@/packages/@core/data-access/db/schemas/types";
import type {
  Localroom,
  LocalroomFilter,
  LocalroomCreate,
  LocalroomUpdate,
  SeatingSession,
  SeatingSessionCreate,
  SeatingAssignmentCreate,
  SeatingAssignment,
  SeatingSessionFilter,
  SeatingGenerator,
  SchoolYear,
} from "@/packages/@core/data-access/schema-validations";
import {
  LocalRoomRoutes,
  SeatingSessionRoutes,
  SeatingAssignmentRoutes,
} from "../routes-constant";
import type { SearchOptions } from "@/packages/@core/data-access/db/queries";

export type SearchLocalRoomQueryParams = Partial<
  SearchOptions<LocalroomFilter>
>;

export type LocalroomData = Localroom;
export type SeatingSessionData = SeatingSession;
/**
 * Ajoute l'état d'assignation à un type de base.
 */
export type WithAssignment<T> = T & {
  hasAssignments?: boolean;
};

/** Interface pour les résultats de statut d'occupation des salles */
export type RoomStatusData = {
  localroomId: string;
  roomName: string;
  maxCapacity: number;
  assignedCount: number;
  occupancyRate: number;
};

/** Interface pour l'assignation de siège (layout) */
export type SeatingAssignmentData = {
  assignmentId: string;
  row: number;
  column: number;
  student: {
    firstName: string;
    lastName: string;
  };
};

export interface Assignment {
  assignmentId: string;
  classroom: Pick<TClassroom, "classId" | "identifier" | "shortIdentifier">;
  column: number;
  enrolementId: string;
  row: number;
  student: Pick<TUser, "firstName" | "lastName" | "middleName" | "gender">;
}

export type BulkAssignParams = {
  schoolId: string;
  yearId: string;
  sessionId: string;
};

export type SeatingApi = Readonly<{
  // --- Local Rooms ---
  fetchLocalrooms(params?: LocalroomFilter): Promise<LocalroomData[]>;
  fetchLocalroomsAsOptions(
    params?: SearchLocalRoomQueryParams,
  ): Promise<LocalroomData[]>;
  fetchLocalroomById(localroomId: string): Promise<LocalroomData>;
  createLocalroom(data: LocalroomCreate): Promise<LocalroomData>;
  updateLocalroom(
    localroomId: string,
    data: LocalroomUpdate,
  ): Promise<LocalroomData>;
  deleteLocalroom(localroomId: string): Promise<void>;

  // --- Seating Sessions ---
  fetchSessions(
    filters?: SeatingSessionFilter,
  ): Promise<WithAssignment<SeatingSession>[]>;
  fetchSessionById(sessionId: string): Promise<WithAssignment<SeatingSession>>;
  createSession(data: SeatingSessionCreate): Promise<SeatingSessionData>;
  updateSession(
    sessionId: string,
    data: Partial<SeatingSessionCreate>,
  ): Promise<SeatingSessionData>;
  deleteSession(sessionId: string): Promise<void>;
  fetchSessionRoomsStatus(sessionId: string): Promise<RoomStatusData[]>;
  getSessionWithAssignments(sessionId: string): Promise<any>;

  // --- Seating Assignments ---
  generateSeating(data: SeatingGenerator & SchoolYear): Promise<any>;
  fetchRoomLayout(
    sessionId: string,
    localroomId: string,
  ): Promise<Assignment[]>;
  bulkAssign(
    assignments: SeatingAssignmentCreate[],
    params: BulkAssignParams,
  ): Promise<SeatingAssignment[]>;
  rebuildAssign(
    sessionId: string,
    assignments: SeatingAssignmentCreate[],
  ): Promise<SeatingAssignment[]>;
  fetchUnassignedStudents(sessionId: string, yearId: string): Promise<any[]>;
  clearRoomAssignments(
    sessionId: string,
    localroomId: string,
  ): Promise<{ success: boolean }>;
  findStudentSeat(sessionId: string, enrolementId: string): Promise<any>;
}>;

/**
 * Factory créant l'ensemble des méthodes API pour la gestion du placement (Seating).
 */
export function createSeatingApis(ipcClient: IpcClient): SeatingApi {
  return {
    // --- Local Rooms ---
    fetchLocalrooms(params) {
      return ipcClient.get(LocalRoomRoutes.ALL, { params });
    },
    fetchLocalroomsAsOptions(params) {
      return ipcClient.get(LocalRoomRoutes.SEARCH, { params });
    },

    fetchLocalroomById(localroomId) {
      return ipcClient.get(LocalRoomRoutes.DETAIL, { params: { localroomId } });
    },
    createLocalroom(data) {
      return ipcClient.post(LocalRoomRoutes.ALL, data);
    },

    updateLocalroom(localroomId, data) {
      return ipcClient.put(LocalRoomRoutes.DETAIL, data, {
        params: { localroomId },
      });
    },

    deleteLocalroom(localroomId) {
      return ipcClient.delete(LocalRoomRoutes.DETAIL, {
        params: { localroomId },
      });
    },

    // --- Seating Sessions ---
    fetchSessions(filters) {
      return ipcClient.get(SeatingSessionRoutes.ALL, { params: filters });
    },
    fetchSessionById(sessionId) {
      return ipcClient.get(SeatingSessionRoutes.DETAIL, {
        params: { sessionId },
      });
    },
    createSession(data) {
      return ipcClient.post(SeatingSessionRoutes.ALL, data);
    },

    deleteSession(sessionId) {
      return ipcClient.delete(SeatingSessionRoutes.DETAIL, {
        params: { sessionId },
      });
    },

    updateSession(sessionId, data) {
      return ipcClient.put(SeatingSessionRoutes.DETAIL, data, {
        params: { sessionId },
      });
    },

    fetchSessionRoomsStatus(sessionId) {
      return ipcClient.get(SeatingSessionRoutes.STATUS, {
        params: { sessionId },
      });
    },

    getSessionWithAssignments(sessionId) {
      return ipcClient.get(SeatingSessionRoutes.FULL_DETAILS, {
        params: { sessionId },
      });
    },

    // --- Seating Assignments ---

    generateSeating(data) {
      return ipcClient.post(SeatingAssignmentRoutes.GENERATING, data);
    },
    fetchRoomLayout(sessionId, localroomId) {
      return ipcClient.get(SeatingAssignmentRoutes.LAYOUT, {
        params: { sessionId, localroomId },
      });
    },

    bulkAssign(assignments, params) {
      return ipcClient.post(SeatingAssignmentRoutes.BULK, assignments, {
        params,
      });
    },

    rebuildAssign(sessionId, assignments) {
      return ipcClient.post(SeatingAssignmentRoutes.RE_ASSIGNED, {
        sessionId,
        assignments,
      });
    },

    fetchUnassignedStudents(sessionId, yearId) {
      return ipcClient.get(SeatingAssignmentRoutes.UNASSIGNED, {
        params: { sessionId, yearId },
      });
    },

    clearRoomAssignments(sessionId, localroomId) {
      return ipcClient.delete(SeatingAssignmentRoutes.CLEAR_ROOM, {
        params: { sessionId, localroomId },
      });
    },

    findStudentSeat(sessionId, enrolementId) {
      return ipcClient.get(SeatingAssignmentRoutes.FIND_STUDENT, {
        params: { sessionId, enrolementId },
      });
    },
  } as const;
}
