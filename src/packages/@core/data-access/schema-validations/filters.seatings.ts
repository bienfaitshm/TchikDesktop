import { z } from "zod";
import {
  LocalRoomAttributesSchema,
  SeatingSessionAttributesSchema,
  SeatingAssignmentAttributesSchema,
} from "./model.seatings";
import { withQueryOptions } from "./model";
import { orArray } from "./filters.base";

// =============================================================================
// SCHÉMAS DE FILTRE - SEATING SYSTEM
// =============================================================================

export const LocalRoomFilterSchema = withQueryOptions(
  z.object({
    localRoomId: orArray(LocalRoomAttributesSchema.shape.localRoomId),
    name: orArray(LocalRoomAttributesSchema.shape.name),
    schoolId: orArray(LocalRoomAttributesSchema.shape.schoolId),
    maxCapacity: orArray(LocalRoomAttributesSchema.shape.maxCapacity),
  }),
);

export const SeatingSessionFilterSchema = withQueryOptions(
  z.object({
    sessionId: orArray(SeatingSessionAttributesSchema.shape.sessionId),
    sessionName: orArray(SeatingSessionAttributesSchema.shape.sessionName),
    schoolId: orArray(SeatingSessionAttributesSchema.shape.schoolId),
    yearId: orArray(SeatingSessionAttributesSchema.shape.yearId),
  }),
);

export const SeatingAssignmentFilterSchema = withQueryOptions(
  z.object({
    assignmentId: orArray(SeatingAssignmentAttributesSchema.shape.assignmentId),
    sessionId: orArray(SeatingAssignmentAttributesSchema.shape.sessionId),
    localRoomId: orArray(SeatingAssignmentAttributesSchema.shape.localRoomId),
    enrolementId: orArray(SeatingAssignmentAttributesSchema.shape.enrolementId),
    rowPosition: orArray(SeatingAssignmentAttributesSchema.shape.rowPosition),
    columnPosition: orArray(
      SeatingAssignmentAttributesSchema.shape.columnPosition,
    ),
  }),
);

export const SeatingStatsFilterSchema = z.object({
  schoolId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  yearId: z.string().uuid(),
});
