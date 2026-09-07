import { z } from "zod";
import { schoolIdBaseSchema as SchoolIdBaseSchema } from "./model.base";

/**
 * Zod schema to validate the payload for marking multiple students as Pro Deo.
 */
export const MarkStudentsAsProDeoSchema = z
  .object({
    enrollmentIds: z.array(z.string().min(1)),
    assignmentIds: z.array(z.string().min(1)),
  })
  .extend(SchoolIdBaseSchema.shape);

/**
 * Type inferred from MarkStudentsAsProDeoSchema representing the input DTO.
 */
export type MarkStudentsAsProDeoDto = z.infer<
  typeof MarkStudentsAsProDeoSchema
>;

/**
 * Zod schema to validate the payload for updating total amounts by assignment IDs.
 */
export const UpdateAmountByAssignmentsSchema = z
  .object({
    newTotalAmount: z.coerce.number().nonnegative(),
    assignmentIds: z.array(z.string().min(1)),
    scheduleIds: z.array(z.string().min(1)),
  })
  .extend(SchoolIdBaseSchema.shape);

/**
 * Type inferred from UpdateAmountByAssignmentsSchema representing the input DTO.
 */
export type UpdateAmountByAssignmentsDto = z.infer<
  typeof UpdateAmountByAssignmentsSchema
>;

/**
 * Zod schema to validate the payload for updating total amounts by classroom IDs.
 */
export const UpdateAmountByClassroomsSchema = z
  .object({
    newTotalAmount: z.coerce.number().nonnegative(),
    classroomIds: z.array(z.string().min(1)),
    scheduleIds: z.array(z.string().min(1)),
  })
  .extend(SchoolIdBaseSchema.shape);

/**
 * Type inferred from UpdateAmountByClassroomsSchema representing the input DTO.
 */
export type UpdateAmountByClassroomsDto = z.infer<
  typeof UpdateAmountByClassroomsSchema
>;
