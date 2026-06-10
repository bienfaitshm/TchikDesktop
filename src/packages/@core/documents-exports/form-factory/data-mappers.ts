import type { SelectOption } from "@/packages/dynamic-form";
import {
  seatingSessionRepository,
  localRoomRepository,
  classroomRepository,
} from "@/packages/@core/data-access/db/queries";

/**
 * Type-safe mapper functions for transforming domain entities to UI options
 * Each mapper is pure, testable, and handles edge cases
 */
export const DataMappers = {
  /**
   * Maps seating sessions to select options
   * Handles empty arrays and undefined values gracefully
   */
  sessionsToOptions(
    sessions: ReadonlyArray<
      Awaited<ReturnType<typeof seatingSessionRepository.findMany>>[number]
    >,
  ): readonly SelectOption[] {
    if (!sessions?.length) return [];

    return sessions.map((session) => ({
      label: session.sessionName ?? `Session ${session.sessionId}`,
      value: session.sessionId,
    }));
  },

  /**
   * Maps classrooms to select options
   * Provides fallback labels for missing short identifiers
   */
  classroomsToOptions(
    classrooms: ReadonlyArray<
      Awaited<ReturnType<typeof classroomRepository.findMany>>[number]
    >,
  ): readonly SelectOption[] {
    if (!classrooms?.length) return [];

    return classrooms.map((classroom) => ({
      label: classroom.shortIdentifier ?? `Classe ${classroom.classId}`,
      value: classroom.classId,
    }));
  },

  /**
   * Maps localRooms to select options
   * Provides fallback labels for missing short identifiers
   */
  localroomsToOptions(
    localrooms: ReadonlyArray<
      Awaited<ReturnType<typeof localRoomRepository.findMany>>[number]
    >,
  ): readonly SelectOption[] {
    if (!localrooms?.length) return [];

    return localrooms.map((localroom) => ({
      label: localroom.name ?? `Classe ${localroom.localroomId}`,
      value: localroom.localroomId,
    }));
  },
} as const;
