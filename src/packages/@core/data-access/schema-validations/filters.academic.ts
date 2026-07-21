import { z } from "zod";
import {
  SchoolSchema,
  UserSchema,
  OptionSchema,
  StudyYearSchema,
  ClassroomSchema,
  EnrollmentSchema,
  EnrollmentActionSchema,
} from "./model";

import { withQueryOptions } from "./helpers";

/* =========================================================================
   SCHOOL FILTER
   ========================================================================= */
export const SchoolFilterSchema = withQueryOptions({
  schools: SchoolSchema,
});
export type SchoolFilter = z.infer<typeof SchoolFilterSchema>;

/* =========================================================================
   USER FILTER
   ========================================================================= */
export const UserFilterSchema = withQueryOptions({
  users: UserSchema,
});
export type UserFilter = z.infer<typeof UserFilterSchema>;

/* =========================================================================
   OPTION FILTER
   ========================================================================= */
export const OptionFilterSchema = withQueryOptions({
  options: OptionSchema,
});
export type OptionFilter = z.infer<typeof OptionFilterSchema>;

/* =========================================================================
   STUDY YEAR FILTER
   ========================================================================= */
export const StudyYearFilterSchema = withQueryOptions({
  studyYears: StudyYearSchema,
});
export type StudyYearFilter = z.infer<typeof StudyYearFilterSchema>;

/* =========================================================================
   CLASSROOM FILTER
   ========================================================================= */
export const ClassroomFilterSchema = withQueryOptions({
  classrooms: ClassroomSchema,
  options: OptionSchema,
});
export type ClassroomFilter = z.infer<typeof ClassroomFilterSchema>;

/* =========================================================================
   ENROLLMENT FILTER
   ========================================================================= */
export const EnrollmentFilterSchema = withQueryOptions({
  classroomEnrollments: EnrollmentSchema,
  users: UserSchema,
  classrooms: ClassroomSchema,
});
export type EnrollmentFilter = z.infer<typeof EnrollmentFilterSchema>;

/* =========================================================================
   ENROLLMENT ACTION FILTER
   ========================================================================= */
export const EnrollmentActionFilterSchema = withQueryOptions({
  enrollmentActions: EnrollmentActionSchema,
});
export type EnrollmentActionFilter = z.infer<
  typeof EnrollmentActionFilterSchema
>;
