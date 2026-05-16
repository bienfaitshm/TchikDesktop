import { useMutation, useSuspenseQuery } from "./base-query";
import { seating } from "@/renderer/libs/apis";
import {
  TLocalRoomFilter,
  TLocalRoomCreate,
  TLocalRoomUpdate,
  TSeatingSessionCreate,
} from "@/packages/@core/data-access/schema-validations";
import { TQueryCreateParams, TQueryUpdate } from "./type";
import type { BulkAssignParams } from "@/packages/@core/apis/clients/seatings";
import type {
  TSeatingAssignmentCreate,
  SeatingGenerator,
  TSeatingSessionFilter,
} from "@/packages/@core/data-access/schema-validations";

export const seatingKeys = {
  all: ["seating"] as const,

  // Local Rooms
  rooms: () => [...seatingKeys.all, "rooms"] as const,
  roomLists: (params?: TLocalRoomFilter) =>
    [...seatingKeys.rooms(), "list", { params }] as const,
  roomDetails: () => [...seatingKeys.rooms(), "detail"] as const,
  roomDetail: (id: string) => [...seatingKeys.roomDetails(), id] as const,

  // Seating Sessions
  sessions: () => [...seatingKeys.all, "sessions"] as const,
  sessionLists: (filters?: TSeatingSessionFilter) =>
    [...seatingKeys.sessions(), "list", { filters }] as const,
  sessionDetails: () => [...seatingKeys.sessions(), "detail"] as const,
  sessionDetail: (id: string) => [...seatingKeys.sessionDetails(), id] as const,
  sessionAssignments: (id: string) =>
    [...seatingKeys.sessionDetail(id), "assignments"] as const,
  sessionRoomsStatus: (id: string) =>
    [...seatingKeys.sessionDetail(id), "rooms-status"] as const,
  sessionRoomLayout: (id: string, roomId: string) =>
    [...seatingKeys.sessionDetail(id), "room-layout", roomId] as const,

  // Students & Assignments
  students: () => [...seatingKeys.all, "students"] as const,
  unassignedStudents: (sessionId: string, yearId: string) =>
    [...seatingKeys.students(), "unassigned", { sessionId, yearId }] as const,
  studentSeat: (sessionId: string, enrolmentId: string) =>
    [...seatingKeys.students(), "seat", { sessionId, enrolmentId }] as const,
};

// =============================================================================
// HOOKS : LOCAL ROOMS (Salles Physiques)
// =============================================================================

/** @description Hook pour récupérer les locaux (salles physiques) */
export function useGetLocalRooms(params?: TLocalRoomFilter) {
  return useSuspenseQuery({
    queryKey: seatingKeys.roomLists(params),
    queryFn: () => seating.fetchLocalRooms(params),
  });
}

export function useGetLocalRoomById(localRoomId: string) {
  return useSuspenseQuery({
    queryKey: seatingKeys.roomDetail(localRoomId),
    queryFn: () => seating.fetchLocalRoomById(localRoomId),
  });
}

/** @description Hook pour créer un nouveau local */
export function useCreateLocalRoom() {
  return useMutation({
    mutationKey: [...seatingKeys.rooms(), "create"],
    mutationFn: (data: TLocalRoomCreate) => seating.createLocalRoom(data),
  });
}

/** @description Hook pour mettre à jour un local */
export function useUpdateLocalRoom() {
  return useMutation({
    mutationKey: [...seatingKeys.rooms(), "update"],
    mutationFn: ({ data, id }: TQueryUpdate<TLocalRoomUpdate>) =>
      seating.updateLocalRoom(id, data),
  });
}

/** @description Hook pour supprimer un local */
export function useDeleteLocalRoom() {
  return useMutation({
    mutationKey: [...seatingKeys.rooms(), "delete"],
    mutationFn: (localRoomId: string) => seating.deleteLocalRoom(localRoomId),
  });
}

// =============================================================================
// HOOKS : SEATING SESSIONS (Sessions)
// =============================================================================

