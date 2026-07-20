import { z } from "zod";
import {
  SchoolSchema,
  UserSchema,
  OptionSchema,
  StudyYearSchema,
  ClassroomSchema,
  EnrollmentSchema,
  EnrollmentActionSchema,
  LocalroomSchema,
  SeatingSessionSchema,
  SeatingAssignmentSchema,
} from "./model";

import { withQueryOptions } from "./helpers";

export const SchoolYearSchema = z.object({
  schoolId: z.string().min(1, "L'ID de l'école est requis"),
  yearId: z.string().min(1, "L'ID de l'année est requis"),
});
export type SchoolYear = z.infer<typeof SchoolYearSchema>;

export const SchoolFilterSchema = withQueryOptions({
  schools: SchoolSchema,
});
export const UserFilterSchema = withQueryOptions({
  users: UserSchema,
});
export const OptionFilterSchema = withQueryOptions({
  options: OptionSchema,
});
export const StudyYearFilterSchema = withQueryOptions({
  studyYears: StudyYearSchema,
});
export const ClassroomFilterSchema = withQueryOptions({
  classrooms: ClassroomSchema,
  options: OptionSchema,
});
export const EnrollmentFilterSchema = withQueryOptions({
  classroomEnrollments: EnrollmentSchema,
  users: UserSchema,
  classrooms: ClassroomSchema,
});

export const EnrollmentActionFilterSchema = withQueryOptions({
  enrollmentActions: EnrollmentActionSchema,
});
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
export const StatsFilterSchema = SchoolYearSchema;
