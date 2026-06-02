import type { SelectOption } from "@/packages/dynamic-form";
import {
  seatingSessionService,
  classroomService,
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
      Awaited<ReturnType<typeof seatingSessionService.findMany>>[number]
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
      Awaited<ReturnType<typeof classroomService.findMany>>[number]
    >,
  ): readonly SelectOption[] {
    if (!classrooms?.length) return [];

    return classrooms.map((classroom) => ({
      label: classroom.shortIdentifier ?? `Classe ${classroom.classId}`,
      value: classroom.classId,
    }));
  },
} as const;
