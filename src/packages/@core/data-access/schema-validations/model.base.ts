import { z } from "zod";
import { createZodEnum } from "./utils";
import {
  CURRENCY_ENUM,
  FEE_SCHEDULES_ENUM,
  PAYMENT_METHOD_ENUM,
  ENROLLMENT_ACTION_ENUM,
  SECTION_ENUM,
  USER_GENDER_ENUM,
  USER_ROLE_ENUM,
  STUDENT_STATUS_ENUM,
} from "@/packages/@core/data-access/db/options";

export const ZSECTION_ENUM = createZodEnum(SECTION_ENUM);
export const ZUSER_GENDER_ENUM = createZodEnum(USER_GENDER_ENUM);
export const ZUSER_ROLE_ENUM = createZodEnum(USER_ROLE_ENUM);
export const ZSTUDENT_STATUS_ENUM = createZodEnum(STUDENT_STATUS_ENUM);
export const ZENROLLMENT_ACTION_ENUM = createZodEnum(ENROLLMENT_ACTION_ENUM);

/** Validation Zod pour les devises financières supportées. */
export const ZCURRENCY_ENUM = createZodEnum(CURRENCY_ENUM);

/** Validation Zod pour le statut d'un échéancier de frais. */
export const ZFEE_SCHEDULES_ENUM = createZodEnum(FEE_SCHEDULES_ENUM);

/** Validation Zod pour les modes de paiement acceptés. */
export const ZPAYMENT_METHOD_ENUM = createZodEnum(PAYMENT_METHOD_ENUM);

/**
 * Schéma de base garantissant la présence d'un identifiant d'école valide (Multi-tenancy).
 */
export const schoolIdBaseSchema = z.object({
  schoolId: z
    .string("L'identifiant de l'école est requis.")
    .min(1, "L'identifiant de l'école ne peut pas être vide.")
    .describe("Owner school identifier"),
});

export type SchoolIdBase = z.infer<typeof schoolIdBaseSchema>;

/**
 * Schéma de base garantissant la présence d'un identifiant d'année académique.
 */
export const yearIdBaseSchema = z.object({
  yearId: z
    .string("L'identifiant de l'année académique est requis.")
    .min(1, "L'identifiant de l'année académique ne peut pas être vide.")
    .describe("Academic year identifier"),
});

export type YearIdBase = z.infer<typeof yearIdBaseSchema>;

/**
 * Schéma combiné identifiant l'école et le contexte d'année académique.
 */
export const schoolYearIdBaseSchema = schoolIdBaseSchema.extend(
  yearIdBaseSchema.shape,
);

export type SchoolYearIdBase = z.infer<typeof schoolYearIdBaseSchema>;

/**
 * @deprecated Utilisez `schoolYearIdBaseSchema` (avec un 'e').
 */
export const schoolYearIdBaseSchama = schoolYearIdBaseSchema;

/**
 * Schéma de base pour les horodatages d'audit ISO 8601.
 * Utilise la primitive native `z.iso.datetime()` de Zod v4.
 */
export const timestampBaseSchema = z.object({
  createdAt: z.iso
    .datetime({
      message: "La date de création doit être une chaîne ISO 8601 valide.",
    })
    .describe("Creation timestamp"),
  updatedAt: z.iso
    .datetime({
      message: "La date de mise à jour doit être une chaîne ISO 8601 valide.",
    })
    .describe("Last modification timestamp"),
});

export type TimestampBase = z.infer<typeof timestampBaseSchema>;

/**
 * Helper Zod v4 pour gérer les champs textuels optionnels et nullables dans SQLite/Drizzle.
 * Accepte `undefined` (champ omis lors du payload) ou `null` (réinitialisation SQL).
 */
export const nullableString = z.string().nullable();
export const optionalNullableString = z.string().nullable().optional();
