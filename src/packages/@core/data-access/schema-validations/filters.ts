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

import { orArray } from "./filters.base";

export const SchoolYearSchema = z.object({
  schoolId: z.string().min(1, "L'ID de l'école est requis"),
  yearId: z.string().min(1, "L'ID de l'année est requis"),
});

export const SchoolFilterSchema = withQueryOptions(
  z.object({
    name: orArray(SchoolSchema.shape.name),
    address: orArray(SchoolSchema.shape.address),
    town: orArray(SchoolSchema.shape.town),
  }),
);

export const UserFilterSchema = withQueryOptions(
  z.object({
    userId: orArray(UserSchema.shape.userId),
    lastName: orArray(UserSchema.shape.lastName),
    middleName: orArray(UserSchema.shape.middleName),
    firstName: orArray(UserSchema.shape.firstName.unwrap().unwrap()),
    gender: orArray(UserSchema.shape.gender),
    role: orArray(UserSchema.shape.role),
    schoolId: orArray(UserSchema.shape.schoolId),
  }),
);

export const OptionFilterSchema = withQueryOptions(
  z.object({
    optionId: orArray(OptionSchema.shape.optionId),
    optionName: orArray(OptionSchema.shape.optionName),
    optionShortName: orArray(OptionSchema.shape.optionShortName),
    schoolId: orArray(OptionSchema.shape.schoolId),
    section: orArray(OptionSchema.shape.section),
  }),
);

export const StudyYearFilterSchema = withQueryOptions(
  z.object({
    yearId: orArray(StudyYearSchema.shape.yearId),
    yearName: orArray(StudyYearSchema.shape.yearName),
    schoolId: orArray(StudyYearSchema.shape.schoolId),
  }),
);

export const ClassroomFilterSchema = withQueryOptions(
  z.object({
    classId: orArray(ClassroomSchema.shape.classId),
    identifier: orArray(ClassroomSchema.shape.identifier),
    shortIdentifier: orArray(ClassroomSchema.shape.shortIdentifier),
    yearId: orArray(ClassroomSchema.shape.yearId),
    schoolId: orArray(ClassroomSchema.shape.schoolId),
    section: orArray(ClassroomSchema.shape.section),
    optionId: orArray(ClassroomSchema.shape.optionId.unwrap().unwrap()),
  }),
);

export const EnrollmentFilterSchema = withQueryOptions(
  z.object({
    enrollmentId: orArray(EnrollmentSchema.shape.enrollmentId),
    classroomId: orArray(EnrollmentSchema.shape.classroomId),
    studentId: orArray(EnrollmentSchema.shape.studentId),
    schoolId: orArray(EnrollmentSchema.shape.schoolId),
    yearId: orArray(EnrollmentSchema.shape.yearId),
    status: orArray(EnrollmentSchema.shape.status),
    studentCode: orArray(EnrollmentSchema.shape.studentCode),
  }),
);

export const EnrollmentActionFilterSchema = withQueryOptions(
  z.object({
    actionId: orArray(EnrollmentActionSchema.shape.actionId),
    enrollmentId: orArray(EnrollmentActionSchema.shape.enrollmentId),
    action: orArray(EnrollmentActionSchema.shape.action),
  }),
);

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

export const StatsFilterSchema = SchoolYearSchema;
