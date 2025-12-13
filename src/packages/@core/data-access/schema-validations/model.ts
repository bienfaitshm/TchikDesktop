import { z } from "zod";
import {
  SECTION,
  USER_GENDER,
  USER_ROLE,
  STUDENT_STATUS,
  ENROLEMENT_ACTION,
} from "@/commons/constants/enum";

// =============================================================================
//  A. Schémas de Base (Atomes)
// =============================================================================

/** Schéma de base pour les ID */
const ZodId = z.string().nonempty();

const ZodDateString = z
  .string()
  .refine((s) => !isNaN(Date.parse(s)), {
    message: "Must be a valid date string or date object",
  })
  .or(z.date());
const ZodOptionalDateString = ZodDateString.nullable().optional();

// =============================================================================
//  B. Modèles SCHEMAS (Création / Insertion)
// =============================================================================

// --- 1. School Schema ---
export const SchoolCreationSchema = z.object({
  name: z.string().min(3).max(255, "Le nom est trop long."),
  adress: z.string().min(5).max(255, "L'adresse est trop longue."),
  town: z.string().min(3).max(100),
  logo: z.string().nullable().optional(),
});

// --- 2. User Schema ---
export const UserCreationSchema = z
  .object({
    lastName: z.string().min(2).max(100),
    middleName: z.string().min(2).max(100),
    firstName: z.string().min(2).max(100).nullable().optional(),
    gender: z.nativeEnum(USER_GENDER).default(USER_GENDER.MALE).optional(),
    role: z.nativeEnum(USER_ROLE).default(USER_ROLE.STUDENT).optional(),
    birthDate: ZodOptionalDateString,
    birthPlace: z.string().max(100).nullable().optional(),
    username: z.string().min(5).max(50).optional(),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    schoolId: z.string().uuid(),
  })
  .strict(); // Utiliser strict() pour bloquer les champs non définis

// --- 3. Option Schema ---
export const OptionCreationSchema = z.object({
  optionName: z.string().min(3).max(150),
  optionShortName: z.string().min(2).max(10),
  section: z.nativeEnum(SECTION).default(SECTION.SECONDARY).optional(),
  schoolId: ZodId,
});

// --- 4. StudyYear Schema ---
export const StudyYearCreationSchema = z
  .object({
    yearName: z.string().min(4).max(50),
    startDate: ZodDateString,
    endDate: ZodDateString,
    schoolId: ZodId,
  })
  .refine((data) => data.startDate < data.endDate, {
    message: "La date de début doit être antérieure à la date de fin.",
    path: ["endDate"],
  });

// --- 5. Classroom Schema ---
export const ClassroomCreationSchema = z.object({
  identifier: z.string().min(2).max(50),
  shortIdentifier: z.string().min(1).max(10),
  yearId: ZodId,
  schoolId: ZodId,
  section: z.nativeEnum(SECTION),
  optionId: ZodId.nullable().optional(),
});

// --- 6. Classroom Enrolement Schema ---
export const EnrolementCreationSchema = z.object({
  classroomId: ZodId,
  studentId: ZodId,
  isNewStudent: z.boolean().default(false),
  schoolId: ZodId,
  status: z
    .nativeEnum(STUDENT_STATUS)
    .default(STUDENT_STATUS.EN_COURS)
    .optional(),
  code: z.string().max(20).optional(),
});

// --- 7. Classroom Enrolement Action Schema ---
export const EnrolementActionCreationSchema = z.object({
  enrolementId: z.string().uuid(),
  reason: z.string().max(255).optional(),
  action: z.nativeEnum(ENROLEMENT_ACTION),
});

// =============================================================================
//  C. SCHÉMAS DE FILTRE (GET / Paramètres de requête)
// =============================================================================

/**
 * Schéma générique pour les filtres de requête GET :
 * Tous les champs sont des chaînes de caractères (car ils proviennent d'URL Query Params) et sont optionnels.
 */
const ZodQueryFilter = z.string().optional();
const ZodEnumQueryFilter = z.string().or(z.nativeEnum(SECTION)).optional();

// Schémas de base pour la pagination et le tri, typiques dans les APIs REST.
const PaginationAndSortSchema = z
  .object({
    limit: z.coerce.number().int().positive().default(10).optional(),
    offset: z.coerce.number().int().nonnegative().default(0).optional(),
    orderBy: ZodQueryFilter,
    order: z.enum(["ASC", "DESC"]).optional(),
  })
  .partial();

export const UserFilterSchema = UserCreationSchema.pick({
  lastName: true,
  middleName: true,
  firstName: true,
  gender: true,
  role: true,
  username: true,
})
  .extend({
    ...PaginationAndSortSchema.shape,
    schoolId: ZodQueryFilter,
    birthDate: ZodQueryFilter, // Recherche par chaîne
    // Ajoutez ici tout champ calculé que vous souhaitez filtrer
  })
  .partial();

export const ClassRoomFilterSchema = ClassroomCreationSchema.pick({
  identifier: true,
  shortIdentifier: true,
  yearId: true,
  optionId: true,
})
  .extend({
    ...PaginationAndSortSchema.shape,
    section: ZodEnumQueryFilter,
    schoolId: ZodQueryFilter,
  })
  .partial();

export const EnrolementFilterSchema = EnrolementCreationSchema.pick({
  classroomId: true,
  studentId: true,
  isNewStudent: true,
  status: true,
  code: true,
})
  .extend({
    ...PaginationAndSortSchema.shape,
    schoolId: ZodQueryFilter,
  })
  .partial();
