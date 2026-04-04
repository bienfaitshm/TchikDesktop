import { IpcClient } from "@/packages/electron-ipc-rest";
import {
  TLocalRoomAttributes,
  TLocalRoomFilter,
  TLocalRoomCreate,
  TLocalRoomUpdate,
  TSeatingSessionAttributes,
  TSeatingSessionCreate,
} from "@/packages/@core/data-access/schema-validations";
import {
  LocalRoomRoutes,
  SeatingSessionRoutes,
  SeatingAssignmentRoutes,
} from "../routes-constant";

export type LocalRoomData = TLocalRoomAttributes;
export type SeatingSessionData = TSeatingSessionAttributes;

/** Interface pour les résultats de statut d'occupation des salles */
export type RoomStatusData = {
  localRoomId: string;
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

export type SeatingApi = Readonly<{
  // --- Local Rooms ---
  fetchLocalRooms(params?: TLocalRoomFilter): Promise<LocalRoomData[]>;
  createLocalRoom(data: TLocalRoomCreate): Promise<LocalRoomData>;
  updateLocalRoom(
    localRoomId: string,
    data: TLocalRoomUpdate,
  ): Promise<LocalRoomData>;
  deleteLocalRoom(localRoomId: string): Promise<void>;

  // --- Seating Sessions ---
  fetchSessionsByYear(params: {
    schoolId: string;
    yearId: string;
  }): Promise<SeatingSessionData[]>;
  createSession(data: TSeatingSessionCreate): Promise<SeatingSessionData>;
  deleteSession(sessionId: string): Promise<void>;
  fetchSessionRoomsStatus(sessionId: string): Promise<RoomStatusData[]>;
  fetchFullSessionDetails(sessionId: string): Promise<any>;

  // --- Seating Assignments ---
  fetchRoomLayout(
    sessionId: string,
    localRoomId: string,
  ): Promise<SeatingAssignmentData[]>;
  bulkAssign(assignments: any[]): Promise<any[]>;
  fetchUnassignedStudents(sessionId: string, yearId: string): Promise<any[]>;
  clearRoomAssignments(
    sessionId: string,
    localRoomId: string,
  ): Promise<{ success: boolean }>;
  findStudentSeat(sessionId: string, enrolementId: string): Promise<any>;
}>;

/**
 * Factory créant l'ensemble des méthodes API pour la gestion du placement (Seating).
 */
export function createSeatingApis(ipcClient: IpcClient): SeatingApi {
  return {
    // --- Local Rooms ---
    fetchLocalRooms(params) {
      return ipcClient.get(LocalRoomRoutes.ALL, { params });
    },

    createLocalRoom(data) {
      return ipcClient.post(LocalRoomRoutes.ALL, data);
    },

    updateLocalRoom(localRoomId, data) {
      return ipcClient.put(LocalRoomRoutes.DETAIL, data, {
        params: { localRoomId },
      });
    },

    deleteLocalRoom(localRoomId) {
      return ipcClient.delete(LocalRoomRoutes.DETAIL, {
        params: { localRoomId },
      });
    },

    // --- Seating Sessions ---
    fetchSessionsByYear(params) {
      return ipcClient.get(SeatingSessionRoutes.BY_YEAR, { params });
    },

    createSession(data) {
      return ipcClient.post(SeatingSessionRoutes.CREATE, data);
    },

    deleteSession(sessionId) {
      return ipcClient.delete(SeatingSessionRoutes.DETAIL, {
        params: { sessionId },
      });
    },

    fetchSessionRoomsStatus(sessionId) {
      return ipcClient.get(SeatingSessionRoutes.STATUS, {
        params: { sessionId },
      });
    },

    fetchFullSessionDetails(sessionId) {
      return ipcClient.get(SeatingSessionRoutes.FULL_DETAILS, {
        params: { sessionId },
      });
    },

    // --- Seating Assignments ---
    fetchRoomLayout(sessionId, localRoomId) {
      return ipcClient.get(SeatingAssignmentRoutes.LAYOUT, {
        params: { sessionId, localRoomId },
      });
    },

    bulkAssign(assignments) {
      return ipcClient.post(SeatingAssignmentRoutes.BULK, assignments);
    },

    fetchUnassignedStudents(sessionId, yearId) {
      return ipcClient.get(SeatingAssignmentRoutes.UNASSIGNED, {
        params: { sessionId, yearId },
      });
    },

    clearRoomAssignments(sessionId, localRoomId) {
      return ipcClient.delete(SeatingAssignmentRoutes.CLEAR_ROOM, {
        params: { sessionId, localRoomId },
      });
    },

    findStudentSeat(sessionId, enrolementId) {
      return ipcClient.get(SeatingAssignmentRoutes.FIND_STUDENT, {
        params: { sessionId, enrolementId },
      });
    },
  } as const;
}
