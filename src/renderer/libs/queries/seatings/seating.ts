import {
  useMutation,
  useSuspenseQuery,
  type QueryUpdatePayload,
} from "../base";
import { seating as seatingApi } from "@/renderer/libs/apis";
import type {
  LocalroomFilter,
  LocalroomCreate,
  LocalroomUpdate,
  SeatingSessionCreate,
  SeatingAssignmentCreate,
  SeatingGenerator,
  SeatingSessionFilter,
  Localroom,
  SeatingSession,
} from "@/packages/@core/data-access/schema-validations";
import type {
  Assignment,
  BulkAssignParams,
  SearchLocalRoomQueryParams,
} from "@/packages/@core/apis/clients/seatings";
import type {
  UseSuspenseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";

/**
 * 1. Query Key Factory (Centralisation et immuabilité totale)
 */
export const seatingKeys = {
  all: ["seating"] as const,

  rooms: () => [...seatingKeys.all, "rooms"] as const,
  roomLists: (params?: LocalroomFilter) =>
    [...seatingKeys.rooms(), "list", { params }] as const,
  roomOptions: (params?: LocalroomFilter) =>
    [...seatingKeys.rooms(), "list", { params }] as const,
  roomDetails: () => [...seatingKeys.rooms(), "detail"] as const,
  roomDetail: (id: string) => [...seatingKeys.roomDetails(), id] as const,

  sessions: () => [...seatingKeys.all, "sessions"] as const,
  sessionLists: (filters?: SeatingSessionFilter) =>
    [...seatingKeys.sessions(), "list", { filters }] as const,
  sessionDetails: () => [...seatingKeys.sessions(), "detail"] as const,
  sessionDetail: (id: string) => [...seatingKeys.sessionDetails(), id] as const,
  sessionAssignments: (id: string) =>
    [...seatingKeys.sessionDetail(id), "assignments"] as const,
  sessionRoomsStatus: (id: string) =>
    [...seatingKeys.sessionDetail(id), "rooms-status"] as const,
  sessionRoomLayout: (id: string, roomId: string) =>
    [...seatingKeys.sessionDetail(id), "room-layout", roomId] as const,

  students: () => [...seatingKeys.all, "students"] as const,
  unassignedStudents: (sessionId: string, yearId: string) =>
    [...seatingKeys.students(), "unassigned", { sessionId, yearId }] as const,
  studentSeat: (sessionId: string, enrolmentId: string) =>
    [...seatingKeys.students(), "seat", { sessionId, enrolmentId }] as const,

  mutations: {
    room: {
      create: () => [...seatingKeys.rooms(), "create"] as const,
      update: () => [...seatingKeys.rooms(), "update"] as const,
      delete: () => [...seatingKeys.rooms(), "delete"] as const,
    },
    session: {
      create: () => [...seatingKeys.sessions(), "create"] as const,
      update: () => [...seatingKeys.sessions(), "update"] as const,
      delete: () => [...seatingKeys.sessions(), "delete"] as const,
    },
    assignments: {
      generate: () => [...seatingKeys.all, "generation"] as const,
      bulkAssign: () => [...seatingKeys.all, "bulk-assign"] as const,
      rebuildAssign: () => [...seatingKeys.all, "rebuild-assign"] as const,
      clearRoom: () => [...seatingKeys.all, "clear-room"] as const,
    },
  },
} as const;

// =============================================================================
// 2. HOOKS : LOCAL ROOMS (Salles Physiques)
// =============================================================================

export function useGetLocalRooms(
  params?: LocalroomFilter,
  options?: Partial<UseSuspenseQueryOptions<Localroom[]>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.roomLists(params),
    queryFn: () => seatingApi.fetchLocalrooms(params),
    ...options,
  });
}

export function useGetLocalRoomsAsOption(
  params?: SearchLocalRoomQueryParams,
  options?: Partial<UseSuspenseQueryOptions<Localroom[]>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.roomOptions(params),
    queryFn: () => seatingApi.fetchLocalrooms(params),
    ...options,
  });
}

export function useGetLocalRoomById(
  localroomId: string,
  options?: Partial<UseSuspenseQueryOptions<Localroom>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.roomDetail(localroomId),
    queryFn: () => seatingApi.fetchLocalroomById(localroomId),
    ...options,
  });
}

export function useCreateLocalRoom(
  options?: Partial<UseMutationOptions<Localroom, Error, LocalroomCreate>>,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.room.create(),
    mutationFn: (data: LocalroomCreate) => seatingApi.createLocalroom(data),
    ...options,
  });
}

export function useUpdateLocalRoom(
  options?: Partial<
    UseMutationOptions<Localroom, Error, QueryUpdatePayload<LocalroomUpdate>>
  >,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.room.update(),
    mutationFn: ({ data, id }: QueryUpdatePayload<LocalroomUpdate>) =>
      seatingApi.updateLocalroom(id, data),
    ...options,
  });
}

export function useDeleteLocalRoom(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.room.delete(),
    mutationFn: (localroomId: string) =>
      seatingApi.deleteLocalroom(localroomId),
    ...options,
  });
}

