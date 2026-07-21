import { type z } from "zod";
import {
  UserCreateSchema,
  OptionCreateSchema,
  ClassroomCreateSchema,
  EnrollmentCreateSchema,
} from "./model.academic";
import {
  WalletCreateSchema,
  FeeTypeCreateSchema,
  FeeScheduleCreateSchema,
  DailyExchangeRateCreateSchema,
  FeeAssignmentCreateSchema,
  FeeConfigurationCreateSchema,
} from "./model.finance";
import { createBulkCreateSchema } from "./other";
import { LocalroomCreateSchema } from "./model.seatings";

/* =========================================================================
   ACADEMIC & CORE BULK SCHEMAS
   ========================================================================= */

export const UserBulkCreateSchema = createBulkCreateSchema(UserCreateSchema);
export type UserBulkCreate = z.infer<typeof UserBulkCreateSchema>;

export const OptionBulkCreateSchema =
  createBulkCreateSchema(OptionCreateSchema);
export type OptionBulkCreate = z.infer<typeof OptionBulkCreateSchema>;

export const ClassroomBulkCreateSchema = createBulkCreateSchema(
  ClassroomCreateSchema,
);
export type ClassroomBulkCreate = z.infer<typeof ClassroomBulkCreateSchema>;

export const EnrollmentBulkCreateSchema = createBulkCreateSchema(
  EnrollmentCreateSchema,
);
export type EnrollmentBulkCreate = z.infer<typeof EnrollmentBulkCreateSchema>;

export const LocalroomBulkCreateSchema = createBulkCreateSchema(
  LocalroomCreateSchema,
);
export type LocalroomBulkCreate = z.infer<typeof LocalroomBulkCreateSchema>;

/* =========================================================================
   FINANCE BULK SCHEMAS
   ========================================================================= */

export const WalletBulkCreateSchema =
  createBulkCreateSchema(WalletCreateSchema);
export type WalletBulkCreate = z.infer<typeof WalletBulkCreateSchema>;

export const FeeTypeBulkCreateSchema =
  createBulkCreateSchema(FeeTypeCreateSchema);
export type FeeTypeBulkCreate = z.infer<typeof FeeTypeBulkCreateSchema>;

export const FeeScheduleBulkCreateSchema = createBulkCreateSchema(
  FeeScheduleCreateSchema,
);
export type FeeScheduleBulkCreate = z.infer<typeof FeeScheduleBulkCreateSchema>;

export const DailyExchangeRateBulkCreateSchema = createBulkCreateSchema(
  DailyExchangeRateCreateSchema,
);
export type DailyExchangeRateBulkCreate = z.infer<
  typeof DailyExchangeRateBulkCreateSchema
>;

export const FeeAssignmentBulkCreateSchema = createBulkCreateSchema(
  FeeAssignmentCreateSchema,
);
export type FeeAssignmentBulkCreate = z.infer<
  typeof FeeAssignmentBulkCreateSchema
>;

export const FeeConfigurationBulkCreateSchema = createBulkCreateSchema(
  FeeConfigurationCreateSchema,
);
export type FeeConfigurationBulkCreate = z.infer<
  typeof FeeConfigurationBulkCreateSchema
>;
