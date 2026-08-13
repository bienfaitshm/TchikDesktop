import { z } from "zod";
import {
  SchoolSchema,
  UserSchema,
  TutorSchema,
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

/**
 * Zod schema for querying and filtering school entities with query options.
 */
export const SchoolFilterSchema = withQueryOptions({
  schools: SchoolSchema,
});

export type SchoolFilter = z.infer<typeof SchoolFilterSchema>;

/* =========================================================================
   USER FILTER
   ========================================================================= */

/**
 * Zod schema for querying and filtering user entities with query options.
 */
export const UserFilterSchema = withQueryOptions({
  users: UserSchema,
});

export type UserFilter = z.infer<typeof UserFilterSchema>;

/* =========================================================================
   TUTOR FILTER
   ========================================================================= */

/**
 * Zod schema for querying and filtering tutor entities with query options.
 */
export const TutorFilterSchema = withQueryOptions({
  tutors: TutorSchema,
});

export type TutorFilter = z.infer<typeof TutorFilterSchema>;

/* =========================================================================
   OPTION FILTER
   ========================================================================= */

/**
 * Zod schema for querying and filtering academic option entities.
 */
export const OptionFilterSchema = withQueryOptions({
  options: OptionSchema,
});

export type OptionFilter = z.infer<typeof OptionFilterSchema>;

/* =========================================================================
   STUDY YEAR FILTER
   ========================================================================= */

/**
 * Zod schema for querying and filtering academic study year entities.
 */
export const StudyYearFilterSchema = withQueryOptions({
  studyYears: StudyYearSchema,
});

export type StudyYearFilter = z.infer<typeof StudyYearFilterSchema>;

/* =========================================================================
   CLASSROOM FILTER
   ========================================================================= */

/**
 * Zod schema for querying and filtering classroom entities and options.
 */
export const ClassroomFilterSchema = withQueryOptions({
  classrooms: ClassroomSchema,
  options: OptionSchema,
});

export type ClassroomFilter = z.infer<typeof ClassroomFilterSchema>;

/* =========================================================================
   ENROLLMENT FILTER
   ========================================================================= */

/**
 * Zod schema for querying and filtering enrollments with student, class, and tutor relations.
 */
export const EnrollmentFilterSchema = withQueryOptions({
  classroomEnrollments: EnrollmentSchema,
  users: UserSchema,
  classrooms: ClassroomSchema,
  tutors: TutorSchema,
});

export type EnrollmentFilter = z.infer<typeof EnrollmentFilterSchema>;

/* =========================================================================
   ENROLLMENT ACTION FILTER
   ========================================================================= */

/**
 * Zod schema for querying and filtering enrollment audit action entities.
 */
export const EnrollmentActionFilterSchema = withQueryOptions({
  enrollmentActions: EnrollmentActionSchema,
});

export type EnrollmentActionFilter = z.infer<
  typeof EnrollmentActionFilterSchema
>;
