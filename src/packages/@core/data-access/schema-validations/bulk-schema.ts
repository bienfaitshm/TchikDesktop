import {
  UserCreateSchema,
  OptionCreateSchema,
  ClassroomCreateSchema,
  EnrollmentCreateSchema,
} from "./model";
import {
  WalletCreateSchema,
  FeeTypeCreateSchema,
  FeeScheduleCreateSchema,
  DailyExchangeRateCreateSchema,
  FeeAssignmentCreateSchema,
  FeeConfigurationCreateSchema,
} from "./model.finance";
import { LocalroomCreateSchema } from "./model.seatings";
import { type InferBulkCreate, createBulkCreateSchema } from "./other";

export const UserBulkCreateSchema = createBulkCreateSchema(UserCreateSchema);
export type UserBulkCreate = InferBulkCreate<typeof UserCreateSchema>;

export const OptionBulkCreateSchema =
  createBulkCreateSchema(OptionCreateSchema);
export type OptionBulkCreate = InferBulkCreate<typeof OptionCreateSchema>;

export const ClassroomBulkCreateSchema = createBulkCreateSchema(
  ClassroomCreateSchema,
);
export type ClassroomBulkCreate = InferBulkCreate<typeof ClassroomCreateSchema>;

export const EnrollmentBulkCreateSchema = createBulkCreateSchema(
  EnrollmentCreateSchema,
);
export type EnrollmentBulkCreate = InferBulkCreate<
  typeof EnrollmentCreateSchema
>;

export const WalletBulkCreateSchema =
  createBulkCreateSchema(WalletCreateSchema);
export type WalletBulkCreate = InferBulkCreate<typeof WalletCreateSchema>;

export const FeeTypeBulkCreateSchema =
  createBulkCreateSchema(FeeTypeCreateSchema);
export type FeeTypeBulkCreate = InferBulkCreate<typeof FeeTypeCreateSchema>;

export const FeeScheduleBulkCreateSchema = createBulkCreateSchema(
  FeeScheduleCreateSchema,
);
export type FeeScheduleBulkCreate = InferBulkCreate<
  typeof FeeScheduleCreateSchema
>;

export const DailyExchangeRateBulkCreateSchema = createBulkCreateSchema(
  DailyExchangeRateCreateSchema,
);
export type DailyExchangeRateBulkCreate = InferBulkCreate<
  typeof DailyExchangeRateCreateSchema
>;

export const FeeAssignmentBulkCreateSchema = createBulkCreateSchema(
  FeeAssignmentCreateSchema,
);
export type FeeAssignmentBulkCreate = InferBulkCreate<
  typeof FeeAssignmentCreateSchema
>;

export const FeeConfigurationBulkCreateSchema = createBulkCreateSchema(
  FeeConfigurationCreateSchema,
);
export type FeeConfigurationBulkCreate = InferBulkCreate<
  typeof FeeConfigurationCreateSchema
>;

export const LocalroomBulkCreateSchema = createBulkCreateSchema(
  LocalroomCreateSchema,
);
export type LocalroomBulkCreate = InferBulkCreate<typeof LocalroomCreateSchema>;
