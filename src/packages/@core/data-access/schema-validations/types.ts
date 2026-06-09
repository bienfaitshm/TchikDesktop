import { z } from "zod";
import {
  SchoolSchema,
  UserSchema,
  OptionSchema,
  StudyYearSchema,
  ClassroomSchema,
  EnrollmentSchema,
  EnrollmentActionSchema,
  SchoolCreateSchema,
  SchoolUpdateSchema,
  UserCreateSchema,
  UserUpdateSchema,
  OptionCreateSchema,
  OptionUpdateSchema,
  StudyYearCreateSchema,
  StudyYearUpdateSchema,
  ClassroomCreateSchema,
  ClassroomUpdateSchema,
  EnrollmentCreateSchema,
  EnrollmentUpdateSchema,
  EnrollmentQuickCreateSchema,
  EnrollmentActionCreateSchema,
  LocalroomSchema,
  LocalroomCreateSchema,
  LocalroomUpdateSchema,
  SeatingSessionSchema,
  SeatingSessionCreateSchema,
  SeatingSessionUpdateSchema,
  SeatingAssignmentSchema,
  SeatingAssignmentCreateSchema,
  SeatingAssignmentUpdateSchema,
  BulkSeatingAssignmentSchema,
} from "./model";

import {
  SchoolYearSchema,
  SchoolFilterSchema,
  UserFilterSchema,
  OptionFilterSchema,
  StudyYearFilterSchema,
  ClassroomFilterSchema,
  EnrollmentFilterSchema,
  EnrollmentActionFilterSchema,
  LocalroomFilterSchema,
  SeatingSessionFilterSchema,
  SeatingAssignmentFilterSchema,
  SeatingStatsFilterSchema,
  StatsFilterSchema,
} from "./filters";

/** Scope contextuel combinant une école et une année active */
export type SchoolYear = z.infer<typeof SchoolYearSchema>;

/** Attributs complets d'une École */
export type School = z.infer<typeof SchoolSchema>;

/** Attributs complets d'un Utilisateur */
export type User = z.infer<typeof UserSchema>;

/** Attributs complets d'une Option/Filière */
export type Option = z.infer<typeof OptionSchema>;

/** Attributs complets d'une Année Scolaire */
export type StudyYear = z.infer<typeof StudyYearSchema>;

/** Attributs complets d'une Classe */
export type Classroom = z.infer<typeof ClassroomSchema>;

/** Attributs complets d'une Inscription */
export type Enrollment = z.infer<typeof EnrollmentSchema>;

/** Attributs complets d'une Action d'Audit d'Inscription */
export type EnrollmentAction = z.infer<typeof EnrollmentActionSchema>;

export type SchoolCreate = z.infer<typeof SchoolCreateSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type OptionCreate = z.infer<typeof OptionCreateSchema>;
export type StudyYearCreate = z.infer<typeof StudyYearCreateSchema>;
export type ClassroomCreate = z.infer<typeof ClassroomCreateSchema>;
export type EnrollmentCreate = z.infer<typeof EnrollmentCreateSchema>;
export type EnrollmentQuickCreate = z.infer<typeof EnrollmentQuickCreateSchema>;
export type EnrollmentActionCreate = z.infer<
  typeof EnrollmentActionCreateSchema
>;

export type SchoolUpdate = z.infer<typeof SchoolUpdateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;
export type OptionUpdate = z.infer<typeof OptionUpdateSchema>;
export type StudyYearUpdate = z.infer<typeof StudyYearUpdateSchema>;
export type ClassroomUpdate = z.infer<typeof ClassroomUpdateSchema>;
export type EnrollmentUpdate = z.infer<typeof EnrollmentUpdateSchema>;

export type SchoolFilter = z.infer<typeof SchoolFilterSchema>;
export type UserFilter = z.infer<typeof UserFilterSchema>;
export type OptionFilter = z.infer<typeof OptionFilterSchema>;
export type StudyYearFilter = z.infer<typeof StudyYearFilterSchema>;
export type ClassroomFilter = z.infer<typeof ClassroomFilterSchema>;
export type EnrollmentFilter = z.infer<typeof EnrollmentFilterSchema>;
export type EnrollmentActionFilter = z.infer<
  typeof EnrollmentActionFilterSchema
>;
export type TStatsFilter = z.infer<typeof StatsFilterSchema>;

/** Attributs complets d'une Salle / Local */
export type Localroom = z.infer<typeof LocalroomSchema>;

/** Attributs complets d'une Session de placement (inclut le statut calculé applicatif) */
export type SeatingSession = z.infer<typeof SeatingSessionSchema> & {
  hasAssignments?: boolean;
};

/** Attributs complets d'une Assignation de place individuelle */
export type SeatingAssignment = z.infer<typeof SeatingAssignmentSchema>;

export type LocalroomCreate = z.infer<typeof LocalroomCreateSchema>;
export type SeatingSessionCreate = z.infer<typeof SeatingSessionCreateSchema>;
export type SeatingAssignmentCreate = z.infer<
  typeof SeatingAssignmentCreateSchema
>;
export type TBulkSeatingAssignment = z.infer<
  typeof BulkSeatingAssignmentSchema
>;

export type LocalroomUpdate = z.infer<typeof LocalroomUpdateSchema>;
export type SeatingSessionUpdate = z.infer<typeof SeatingSessionUpdateSchema>;
export type SeatingAssignmentUpdate = z.infer<
  typeof SeatingAssignmentUpdateSchema
>;

export type LocalroomFilter = z.infer<typeof LocalroomFilterSchema>;
export type SeatingSessionFilter = z.infer<typeof SeatingSessionFilterSchema>;
export type SeatingAssignmentFilter = z.infer<
  typeof SeatingAssignmentFilterSchema
>;
export type TSeatingStatsFilter = z.infer<typeof SeatingStatsFilterSchema>;
