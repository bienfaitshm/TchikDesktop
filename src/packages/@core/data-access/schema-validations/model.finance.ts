import { z } from "zod";
import {
  ZCURRENCY_ENUM,
  ZFEE_SCHEDULES_ENUM,
  ZPAYMENT_METHOD_ENUM,
  ZSECTION_ENUM,
  schoolIdBaseSchema,
  schoolYearIdBaseSchema,
  timestampBaseSchema,
  optionalNullableString,
} from "./model.base";

/* =========================================================================
   WALLETS
   ========================================================================= */

/**
 * Validates complete Wallet entity data.
 */
export const WalletSchema = z
  .object({
    walletId: z
      .string()
      .min(1, "L'ID du portefeuille est requis.")
      .describe("ID unique du portefeuille (UUID)"),
    name: z
      .string()
      .min(1, "Le nom du portefeuille est requis.")
      .describe("Nom du portefeuille"),
    currency: ZCURRENCY_ENUM.describe("Devise du portefeuille"),
    currentBalance: z.coerce
      .number()
      .int("Le solde doit être un entier.")
      .min(0, "Le solde ne peut pas être négatif.")
      .default(0)
      .describe("Solde actuel (en centimes)"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

export type Wallet = z.infer<typeof WalletSchema>;

/**
 * Validates payload required to create a Wallet.
 */
export const WalletCreateSchema = WalletSchema.omit({
  walletId: true,
  createdAt: true,
  updatedAt: true,
});
export type WalletCreate = z.infer<typeof WalletCreateSchema>;

/**
 * Validates payload required to update a Wallet.
 */
export const WalletUpdateSchema = WalletCreateSchema.omit({
  schoolId: true,
}).partial();
export type WalletUpdate = z.infer<typeof WalletUpdateSchema>;

/* =========================================================================
   FEE TYPES
   ========================================================================= */

/**
 * Validates complete FeeType entity data.
 */
export const FeeTypeSchema = z
  .object({
    feeTypeId: z
      .string()
      .min(1, "L'ID du type de frais est requis.")
      .describe("ID unique du type de frais (UUID)"),
    name: z
      .string()
      .min(1, "Le nom du type de frais est requis.")
      .describe("Nom du type de frais"),
    walletId: z
      .string()
      .min(1, "L'ID du portefeuille est requis.")
      .describe("Portefeuille associé"),
  })
  .extend(timestampBaseSchema.shape)
  .extend(schoolYearIdBaseSchema.shape);

export type FeeType = z.infer<typeof FeeTypeSchema>;

/**
 * Validates payload required to create a FeeType.
 */
export const FeeTypeCreateSchema = FeeTypeSchema.omit({
  feeTypeId: true,
  createdAt: true,
  updatedAt: true,
});
export type FeeTypeCreate = z.infer<typeof FeeTypeCreateSchema>;

/**
 * Validates payload required to update a FeeType.
 */
export const FeeTypeUpdateSchema = FeeTypeCreateSchema.omit({
  schoolId: true,
  yearId: true,
}).partial();
export type FeeTypeUpdate = z.infer<typeof FeeTypeUpdateSchema>;

/* =========================================================================
   FEE SCHEDULES
   ========================================================================= */

/**
 * Validates complete FeeSchedule entity data.
 */
export const FeeScheduleSchema = z
  .object({
    scheduleId: z
      .string()
      .min(1, "L'ID de l'échéance est requis.")
      .describe("ID unique de l'échéance (UUID)"),
    installmentName: z
      .string()
      .min(1, "Le nom de l'échéance est requis.")
      .describe("Nom du versement / de l'échéance (ex: Trimestre 1)"),
    feeTypeId: z
      .string()
      .min(1, "Le type de frais est requis.")
      .describe("Type de frais rattaché"),
  })
  .extend(timestampBaseSchema.shape);

export type FeeSchedule = z.infer<typeof FeeScheduleSchema>;

/**
 * Validates payload required to create a FeeSchedule.
 */
export const FeeScheduleCreateSchema = FeeScheduleSchema.omit({
  scheduleId: true,
  createdAt: true,
  updatedAt: true,
});
export type FeeScheduleCreate = z.infer<typeof FeeScheduleCreateSchema>;

/**
 * Validates payload required to update a FeeSchedule.
 */
export const FeeScheduleUpdateSchema = FeeScheduleCreateSchema.omit({
  feeTypeId: true,
}).partial();
export type FeeScheduleUpdate = z.infer<typeof FeeScheduleUpdateSchema>;

/* =========================================================================
   FEE CONFIGURATIONS
   ========================================================================= */

/**
 * Base schema definition for FeeConfiguration entity.
 */
export const FeeConfigurationBase = z
  .object({
    feeConfigId: z
      .string()
      .min(1, "L'ID de la configuration est requis.")
      .describe("ID unique de la configuration (UUID)"),
    name: z
      .string()
      .min(1, "Le nom de la configuration est requis.")
      .describe("Nom de la configuration"),
    totalAmount: z.coerce
      .number()
      .int("Le montant doit être un entier.")
      .min(0, "Le montant ne peut pas être négatif.")
      .describe("Montant total en centimes"),
    currency: ZCURRENCY_ENUM.describe("Devise de la configuration"),
    section: ZSECTION_ENUM.nullable()
      .optional()
      .describe("Section cible (si applicable)"),
    optionId: optionalNullableString.describe("Option cible (si applicable)"),
    classroomId: optionalNullableString.describe(
      "Classe cible (si applicable)",
    ),
    feeTypeId: z
      .string()
      .min(1, "Le type de frais est requis.")
      .describe("Type de frais associé"),
  })
  .extend(timestampBaseSchema.shape)
  .extend(schoolYearIdBaseSchema.shape);

/**
 * Applies target validation checking that exactly one target entity is set.
 * @param schema - The base Zod schema to refine.
 * @returns Refined Zod schema enforcing target uniqueness.
 */
export const addFeeConfigurationRefine = <T extends z.ZodObject<any>>(
  schema: T,
) => {
  return schema.superRefine((data, ctx) => {
    const hasSection = data.section !== undefined && data.section !== null;
    const hasOption = data.optionId !== undefined && data.optionId !== null;
    const hasClassroom =
      data.classroomId !== undefined && data.classroomId !== null;

    const targets = [hasSection, hasOption, hasClassroom].filter(Boolean);

    if (targets.length === 0) {
      const msg =
        "Vous devez spécifier exactement une cible (soit une section, une option ou une classe).";
      ctx.addIssue({ message: msg, path: ["section"], code: "custom" });
      ctx.addIssue({ message: msg, path: ["optionId"], code: "custom" });
      ctx.addIssue({ message: msg, path: ["classroomId"], code: "custom" });
    } else if (targets.length > 1) {
      const msg =
        "Une configuration de frais ne peut pas cibler plusieurs entités en même temps.";
      if (hasSection)
        ctx.addIssue({ message: msg, path: ["section"], code: "custom" });
      if (hasOption)
        ctx.addIssue({ message: msg, path: ["optionId"], code: "custom" });
      if (hasClassroom)
        ctx.addIssue({ message: msg, path: ["classroomId"], code: "custom" });
    }
  });
};

/**
 * Validates complete FeeConfiguration entity data.
 */
export const FeeConfigurationSchema =
  addFeeConfigurationRefine(FeeConfigurationBase);
export type FeeConfiguration = z.infer<typeof FeeConfigurationSchema>;

/**
 * Validates payload required to create a FeeConfiguration.
 */
export const FeeConfigurationCreateSchema = addFeeConfigurationRefine(
  FeeConfigurationBase.omit({
    feeConfigId: true,
    createdAt: true,
    updatedAt: true,
  }),
);
export type FeeConfigurationCreate = z.infer<
  typeof FeeConfigurationCreateSchema
>;

/**
 * Validates payload required to update a FeeConfiguration.
 */
export const FeeConfigurationUpdateSchema = FeeConfigurationBase.omit({
  feeConfigId: true,
  createdAt: true,
  updatedAt: true,
  schoolId: true,
  yearId: true,
}).partial();
export type FeeConfigurationUpdate = z.infer<
  typeof FeeConfigurationUpdateSchema
>;

/* =========================================================================
   FEE ASSIGNMENTS
   ========================================================================= */

/**
 * Validates complete FeeAssignment entity data.
 */
export const FeeAssignmentSchema = z
  .object({
    assignmentId: z
      .string()
      .min(1, "L'ID d'attribution est requis.")
      .describe("ID unique de l'attribution (UUID)"),
    enrollmentId: z
      .string()
      .min(1, "L'inscription est requise.")
      .describe("Inscription concernée"),
    feeConfigId: z
      .string()
      .min(1, "La configuration de frais est requise.")
      .describe("Configuration de frais appliquée"),
    scheduleId: z
      .string()
      .min(1, "L'échéance est requise.")
      .describe("Échéance associée"),
    amountPaid: z.coerce
      .number()
      .int()
      .min(0, "Le montant payé ne peut pas être négatif.")
      .default(0)
      .describe("Montant déjà payé (en centimes)"),
    totalAmount: z.coerce
      .number()
      .int()
      .min(0, "Le montant total ne peut pas être négatif.")
      .default(0)
      .describe("Montant total dû (en centimes)"),
    currency: ZCURRENCY_ENUM.describe("Devise de l'attribution"),
    status: ZFEE_SCHEDULES_ENUM.describe(
      "Statut de l'échéancier (UNPAID, PARTIAL, PAID, ...)",
    ),
    isCustomized: z
      .boolean()
      .default(false)
      .describe("Indique si l'attribution a fait l'objet d'un ajustement"),
  })
  .extend(timestampBaseSchema.shape);

export type FeeAssignment = z.infer<typeof FeeAssignmentSchema>;

/**
 * Validates payload required to create a FeeAssignment.
 */
export const FeeAssignmentCreateSchema = FeeAssignmentSchema.omit({
  assignmentId: true,
  createdAt: true,
  updatedAt: true,
});
export type FeeAssignmentCreate = z.infer<typeof FeeAssignmentCreateSchema>;

/**
 * Validates payload required to update a FeeAssignment.
 */
export const FeeAssignmentUpdateSchema = FeeAssignmentCreateSchema.omit({
  enrollmentId: true,
  feeConfigId: true,
  scheduleId: true,
}).partial();
export type FeeAssignmentUpdate = z.infer<typeof FeeAssignmentUpdateSchema>;

/* =========================================================================
   STUDENT PAYMENTS
   ========================================================================= */

/**
 * Validates complete StudentPayment entity data.
 */
export const StudentPaymentSchema = z
  .object({
    paymentId: z
      .string()
      .min(1, "L'ID du paiement est requis.")
      .describe("ID unique du paiement (UUID)"),
    assignmentId: z
      .string()
      .min(1, "L'attribution de frais est requise.")
      .describe("Attribution de frais liée"),
    amountReceived: z.coerce
      .number()
      .int()
      .positive("Le montant reçu doit être supérieur à zéro.")
      .describe("Montant reçu (en centimes)"),
    currencyReceived: ZCURRENCY_ENUM.describe("Devise du montant reçu"),
    appliedExchangeRate: z.coerce
      .number()
      .int()
      .positive("Taux de change invalide.")
      .describe("Taux de change appliqué"),
    amountConverted: z.coerce
      .number()
      .int()
      .min(0)
      .describe("Montant converti dans la devise de la dette (en centimes)"),
    paymentMethod: ZPAYMENT_METHOD_ENUM.describe("Moyen de paiement"),
    transactionReference: optionalNullableString.describe(
      "Référence externe (M-Pesa, bordereau)",
    ),
    userId: optionalNullableString.describe(
      "Utilisateur ayant saisi le paiement",
    ),
  })
  .extend(timestampBaseSchema.shape)
  .extend(schoolYearIdBaseSchema.shape);

export type StudentPayment = z.infer<typeof StudentPaymentSchema>;

/**
 * Validates payload required to create a StudentPayment.
 */
export const StudentPaymentCreateSchema = StudentPaymentSchema.omit({
  paymentId: true,
  createdAt: true,
  updatedAt: true,
});
export type StudentPaymentCreate = z.infer<typeof StudentPaymentCreateSchema>;

/**
 * Validates payload required to update a StudentPayment.
 */
export const StudentPaymentUpdateSchema = StudentPaymentCreateSchema.omit({
  schoolId: true,
  yearId: true,
  assignmentId: true,
}).partial();
export type StudentPaymentUpdate = z.infer<typeof StudentPaymentUpdateSchema>;

/* =========================================================================
   DAILY EXCHANGE RATES
   ========================================================================= */

/**
 * Validates complete DailyExchangeRate entity data.
 */
export const DailyExchangeRateSchema = z
  .object({
    rateId: z
      .string()
      .min(1, "L'ID du taux est requis.")
      .describe("ID unique du taux (UUID)"),
    date: z.date(),
    currencyFrom: ZCURRENCY_ENUM.describe("Devise source"),
    currencyTo: ZCURRENCY_ENUM.describe("Devise cible"),
    rate: z.coerce
      .number()
      .int()
      .positive("Le taux doit être un entier positif.")
      .describe("Taux de change (multiplié par 1 000 000)"),
  })
  .extend(schoolIdBaseSchema.shape)
  .extend(timestampBaseSchema.shape);

export type DailyExchangeRate = z.infer<typeof DailyExchangeRateSchema>;

/**
 * Validates payload required to create a DailyExchangeRate.
 */
export const DailyExchangeRateCreateSchema = DailyExchangeRateSchema.omit({
  rateId: true,
  createdAt: true,
  updatedAt: true,
});
export type DailyExchangeRateCreate = z.infer<
  typeof DailyExchangeRateCreateSchema
>;

/**
 * Validates payload required to update a DailyExchangeRate.
 */
export const DailyExchangeRateUpdateSchema = DailyExchangeRateCreateSchema.omit(
  { schoolId: true },
).partial();
export type DailyExchangeRateUpdate = z.infer<
  typeof DailyExchangeRateUpdateSchema
>;

/* =========================================================================
   FEE OVERRIDES
   ========================================================================= */

/**
 * Base schema definition for FeeOverride entity.
 */
export const FeeOverrideBase = z
  .object({
    feeOverrideId: z
      .string()
      .min(1, "L'ID du surpassement est requis.")
      .describe("ID unique du surpassement de frais (UUID)"),
    feeTypeId: z
      .string()
      .min(1, "Le type de frais est requis.")
      .describe("Type de frais concerné"),
    classId: optionalNullableString.describe("Classe cible (si applicable)"),
    enrollmentId: optionalNullableString.describe(
      "Inscription cible (si applicable)",
    ),
    customAmount: z.coerce
      .number()
      .int("Le montant personnalisé doit être un entier.")
      .min(0, "Le montant personnalisé ne peut pas être négatif.")
      .describe("Montant personnalisé (en centimes)"),
    reason: optionalNullableString.describe("Motif de la dérogation"),
  })
  .extend(timestampBaseSchema.shape);

/**
 * Applies refinement checking that at least one target (classId or enrollmentId) is present.
 * @param schema - The base Zod schema to refine.
 * @returns Refined Zod schema enforcing target validation.
 */
export const addFeeOverrideRefine = <T extends z.ZodObject<any>>(schema: T) => {
  return schema.superRefine((data, ctx) => {
    const hasClass = data.classId !== undefined && data.classId !== null;
    const hasEnrollment =
      data.enrollmentId !== undefined && data.enrollmentId !== null;

    if (!hasClass && !hasEnrollment) {
      const msg =
        "Vous devez spécifier au moins une cible (soit une classe, soit une inscription).";
      ctx.addIssue({ message: msg, path: ["classId"], code: "custom" });
      ctx.addIssue({ message: msg, path: ["enrollmentId"], code: "custom" });
    }
  });
};

/**
 * Validates complete FeeOverride entity data.
 */
export const FeeOverrideSchema = addFeeOverrideRefine(FeeOverrideBase);
export type FeeOverride = z.infer<typeof FeeOverrideSchema>;

/**
 * Validates payload required to create a FeeOverride.
 */
export const FeeOverrideCreateSchema = addFeeOverrideRefine(
  FeeOverrideBase.omit({
    feeOverrideId: true,
    createdAt: true,
    updatedAt: true,
  }),
);
export type FeeOverrideCreate = z.infer<typeof FeeOverrideCreateSchema>;

/**
 * Validates payload required to update a FeeOverride.
 */
export const FeeOverrideUpdateSchema = FeeOverrideBase.omit({
  feeOverrideId: true,
  createdAt: true,
  updatedAt: true,
  feeTypeId: true,
}).partial();
export type FeeOverrideUpdate = z.infer<typeof FeeOverrideUpdateSchema>;

/* =========================================================================
   PROCESS PAYMENT PAYLOAD
   ========================================================================= */

/**
 * Validates payload required to execute payment processing logic.
 */
export const ProcessPaymentSchema = z
  .object({
    assignmentId: z.string().min(1, "L'attribution est requise."),
    amountReceived: z.coerce.number().positive("Le montant doit être positif."),
    currencyReceived: ZCURRENCY_ENUM,
    paymentMethod: ZPAYMENT_METHOD_ENUM,
    transactionReference: optionalNullableString,
  })
  .extend(schoolYearIdBaseSchema.shape);

export type ProcessPaymentPayload = z.infer<typeof ProcessPaymentSchema>;
