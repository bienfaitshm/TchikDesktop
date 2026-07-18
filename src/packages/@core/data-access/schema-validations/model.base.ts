import { z } from "zod";
import { createZodEnum } from "./utils";
import {
  CURRENCY_ENUM,
  FEE_SCHEDULES_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";

/**
 * Zod validation enum for supported financial currencies.
 */
export const ZCURRENCY_ENUM = createZodEnum(CURRENCY_ENUM);

/**
 * Zod validation enum for fee schedule statuses.
 */
export const ZFEE_SCHEDULES_ENUM = createZodEnum(FEE_SCHEDULES_ENUM);

/**
 * Zod validation enum for accepted student payment methods.
 */
export const ZPAYMENT_METHOD_ENUM = createZodEnum(PAYMENT_METHOD_ENUM);

/**
 * Base schema ensuring the presence of a valid school identifier for multi-tenancy.
 */
export const schoolIdBaseSchema = z.object({
  schoolId: z.string().nonempty().describe("Owner school identifier"),
});

export type SchoolIdBase = z.infer<typeof schoolIdBaseSchema>;

/**
 * Base schema ensuring the presence of a valid academic year identifier.
 */
export const yearIdBaseSchema = z.object({
  yearId: z.string().nonempty().describe("Academic year identifier"),
});

/**
 * Combined base schema identifying both the school and the specific academic year context.
 */
export const schoolYearIdBaseSchema = schoolIdBaseSchema.extend(
  yearIdBaseSchema.shape,
);

export type SchoolYearIdBase = z.infer<typeof schoolYearIdBaseSchema>;
// Fallback alias to prevent breaking changes in files not yet refactored
export const schoolYearIdBaseSchama = schoolYearIdBaseSchema;

/**
 * Base schema enforcing standardized audit timestamps formatted as ISO strings.
 */
export const timestampBaseSchema = z.object({
  createdAt: z.iso.datetime().describe("Creation timestamp"),
  updatedAt: z.iso.datetime().describe("Last modification timestamp"),
});