/** @description Hook pour récupérer les sessions d'une année scolaire */
export function useGetSeatingSessions(filters?: TSeatingSessionFilter) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionLists(filters),
    queryFn: () => seating.fetchSessions(filters),
  });
}

export function useGetSeatingSessionById(sessionId: string) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionDetail(sessionId),
    queryFn: () => seating.fetchSessionById(sessionId),
  });
}

export function useSessionWithAssignments(sessionId: string) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionAssignments(sessionId),
    queryFn: () => seating.getSessionWithAssignments(sessionId),
  });
}

/** @description Hook pour récupérer le statut d'occupation des salles d'une session */
export function useGetSessionRoomsStatus(sessionId: string) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionRoomsStatus(sessionId),
    queryFn: () => seating.fetchSessionRoomsStatus(sessionId),
  });
}

/** @description Hook pour créer une session de placement */
export function useCreateSeatingSession() {
  return useMutation({
    mutationKey: [...seatingKeys.sessions(), "create"],
    mutationFn: (data: TSeatingSessionCreate) => seating.createSession(data),
  });
}

/** @description Hook pour supprimer une session de placement */
export function useDeleteSeatingSession() {
  return useMutation({
    mutationKey: [...seatingKeys.sessions(), "delete"],
    mutationFn: (sessionId: string) => seating.deleteSession(sessionId),
  });
}

/** @description Hook pour modifier une session de placement */
export function useUpdateSeatingSession() {
  return useMutation({
    mutationKey: [...seatingKeys.sessions(), "update"],
    mutationFn: ({ id, data }: TQueryUpdate<TSeatingSessionCreate>) =>
      seating.updateSession(id, data),
  });
}

// =============================================================================
// HOOKS : SEATING ASSIGNMENTS (Assignations)
// =============================================================================

export function useGenerateSeating() {
  return useMutation({
    mutationKey: [...seatingKeys.all, "generation"],
    mutationFn: (
      data: SeatingGenerator & { schoolId: string; yearId: string },
    ) => seating.generateSeating(data),
  });
}

/** @description Hook pour récupérer la disposition (layout) d'une salle précise */
export function useGetRoomLayout(sessionId: string, localRoomId: string) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionRoomLayout(sessionId, localRoomId),
    queryFn: () => seating.fetchRoomLayout(sessionId, localRoomId),
  });
}

/** @description Hook pour récupérer les élèves non assignés (utile pour le drag & drop) */
export function useGetUnassignedStudents(sessionId: string, yearId: string) {
  return useSuspenseQuery({
    queryKey: seatingKeys.unassignedStudents(sessionId, yearId),
    queryFn: () => seating.fetchUnassignedStudents(sessionId, yearId),
  });
}

/** @description Hook pour effectuer un placement massif (Bulk Assign) */
export function useBulkAssignStudents() {
  return useMutation({
    mutationKey: [...seatingKeys.all, "bulk-assign"],
    mutationFn: ({
      params,
      data,
    }: TQueryCreateParams<TSeatingAssignmentCreate[], BulkAssignParams>) =>
      seating.bulkAssign(data, params),
  });
}

export function useRebuildAssignStudents() {
  return useMutation({
    mutationKey: [...seatingKeys.all, "rebuild-assign"],
    mutationFn: ({
      params,
      data,
    }: TQueryCreateParams<TSeatingAssignmentCreate[], BulkAssignParams>) =>
      seating.rebuildAssign(params.sessionId, data),
  });
}

/** @description Hook pour vider les assignations d'une salle */
export function useClearRoomAssignments() {
  return useMutation({
    mutationKey: [...seatingKeys.all, "clear-room"],
    mutationFn: ({
      sessionId,
      localRoomId,
    }: {
      sessionId: string;
      localRoomId: string;
    }) => seating.clearRoomAssignments(sessionId, localRoomId),
  });
}

/** @description Hook pour localiser un étudiant spécifique dans une session */
export function useFindStudentSeat(sessionId: string, enrolementId: string) {
  return useSuspenseQuery({
    queryKey: seatingKeys.studentSeat(sessionId, enrolementId),
    queryFn: () => seating.findStudentSeat(sessionId, enrolementId),
  });
}