// =============================================================================
// 3. HOOKS : SEATING SESSIONS (Sessions)
// =============================================================================

export function useGetSeatingSessions(
  filters?: SeatingSessionFilter,
  options?: Partial<UseSuspenseQueryOptions<SeatingSession[]>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionLists(filters),
    queryFn: () => seatingApi.fetchSessions(filters),
    ...options,
  });
}

export function useGetSeatingSessionById(
  sessionId: string,
  options?: Partial<UseSuspenseQueryOptions<SeatingSession>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionDetail(sessionId),
    queryFn: () => seatingApi.fetchSessionById(sessionId),
    ...options,
  });
}

export function useSessionWithAssignments(
  sessionId: string,
  options?: Partial<UseSuspenseQueryOptions<any>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionAssignments(sessionId),
    queryFn: () => seatingApi.getSessionWithAssignments(sessionId),
    ...options,
  });
}

export function useGetSessionRoomsStatus(
  sessionId: string,
  options?: Partial<UseSuspenseQueryOptions<any[]>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionRoomsStatus(sessionId),
    queryFn: () => seatingApi.fetchSessionRoomsStatus(sessionId),
    ...options,
  });
}

export function useCreateSeatingSession(
  options?: Partial<
    UseMutationOptions<SeatingSession, Error, SeatingSessionCreate>
  >,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.session.create(),
    mutationFn: (data: SeatingSessionCreate) => seatingApi.createSession(data),
    ...options,
  });
}

export function useUpdateSeatingSession(
  options?: Partial<
    UseMutationOptions<
      SeatingSession,
      Error,
      QueryUpdatePayload<SeatingSessionCreate>
    >
  >,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.session.update(),
    mutationFn: ({ id, data }: QueryUpdatePayload<SeatingSessionCreate>) =>
      seatingApi.updateSession(id, data),
    ...options,
  });
}

export function useDeleteSeatingSession(
  options?: Partial<UseMutationOptions<void, Error, string>>,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.session.delete(),
    mutationFn: (sessionId: string) => seatingApi.deleteSession(sessionId),
    ...options,
  });
}

// =============================================================================
// 4. HOOKS : SEATING ASSIGNMENTS (Assignations & Algorithmes)
// =============================================================================

export function useGenerateSeating(
  options?: Partial<
    UseMutationOptions<
      any,
      Error,
      SeatingGenerator & { schoolId: string; yearId: string }
    >
  >,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.assignments.generate(),
    mutationFn: (
      data: SeatingGenerator & { schoolId: string; yearId: string },
    ) => seatingApi.generateSeating(data),
    ...options,
  });
}

export function useGetRoomLayout(
  sessionId: string,
  localroomId: string,
  options?: Partial<UseSuspenseQueryOptions<Assignment[]>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.sessionRoomLayout(sessionId, localroomId),
    queryFn: () => seatingApi.fetchRoomLayout(sessionId, localroomId),
    ...options,
  });
}

export function useGetUnassignedStudents(
  sessionId: string,
  yearId: string,
  options?: Partial<UseSuspenseQueryOptions<any[]>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.unassignedStudents(sessionId, yearId),
    queryFn: () => seatingApi.fetchUnassignedStudents(sessionId, yearId),
    ...options,
  });
}

export function useBulkAssignStudents(
  options?: Partial<
    UseMutationOptions<
      any,
      Error,
      { data: SeatingAssignmentCreate[]; params: BulkAssignParams }
    >
  >,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.assignments.bulkAssign(),
    mutationFn: ({
      data,
      params,
    }: {
      data: SeatingAssignmentCreate[];
      params: BulkAssignParams;
    }) => seatingApi.bulkAssign(data, params),
    ...options,
  });
}

export function useRebuildAssignStudents(
  options?: Partial<
    UseMutationOptions<
      any,
      Error,
      { data: SeatingAssignmentCreate[]; params: BulkAssignParams }
    >
  >,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.assignments.rebuildAssign(),
    mutationFn: ({
      data,
      params,
    }: {
      data: SeatingAssignmentCreate[];
      params: BulkAssignParams;
    }) => seatingApi.rebuildAssign(params.sessionId, data),
    ...options,
  });
}

export function useClearRoomAssignments(
  options?: Partial<
    UseMutationOptions<
      { success: boolean },
      Error,
      { sessionId: string; localroomId: string }
    >
  >,
) {
  return useMutation({
    mutationKey: seatingKeys.mutations.assignments.clearRoom(),
    mutationFn: ({
      sessionId,
      localroomId,
    }: {
      sessionId: string;
      localroomId: string;
    }) => seatingApi.clearRoomAssignments(sessionId, localroomId),
    ...options,
  });
}

export function useFindStudentSeat(
  sessionId: string,
  enrolementId: string,
  options?: Partial<UseSuspenseQueryOptions<any>>,
) {
  return useSuspenseQuery({
    queryKey: seatingKeys.studentSeat(sessionId, enrolementId),
    queryFn: () => seatingApi.findStudentSeat(sessionId, enrolementId),
    ...options,
  });
}
