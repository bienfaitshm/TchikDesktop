import { z } from "zod";
import {
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
  EnrollmentActionCreateSchema,
  LocalroomCreateSchema,
  LocalroomUpdateSchema,
  SeatingSessionCreateSchema,
  SeatingSessionUpdateSchema,
  SeatingAssignmentCreateSchema,
  SeatingAssignmentUpdateSchema,
  BulkSeatingAssignmentSchema,
} from "./model";

import {
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

export type SchoolCreate = z.infer<typeof SchoolCreateSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type OptionCreate = z.infer<typeof OptionCreateSchema>;
export type StudyYearCreate = z.infer<typeof StudyYearCreateSchema>;
export type ClassroomCreate = z.infer<typeof ClassroomCreateSchema>;
export type EnrollmentCreate = z.infer<typeof EnrollmentCreateSchema>;
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
