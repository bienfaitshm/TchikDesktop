import z from "zod";
import {
  LocalroomSchema,
  SeatingSessionSchema,
  SeatingAssignmentSchema,
  schoolYearIdBaseSchema,
} from "./model";

import { withQueryOptions } from "./helpers";

export const LocalroomFilterSchema = withQueryOptions({
  localrooms: LocalroomSchema,
});
export const SeatingSessionFilterSchema = withQueryOptions({
  seatingSessions: SeatingSessionSchema,
});
export const SeatingAssignmentFilterSchema = withQueryOptions({
  seatingAssignments: SeatingAssignmentSchema,
});

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
export const StatsFilterSchema = schoolYearIdBaseSchema;
