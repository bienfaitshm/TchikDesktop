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
  withQueryOptions,
} from "./model";

export const SchoolYearSchema = z.object({
  schoolId: z.string().min(1, "L'ID de l'école est requis"),
  yearId: z.string().min(1, "L'ID de l'année est requis"),
});
export type SchoolYear = z.infer<typeof SchoolYearSchema>;

export const SchoolFilterSchema = withQueryOptions(SchoolSchema);
export const UserFilterSchema = withQueryOptions(UserSchema);
export const OptionFilterSchema = withQueryOptions(OptionSchema);
export const StudyYearFilterSchema = withQueryOptions(StudyYearSchema);
export const ClassroomFilterSchema = withQueryOptions(ClassroomSchema);
export const EnrollmentFilterSchema = withQueryOptions(EnrollmentSchema);
export const EnrollmentActionFilterSchema = withQueryOptions(
  EnrollmentActionSchema,
);
export const LocalroomFilterSchema = withQueryOptions(LocalroomSchema);
export const SeatingSessionFilterSchema =
  withQueryOptions(SeatingSessionSchema);
export const SeatingAssignmentFilterSchema = withQueryOptions(
  SeatingAssignmentSchema,
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
export const StatsFilterSchema = SchoolYearSchema;
