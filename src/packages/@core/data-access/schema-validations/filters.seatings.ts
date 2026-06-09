import { z } from "zod";
import {
  LocalroomSchema,
  SeatingSessionSchema,
  SeatingAssignmentSchema,
  withQueryOptions,
} from "./model";
import { orArray } from "./filters.base";

export const LocalroomFilterSchema = withQueryOptions(
  z.object({
    localroomId: orArray(LocalroomSchema.shape.localroomId),
    name: orArray(LocalroomSchema.shape.name),
    schoolId: orArray(LocalroomSchema.shape.schoolId),
    maxCapacity: orArray(LocalroomSchema.shape.maxCapacity),
  }),
);

export const SeatingSessionFilterSchema = withQueryOptions(
  z.object({
    sessionId: orArray(SeatingSessionSchema.shape.sessionId),
    sessionName: orArray(SeatingSessionSchema.shape.sessionName),
    schoolId: orArray(SeatingSessionSchema.shape.schoolId),
    yearId: orArray(SeatingSessionSchema.shape.yearId),
  }),
);

export const SeatingAssignmentFilterSchema = withQueryOptions(
  z.object({
    assignmentId: orArray(SeatingAssignmentSchema.shape.assignmentId),
    sessionId: orArray(SeatingAssignmentSchema.shape.sessionId),
    localroomId: orArray(SeatingAssignmentSchema.shape.localroomId),
    enrollmentId: orArray(SeatingAssignmentSchema.shape.enrollmentId),
    rowPosition: orArray(SeatingAssignmentSchema.shape.rowPosition),
    columnPosition: orArray(SeatingAssignmentSchema.shape.columnPosition),
  }),
);

/**
 * Schéma pour filtrer les tableaux de bord et métriques de placement.
 * Pro-Tip: On réutilise les types de base plutôt que de re-déclarer du z.string().uuid()
 * pour éviter les désynchronisations si la stratégie d'ID change en DB.
 */
export const SeatingStatsFilterSchema = z.object({
  schoolId: SeatingSessionSchema.shape.schoolId,
  yearId: SeatingSessionSchema.shape.yearId,
  sessionId: SeatingSessionSchema.shape.sessionId.optional(),
});

export type SeatingStatsFilter = z.infer<typeof SeatingStatsFilterSchema>;
