import { z } from "zod";
import { schoolIdBaseSchema, ZCURRENCY_ENUM } from "./model.base";

/**
 * Reusable Zod schema validating a non-empty array of non-empty string identifiers.
 */
const nonEmptyIdArraySchema = z.array(z.string().min(1));

/**
 * Shared base schema for financial amount update payloads bound to a specific school.
 */
const baseUpdateAmountSchema = z
  .object({
    newTotalAmount: z.coerce.number().nonnegative(),
    currency: ZCURRENCY_ENUM,
    scheduleIds: nonEmptyIdArraySchema,
  })
  .extend(schoolIdBaseSchema.shape);

/**
 * Zod schema validating the payload to grant Pro Deo status to student enrollments.
 */
export const MarkStudentsAsProDeoSchema = z
  .object({
    enrollmentIds: nonEmptyIdArraySchema,
    assignmentIds: nonEmptyIdArraySchema,
  })
  .extend(schoolIdBaseSchema.shape);

/**
 * type inferred from MarkStudentsAsProDeoSchema for Pro Deo status assignment.
 */
export type MarkStudentsAsProDeo = z.infer<typeof MarkStudentsAsProDeoSchema>;

/**
 * Zod schema validating the payload to exempt specific student enrollments from fee assignments.
 */
export const ExemptFromFeeSchema = z
  .object({
    studentEnrollmentIds: nonEmptyIdArraySchema,
    assignmentIds: nonEmptyIdArraySchema,
  })
  .extend(schoolIdBaseSchema.shape);

/**
 * type inferred from ExemptFromFeeSchema for fee exemption requests.
 */
export type ExemptFromFee = z.infer<typeof ExemptFromFeeSchema>;

/**
 * Zod schema validating payment amount updates filtered by assignment IDs.
 */
export const UpdateAmountByAssignmentsSchema = baseUpdateAmountSchema.extend({
  assignmentIds: nonEmptyIdArraySchema,
});

/**
 * type inferred from UpdateAmountByAssignmentsSchema for assignment amount updates.
 */
export type UpdateAmountByAssignments = z.infer<
  typeof UpdateAmountByAssignmentsSchema
>;

/**
 * Zod schema validating payment amount updates filtered by classroom IDs.
 */
export const UpdateAmountByClassroomsSchema = baseUpdateAmountSchema.extend({
  classroomIds: nonEmptyIdArraySchema,
});

/**
 * type inferred from UpdateAmountByClassroomsSchema for classroom amount updates.
 */
export type UpdateAmountByClassrooms = z.infer<
  typeof UpdateAmountByClassroomsSchema
>;
