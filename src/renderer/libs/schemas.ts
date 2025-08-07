import { z } from "zod";
import { SECTION, USER_GENDER, USER_ROLE } from "@/camons/constants/enum";

// =====================
// SCHÉMAS ZOD ET LEURS TYPES INFÉRÉS
// =====================

/**
 * Schéma Zod pour SchoolAttributes.
 */
export const SchoolSchema = z.object({
  name: z.string().nonempty("Le nom de l'école ne peut pas être vide."),
  adress: z.string().nonempty("L'adresse ne peut pas être vide."),
  town: z.string().nonempty("La ville ne peut pas être vide."),
  logo: z.string().nullable().optional(),
});

/**
 * Type TypeScript inféré du schéma SchoolSchema.
 */
export type SchoolAttributes = z.infer<typeof SchoolSchema>;

export const BaseUserSchema = z.object({
  lastName: z.string().nonempty("Le nom de famille ne peut pas être vide."),
  middleName: z.string().nonempty("Le deuxième prénom ne peut pas être vide."),
  firstName: z
    .string()
    .nonempty("Le prénom ne peut pas être vide.")
    .nullable()
    .optional(),
  role: z.nativeEnum(USER_ROLE, {
    errorMap: () => ({ message: "Rôle d'utilisateur invalide." }),
  }),
  birthDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "La date de naissance doit être au format AAAA-MM-JJ."
    )
    .nullable()
    .optional(),
  birthPlace: z
    .string()
    .nonempty("Le lieu de naissance ne peut pas être vide.")
    .nullable()
    .optional(),
});

export type BaseUserSchemaAttributes = z.infer<typeof BaseUserSchema>;
/**
 * Schéma Zod pour UserAttributes.
 */
export const UserSchema = z.object({
  lastName: z.string().nonempty("Le nom de famille ne peut pas être vide."),
  middleName: z.string().nonempty("Le deuxième prénom ne peut pas être vide."),
  firstName: z
    .string()
    .nonempty("Le prénom ne peut pas être vide.")
    .nullable()
    .optional(),
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères."),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères."),
  gender: z.nativeEnum(USER_GENDER, {
    errorMap: () => ({ message: "Genre d'utilisateur invalide." }),
  }),
  role: z.nativeEnum(USER_ROLE, {
    errorMap: () => ({ message: "Rôle d'utilisateur invalide." }),
  }),
  birthDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "La date de naissance doit être au format AAAA-MM-JJ."
    )
    .nullable()
    .optional(),
  birthPlace: z
    .string()
    .nonempty("Le lieu de naissance ne peut pas être vide.")
    .nullable()
    .optional(),
  schoolId: z.string().nonempty("L'ID de l'école ne peut pas être vide."),
});

/**
 * Type TypeScript inféré du schéma UserSchema.
 */
export type UserAttributes = z.infer<typeof UserSchema>;

/**
 * Schéma Zod pour OptionAttributes.
 */
export const OptionSchema = z.object({
  optionName: z.string().nonempty("Le nom de l'option ne peut pas être vide."),
  optionShortName: z
    .string()
    .nonempty("Le nom court de l'option ne peut pas être vide."),
  section: z.nativeEnum(SECTION, {
    errorMap: () => ({ message: "Section invalide." }),
  }),
});

/**
 * Type TypeScript inféré du schéma OptionSchema.
 */
export type OptionAttributes = z.infer<typeof OptionSchema>;

/**
 * Schéma Zod pour StudyYearAttributes.
 */
export const StudyYearSchema = z.object({
  yearName: z.string().nonempty("Le nom de l'année ne peut pas être vide."),
  startDate: z.coerce.date({
    errorMap: () => ({ message: "Date de début invalide." }),
  }),
  endDate: z.coerce.date({
    errorMap: () => ({ message: "Date de fin invalide." }),
  }),
  schoolId: z.string().nonempty("L'ID de l'école ne peut pas être vide."),
});

/**
 * Type TypeScript inféré du schéma StudyYearSchema.
 */
export type StudyYearAttributes = z.infer<typeof StudyYearSchema>;

/**
 * Schéma Zod pour ClassAttributes.
 */
export const ClassSchema = z.object({
  identifier: z.string().nonempty("L'identifiant ne peut pas être vide."),
  shortIdentifier: z
    .string()
    .nonempty("L'identifiant court ne peut pas être vide."),
  section: z.nativeEnum(SECTION, {
    errorMap: () => ({ message: "Section invalide." }),
  }),
  yearId: z
    .string()
    .nonempty("ID de l'annee scolaire encourt ne peut pas être vide."),
  schoolId: z.string().nonempty("L'ID de l'école ne peut pas être vide."),
  optionId: z.string().nullable().optional(),
});

/**
 * Type TypeScript inféré du schéma ClassSchema.
 */
export type ClassAttributes = z.infer<typeof ClassSchema>;

/**
 * Schéma Zod pour ClassroomEnrolementAttributes.
 */
export const ClassroomEnrolementSchema = z.object({
  classroomId: z.string().nonempty("L'ID de la classe ne peut pas être vide."),
  studentId: z.string().optional(),
  isNewStudent: z.boolean(),
  schoolId: z.string().nonempty("L'ID de l'école ne peut pas être vide."),
  yearId: z.string().nonempty("L'ID de l'annee scolaire ne doit pas etre vide"),
});

/**
 * Type TypeScript inféré du schéma ClassroomEnrolementSchema.
 */
export type ClassroomEnrolementAttributes = z.infer<
  typeof ClassroomEnrolementSchema
>;

/**
 *
 */
export const QuickEnrolementSchema = z
  .object({
    student: BaseUserSchema,
    isInSystem: z.boolean().optional(),
  })
  .merge(ClassroomEnrolementSchema);

/**
 *
 */

export type QuickEnrolementSchemaAttributes = z.infer<
  typeof QuickEnrolementSchema
>;
