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

// =============================================================================
// HOOKS : LOCAL ROOMS (Salles Physiques)
// =============================================================================

/** @description Hook pour récupérer les locaux (salles physiques) */
export function useGetLocalRooms(params?: TLocalRoomFilter) {
  return useSuspenseQuery({
    queryKey: ["GET_LOCAL_ROOMS", params],
    queryFn: () => seating.fetchLocalRooms(params),
  });
}

export function useGetLocalRoomById(localRoomId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_LOCAL_ROOMS", localRoomId],
    queryFn: () => seating.fetchLocalRoomById(localRoomId),
  });
}

/** @description Hook pour créer un nouveau local */
export function useCreateLocalRoom() {
  return useMutation({
    mutationKey: ["CREATE_LOCAL_ROOM"],
    mutationFn: (data: TLocalRoomCreate) => seating.createLocalRoom(data),
  });
}

/** @description Hook pour mettre à jour un local */
export function useUpdateLocalRoom() {
  return useMutation({
    mutationKey: ["UPDATE_LOCAL_ROOM"],
    mutationFn: ({ data, id }: TQueryUpdate<TLocalRoomUpdate>) =>
      seating.updateLocalRoom(id, data),
  });
}

/** @description Hook pour supprimer un local */
export function useDeleteLocalRoom() {
  return useMutation({
    mutationKey: ["DELETE_LOCAL_ROOM"],
    mutationFn: (localRoomId: string) => seating.deleteLocalRoom(localRoomId),
  });
}

// =============================================================================
// HOOKS : SEATING SESSIONS (Sessions)
// =============================================================================

/** @description Hook pour récupérer les sessions d'une année scolaire */
export function useGetSeatingSessions(filters?: TSeatingSessionFilter) {
  return useSuspenseQuery({
    queryKey: ["GET_SEATING_SESSIONS", filters],
    queryFn: () => seating.fetchSessions(filters),
  });
}

export function useGetSeatingSessionById(sessionId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_SEATING_SESSIONS", sessionId],
    queryFn: () => seating.fetchSessionById(sessionId),
  });
}

export function useSessionWithAssignments(sessionId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_SEATING_WITH_ASSIGNMENTS", sessionId],
    queryFn: () => seating.getSessionWithAssignments(sessionId),
  });
}

/** @description Hook pour récupérer le statut d'occupation des salles d'une session */
export function useGetSessionRoomsStatus(sessionId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_SESSION_ROOMS_STATUS", sessionId],
    queryFn: () => seating.fetchSessionRoomsStatus(sessionId),
  });
}

/** @description Hook pour créer une session de placement */
export function useCreateSeatingSession() {
  return useMutation({
    mutationKey: ["CREATE_SEATING_SESSION"],
    mutationFn: (data: TSeatingSessionCreate) => seating.createSession(data),
  });
}

/** @description Hook pour supprimer une session de placement */
export function useDeleteSeatingSession() {
  return useMutation({
    mutationKey: ["DELETE_SEATING_SESSION"],
    mutationFn: (sessionId: string) => seating.deleteSession(sessionId),
  });
}

/** @description Hook pour modifier une session de placement */
export function useUpdateSeatingSession() {
  return useMutation({
    mutationKey: ["UPDATE_SEATING_SESSION"],
    mutationFn: ({ id, data }: TQueryUpdate<TSeatingSessionCreate>) =>
      seating.updateSession(id, data),
  });
}

// =============================================================================
// HOOKS : SEATING ASSIGNMENTS (Assignations)
// =============================================================================

export function useGenerateSeating() {
  return useMutation({
    mutationKey: ["SEATING_GENERATION"],
    mutationFn: (
      data: SeatingGenerator & { schoolId: string; yearId: string },
    ) => seating.generateSeating(data),
  });
}

/** @description Hook pour récupérer la disposition (layout) d'une salle précise */
export function useGetRoomLayout(sessionId: string, localRoomId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_ROOM_LAYOUT", sessionId, localRoomId],
    queryFn: () => seating.fetchRoomLayout(sessionId, localRoomId),
  });
}

/** @description Hook pour récupérer les élèves non assignés (utile pour le drag & drop) */
export function useGetUnassignedStudents(sessionId: string, yearId: string) {
  return useSuspenseQuery({
    queryKey: ["GET_UNASSIGNED_STUDENTS", sessionId, yearId],
    queryFn: () => seating.fetchUnassignedStudents(sessionId, yearId),
  });
}

/** @description Hook pour effectuer un placement massif (Bulk Assign) */
export function useBulkAssignStudents() {
  return useMutation({
    mutationKey: ["BULK_ASSIGN_STUDENTS"],
    mutationFn: ({
      params,
      data,
    }: TQueryCreateParams<TSeatingAssignmentCreate[], BulkAssignParams>) =>
      seating.bulkAssign(data, params),
  });
}

export function useRebuildAssignStudents() {
  return useMutation({
    mutationKey: ["REBUILD_ASSIGN_STUDENTS"],
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
    mutationKey: ["CLEAR_ROOM_ASSIGNMENTS"],
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
    queryKey: ["FIND_STUDENT_SEAT", sessionId, enrolementId],
    queryFn: () => seating.findStudentSeat(sessionId, enrolementId),
  });
}
