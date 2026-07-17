import z from "zod";
import { createZodEnum } from "./utils";
import {
  CURRENCY_ENUM,
  FEE_SCHEDULES_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";

export const ZCURRENCY_ENUM = createZodEnum(CURRENCY_ENUM);
export const ZFEE_SCHEDULES_ENUM = createZodEnum(FEE_SCHEDULES_ENUM);
export const ZPAYMENT_METHOD_ENUM = createZodEnum(PAYMENT_METHOD_ENUM);

export const schoolIdBaseSchema = z.object({
  schoolId: z.string().nonempty().describe("École propriétaire"),
});

export const yearIdBaseSchema = z.object({
  yearId: z.string().nonempty().describe("Année académique"),
});

export const schoolYearIdBaseSchama = schoolIdBaseSchema.extend(
  yearIdBaseSchema.shape,
);

export const timestampBaseSchema = z.object({
  createdAt: z.iso.datetime().describe("Date de création"),
  updatedAt: z.iso.datetime().describe("Date de dernière modification"),
});
