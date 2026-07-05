import { z } from "zod";
import {
  CURRENCY_ENUM,
  FEE_SCHEDULES_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import { createZodEnum } from "./utils";

export const ZCURRENCY_ENUM = createZodEnum(CURRENCY_ENUM);
export const ZFEE_SCHEDULES_ENUM = createZodEnum(FEE_SCHEDULES_ENUM);
export const ZPAYMENT_METHOD_ENUM = createZodEnum(PAYMENT_METHOD_ENUM);

const timestampFields = {
  createdAt: z.string().datetime().describe("Date de création"),
  updatedAt: z.string().datetime().describe("Date de dernière modification"),
};

export const WalletSchema = z.object({
  walletId: z.string().describe("ID unique du portefeuille (UUID)"),
  name: z.string().min(1).describe("Nom du portefeuille"),
  currency: ZCURRENCY_ENUM.describe("Devise du portefeuille"),
  currentBalance: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Solde actuel (en centimes)"),
  schoolId: z.string().describe("École propriétaire"),
  ...timestampFields,
});

export type Wallet = z.infer<typeof WalletSchema>;
export const WalletCreateSchema = WalletSchema.omit({
  walletId: true,
  createdAt: true,
  updatedAt: true,
});
export const WalletUpdateSchema = WalletCreateSchema.partial();

export const FeeTypeSchema = z.object({
  feeTypeId: z.string().describe("ID unique du type de frais (UUID)"),
  name: z.string().min(1).describe("Nom du type de frais"),
  walletId: z.string().describe("Portefeuille associé"),
  yearId: z.string().describe("Année académique"),
  schoolId: z.string().describe("École propriétaire"),
  ...timestampFields,
});

export type FeeType = z.infer<typeof FeeTypeSchema>;
export const FeeTypeCreateSchema = FeeTypeSchema.omit({
  feeTypeId: true,
  createdAt: true,
  updatedAt: true,
});
export const FeeTypeUpdateSchema = FeeTypeCreateSchema.partial();

export const FeeConfigurationBase = z.object({
  feeConfigId: z.string().describe("ID unique de la configuration (UUID)"),
  name: z.string().min(1).describe("Nom de la configuration"),
  totalAmount: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Montant total en centimes"),
  currency: z.string().min(1).describe("Code devise (ex: USD, CDF)"),
  optionId: z.string().nullable().describe("Option cible (si applicable)"),
  classroomId: z.string().nullable().describe("Classe cible (si applicable)"),
  feeTypeId: z.string().describe("Type de frais associé"),
  yearId: z.string().describe("Année académique"),
  schoolId: z.string().describe("École propriétaire"),
  ...timestampFields,
});

export const addFeeConfigurationRefine = <
  T extends typeof FeeConfigurationBase,
>(
  schema: T,
) => {
  return schema.superRefine((data, ctx) => {
    const hasOption = data.optionId !== null;
    const hasClassroom = data.classroomId !== null;

    if (!hasOption && !hasClassroom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Vous devez spécifier soit une option, soit une classe (les deux ne peuvent pas être nulles).",
        path: ["optionId"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Vous devez spécifier soit une option, soit une classe (les deux ne peuvent pas être nulles).",
        path: ["classroomId"],
      });
    } else if (hasOption && hasClassroom) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Une configuration de frais ne peut pas cibler à la fois une option et une classe.",
        path: ["optionId"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Une configuration de frais ne peut pas cibler à la fois une option et une classe.",
        path: ["classroomId"],
      });
    }
  });
};
export const FeeConfigurationSchema =
  addFeeConfigurationRefine(FeeConfigurationBase);

export type FeeConfiguration = z.infer<typeof FeeConfigurationSchema>;
export const FeeConfigurationCreateSchema = FeeConfigurationBase.omit({
  feeConfigId: true,
  createdAt: true,
  updatedAt: true,
});
export const FeeConfigurationUpdateSchema =
  FeeConfigurationCreateSchema.partial();

export const FeeAssignmentSchema = z.object({
  assignmentId: z.string().describe("ID unique de l'attribution (UUID)"),
  enrollmentId: z.string().describe("Inscription concernée"),
  feeConfigId: z.string().describe("Configuration de frais appliquée"),
  amountPaid: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Montant déjà payé (en centimes)"),
  status: ZFEE_SCHEDULES_ENUM.describe(
    "Statut de l'échéancier (UNPAID, PARTIAL, PAID, ...)",
  ),
  ...timestampFields,
});

export type FeeAssignment = z.infer<typeof FeeAssignmentSchema>;
export const FeeAssignmentCreateSchema = FeeAssignmentSchema.omit({
  assignmentId: true,
  createdAt: true,
  updatedAt: true,
});
export const FeeAssignmentUpdateSchema = FeeAssignmentCreateSchema.partial();

export const StudentPaymentSchema = z.object({
  paymentId: z.string().describe("ID unique du paiement (UUID)"),
  assignmentId: z.string().describe("Attribution de frais liée"),
  amountReceived: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Montant reçu (en centimes)"),
  currencyReceived: ZCURRENCY_ENUM.describe("Devise du montant reçu"),
  appliedExchangeRate: z.coerce
    .number()
    .int()
    .positive()
    .describe("Taux de change appliqué (multiplié par 1 000 000)"),
  amountConverted: z.coerce
    .number()
    .int()
    .nonnegative()
    .describe("Montant converti dans la devise de la dette (en centimes)"),
  paymentMethod: ZPAYMENT_METHOD_ENUM.describe("Moyen de paiement"),
  transactionReference: z
    .string()
    .nullable()
    .optional()
    .describe("Référence externe (M-Pesa, bordereau)"),
  ...timestampFields,
});

export type StudentPayment = z.infer<typeof StudentPaymentSchema>;
export const StudentPaymentCreateSchema = StudentPaymentSchema.omit({
  paymentId: true,
  createdAt: true,
  updatedAt: true,
});
export const StudentPaymentUpdateSchema = StudentPaymentCreateSchema.partial();

export const DailyExchangeRateSchema = z.object({
  rateId: z.string().describe("ID unique du taux (UUID)"),
  date: z.string().datetime().describe("Date du taux (format ISO)"),
  currencyFrom: ZCURRENCY_ENUM.describe("Devise source"),
  currencyTo: ZCURRENCY_ENUM.describe("Devise cible"),
  rate: z.coerce
    .number()
    .int()
    .positive()
    .describe("Taux de change (multiplié par 1 000 000)"),
  schoolId: z.string().describe("École propriétaire"),
  ...timestampFields,
});

export type DailyExchangeRate = z.infer<typeof DailyExchangeRateSchema>;
export const DailyExchangeRateCreateSchema = DailyExchangeRateSchema.omit({
  rateId: true,
  createdAt: true,
  updatedAt: true,
});
export const DailyExchangeRateUpdateSchema =
  DailyExchangeRateCreateSchema.partial();
