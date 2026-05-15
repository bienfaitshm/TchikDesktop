import { IpcClient } from "@/packages/electron-ipc-rest";
import type {
  TClassroom,
  TUser,
} from "@/packages/@core/data-access/db/schemas/types";
import type {
  TLocalRoomAttributes,
  TLocalRoomFilter,
  TLocalRoomCreate,
  TLocalRoomUpdate,
  TSeatingSessionAttributes,
  TSeatingSessionCreate,
  TSeatingAssignmentCreate,
  TSeatingAssignmentAttributes,
  TSeatingSessionFilter,
  SeatingGenerator,
  TSchoolYear,
} from "@/packages/@core/data-access/schema-validations";
import {
  LocalRoomRoutes,
  SeatingSessionRoutes,
  SeatingAssignmentRoutes,
} from "../routes-constant";

export type LocalRoomData = TLocalRoomAttributes;
export type SeatingSessionData = TSeatingSessionAttributes;
/**
 * Ajoute l'état d'assignation à un type de base.
 */
export type WithAssignment<T> = T & {
  hasAssignments?: boolean;
};

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
  fetchLocalRooms(params?: TLocalRoomFilter): Promise<LocalRoomData[]>;
  createLocalRoom(data: TLocalRoomCreate): Promise<LocalRoomData>;
  updateLocalRoom(
    localRoomId: string,
    data: TLocalRoomUpdate,
  ): Promise<LocalRoomData>;
  deleteLocalRoom(localRoomId: string): Promise<void>;

  // --- Seating Sessions ---
  fetchSessions(
    filters?: TSeatingSessionFilter,
  ): Promise<WithAssignment<TSeatingSessionAttributes>[]>;
  fetchSessionById(
    sessionId: string,
  ): Promise<WithAssignment<TSeatingSessionAttributes>>;
  createSession(data: TSeatingSessionCreate): Promise<SeatingSessionData>;
  updateSession(
    sessionId: string,
    data: Partial<TSeatingSessionCreate>,
  ): Promise<SeatingSessionData>;
  deleteSession(sessionId: string): Promise<void>;
  fetchSessionRoomsStatus(sessionId: string): Promise<RoomStatusData[]>;
  getSessionWithAssignments(sessionId: string): Promise<any>;

  // --- Seating Assignments ---
  generateSeating(data: SeatingGenerator & TSchoolYear): Promise<any>;
  fetchRoomLayout(
    sessionId: string,
    localRoomId: string,
  ): Promise<Assignment[]>;
  bulkAssign(
    assignments: TSeatingAssignmentCreate[],
    params: BulkAssignParams,
  ): Promise<TSeatingAssignmentAttributes[]>;
  rebuildAssign(
    sessionId: string,
    assignments: TSeatingAssignmentCreate[],
  ): Promise<TSeatingAssignmentAttributes[]>;
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
    fetchRoomLayout(sessionId, localRoomId) {
      return ipcClient.get(SeatingAssignmentRoutes.LAYOUT, {
        params: { sessionId, localRoomId },
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
