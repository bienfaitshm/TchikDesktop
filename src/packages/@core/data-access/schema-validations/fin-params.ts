import z from "zod";
import { schoolYearIdBaseSchema } from "./model.base";
import { FeeConfigurationBase } from "./model.finance";

/**
 * Reusable schema for validating classroom identifier presence.
 */
const classroomIdSchema = z.object({
  classroomId: z.string().min(1, "Classroom identifier is required."),
});

/**
 * Schema for validating incoming request parameters when querying applicable classroom fee configurations.
 */
export const finClassroomApplicableConfigParamsSchema =
  schoolYearIdBaseSchema.extend(classroomIdSchema.shape);

/**
 * Type inference for financial classroom applicable configuration parameters.
 */
export type FinClassroomApplicableConfigParams = z.infer<
  typeof finClassroomApplicableConfigParamsSchema
>;

/**
 * Schema extracting the unique identifier of a fee configuration.
 */
export const feeConfigIdSchema = FeeConfigurationBase.pick({
  feeConfigId: true,
});

/**
 * Type inference for a fee configuration identifier.
 */
export type FeeConfigId = z.infer<typeof feeConfigIdSchema>;

/**
 * Schema validating the applicable targets (school, year, classroom, option, section) for fee rules.
 */
export const feeApplicableConfigurationSchema = FeeConfigurationBase.pick({
  optionId: true,
  section: true,
  schoolId: true,
  yearId: true,
})
  .required({
    schoolId: true,
    yearId: true,
  })
  .extend(classroomIdSchema.shape);

/**
 * Type inference for an applicable fee configuration structure.
 */
export type FeeApplicableConfiguration = z.infer<
  typeof feeApplicableConfigurationSchema
>;
