import { z } from "zod";
import {
  SECTION,
  USER_GENDER,
  USER_ROLE,
  STUDENT_STATUS,
  ENROLEMENT_ACTION,
} from "@/packages/@core/data-access/db";
import { createZodEnum } from "./utils";

// =============================================================================
// I. ENUMS ZOD (Définitions Simples)
// =============================================================================

// Ces schémas doivent correspondre exactement aux valeurs de vos fichiers d'énumération.
// Assurez-vous que l'implémentation de ces schémas reflète la réalité de vos `enum`.
const ZSECTION = createZodEnum(SECTION);
const ZUSER_GENDER = createZodEnum(USER_GENDER);
const ZUSER_ROLE = createZodEnum(USER_ROLE);
const ZSTUDENT_STATUS = createZodEnum(STUDENT_STATUS);
const ZENROLEMENT_ACTION = createZodEnum(ENROLEMENT_ACTION);

// =============================================================================
// II. SCHÉMAS DE BASE (Attributs LECTURE - Équivalent aux Interfaces)
// =============================================================================

// ---------------------------
// 1. School Schemas
// ---------------------------

/**
 * Schéma Zod pour valider les attributs complets d'une École (lecture depuis la DB).
 * @typedef {z.infer<typeof SchoolAttributesSchema>} SchoolAttributes
 */
export const SchoolAttributesSchema = z.object({
  schoolId: z.string().uuid().describe("Identifiant unique de l'école (UUID)"),
  name: z.string().min(3).max(255).describe("Nom complet de l'école"),
  adress: z.string().max(255).describe("Adresse physique de l'école"),
  town: z.string().max(100).describe("Ville où se situe l'école"),
  logo: z
    .string()
    .url()
    .nullable()
    .optional()
    .describe("URL ou chemin du logo, peut être null"),
});

// ---------------------------
// 2. User Schemas
// ---------------------------

/**
 * Schéma Zod pour valider les attributs complets d'un Utilisateur (lecture depuis la DB).
 * @typedef {z.infer<typeof UserAttributesSchema>} UserAttributes
 */
export const UserAttributesSchema = z.object({
  userId: z
    .string()
    .uuid()
    .optional()
    .describe(
      "Identifiant unique de l'utilisateur (optionnel pour l'insertion)"
    ),
  lastName: z.string().min(2).max(100).describe("Nom de famille (requis)"),
  middleName: z.string().min(2).max(100).describe("Post-nom (requis)"),
  firstName: z
    .string()
    .min(2)
    .max(100)
    .nullable()
    .optional()
    .describe("Prénom (optionnel)"),
  // Le champ 'fullname' est virtuel, on utilise .optional() car il n'est pas envoyé par le client.
  fullname: z
    .string()
    .optional()
    .describe("Nom complet (Champ virtuel, non géré par le client)"),
  gender: ZUSER_GENDER.optional().describe("Sexe de l'utilisateur"),
  role: ZUSER_ROLE.optional().describe(
    "Rôle de l'utilisateur (Admin, Teacher, Student)"
  ),
  birthDate: z.coerce
    .date()
    .nullable()
    .optional()
    .describe("Date de naissance (format Date ou chaîne coercible)"),
  birthPlace: z
    .string()
    .max(100)
    .nullable()
    .optional()
    .describe("Lieu de naissance"),
  username: z
    .string()
    .min(4)
    .max(50)
    .optional()
    .describe("Nom d'utilisateur unique"),
  schoolId: z.string().uuid().optional().describe("Clé étrangère vers l'École"),
  password: z
    .string()
    .min(6)
    .max(255)
    .optional()
    .describe("Mot de passe (hashé en DB)"),
});

// ---------------------------
// 3. Option Schemas
// ---------------------------

/**
 * Schéma Zod pour valider les attributs complets d'une Option/Filière.
 * @typedef {z.infer<typeof OptionAttributesSchema>} OptionAttributes
 */
export const OptionAttributesSchema = z.object({
  optionId: z.string().uuid().describe("Identifiant unique de l'option"),
  optionName: z.string().min(3).max(100).describe("Nom complet de l'option"),
  optionShortName: z
    .string()
    .min(1)
    .max(10)
    .describe("Nom abrégé (sigle) de l'option"),
  schoolId: z.string().uuid().describe("Clé étrangère vers l'École"),
  section: ZSECTION.optional().describe(
    "Section à laquelle appartient l'option"
  ),
});

// ---------------------------
// 4. StudyYear Schemas
// ---------------------------

/**
 * Schéma Zod pour valider les attributs complets d'une Année d'Étude.
 * @typedef {z.infer<typeof StudyYearAttributesSchema>} StudyYearAttributes
 */
export const StudyYearAttributesSchema = z.object({
  yearId: z.string().uuid().describe("Identifiant unique de l'année d'étude"),
  yearName: z
    .string()
    .min(4)
    .max(50)
    .describe("Nom de l'année (ex: 2024-2025)"),
  startDate: z.coerce.date().describe("Date de début de l'année scolaire"),
  endDate: z.coerce.date().describe("Date de fin de l'année scolaire"),
  schoolId: z.string().uuid().describe("Clé étrangère vers l'École"),
});

// ---------------------------
// 5. Classroom Schemas
// ---------------------------

/**
 * Schéma Zod pour valider les attributs complets d'une Classe (Classroom).
 * @typedef {z.infer<typeof ClassroomAttributesSchema>} ClassroomAttributes
 */
export const ClassroomAttributesSchema = z.object({
  classId: z
    .string()
    .uuid()
    .optional()
    .describe("Identifiant unique de la classe"),
  identifier: z
    .string()
    .min(1)
    .max(50)
    .describe("Identifiant complet (ex: 7ème Scientifique)"),
  shortIdentifier: z
    .string()
    .min(1)
    .max(10)
    .describe("Identifiant court (ex: 7ème S)"),
  yearId: z.string().uuid().describe("Clé étrangère vers l'Année d'Étude"),
  schoolId: z.string().uuid().describe("Clé étrangère vers l'École"),
  section: ZSECTION.optional().describe("Section de la classe"),
  optionId: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .describe("Clé étrangère vers l'Option (null si pas de filière)"),
});

// ---------------------------
// 6. Enrolement Schemas
// ---------------------------

/**
 * Schéma Zod pour valider les attributs complets d'une Inscription (ClassroomEnrolement).
 * @typedef {z.infer<typeof EnrolementAttributesSchema>} ClassroomEnrolementAttributes
 */
export const EnrolementAttributesSchema = z.object({
  enrolementId: z
    .string()
    .uuid()
    .describe("Identifiant unique de l'inscription"),
  classroomId: z.string().uuid().describe("Clé étrangère vers la Classe"),
  studentId: z
    .string()
    .uuid()
    .describe("Clé étrangère vers l'Utilisateur (Étudiant)"),
  isNewStudent: z
    .boolean()
    .describe("Indique si c'est un nouvel étudiant dans l'école"),
  schoolId: z.string().uuid().describe("Clé étrangère vers l'École"),
  status: ZSTUDENT_STATUS.optional().describe(
    "Statut de l'étudiant dans cette classe"
  ),
  code: z
    .string()
    .max(50)
    .optional()
    .describe("Code ou matricule de l'inscription"),
});

// ---------------------------
// 7. Enrolement Action Schemas
// ---------------------------

/**
 * Schéma Zod pour valider les attributs complets d'une Action d'Inscription (Audit/Historique).
 * @typedef {z.infer<typeof EnrolementActionAttributesSchema>} ClassroomEnrolementActionAttributes
 */
export const EnrolementActionAttributesSchema = z.object({
  actionId: z.string().uuid().describe("Identifiant unique de l'action"),
  enrolementId: z
    .string()
    .uuid()
    .describe("Clé étrangère vers l'inscription concernée"),
  reason: z
    .string()
    .max(500)
    .optional()
    .describe("Raison du changement de statut ou de l'action"),
  action: ZENROLEMENT_ACTION.describe(
    "Type d'action effectuée (Create, ChangeStatus, Transfer)"
  ),
});

// =============================================================================
// III. SCHÉMAS CRUD (Création, Mise à Jour)
// =============================================================================

// Chaque schéma T...Create/Update est dérivé du schéma d'attributs de base.

// ---------------------------
// 1. School CRUD
// ---------------------------

/** Schéma pour la création d'une École (exclut 'schoolId', 'createdAt', 'updatedAt'). */
export const SchoolCreateSchema = SchoolAttributesSchema.omit({
  schoolId: true,
});
/** Schéma pour la mise à jour d'une École (rend tous les champs de création optionnels). */
export const SchoolUpdateSchema = SchoolCreateSchema.partial();

// ---------------------------
// 2. User CRUD
// ---------------------------

/** Schéma pour la création d'un Utilisateur (exclut 'userId', 'fullname'). */
export const UserCreateSchema = UserAttributesSchema.omit({
  userId: true,
  fullname: true,
});
/** Schéma pour la mise à jour d'un Utilisateur (rend tous les champs de création optionnels, sauf clés potentiellement invariantes). */
export const UserUpdateSchema = UserCreateSchema.partial();
// On peut affiner : par exemple, rendre 'username' et 'schoolId' non modifiables ou séparer la validation.

// ---------------------------
// 3. Option CRUD
// ---------------------------

/** Schéma pour la création d'une Option (exclut 'optionId'). */
export const OptionCreateSchema = OptionAttributesSchema.omit({
  optionId: true,
});
/** Schéma pour la mise à jour d'une Option. */
export const OptionUpdateSchema = OptionCreateSchema.partial();

// ---------------------------
// 4. StudyYear CRUD
// ---------------------------

/** Schéma pour la création d'une Année d'Étude (exclut 'yearId', 'createdAt', 'updatedAt'). */
export const StudyYearCreateSchema = StudyYearAttributesSchema.omit({
  yearId: true,
});
/** Schéma pour la mise à jour d'une Année d'Étude. */
export const StudyYearUpdateSchema = StudyYearCreateSchema.partial();

// ---------------------------
// 5. Classroom CRUD
// ---------------------------

/** Schéma pour la création d'une Classe (exclut 'classId'). */
export const ClassroomCreateSchema = ClassroomAttributesSchema.omit({
  classId: true,
});
/** Schéma pour la mise à jour d'une Classe. */
export const ClassroomUpdateSchema = ClassroomCreateSchema.partial();

// ---------------------------
// 6. Enrolement CRUD
// ---------------------------

/** Schéma pour la création d'une Inscription (exclut 'enrolementId'). */
export const EnrolementCreateSchema = EnrolementAttributesSchema.omit({
  enrolementId: true,
});
/** Schéma pour la mise à jour d'une Inscription (exclut les clés étrangères essentielles 'studentId' et 'classroomId' de la modification). */
export const EnrolementUpdateSchema = EnrolementCreateSchema.omit({
  studentId: true,
  classroomId: true,
}).partial();

// ---------------------------
// 7. Enrolement Action CRUD
// ---------------------------

/** Schéma pour l'enregistrement d'une nouvelle Action d'Inscription (Audit). */
export const EnrolementActionCreateSchema =
  EnrolementActionAttributesSchema.omit({
    actionId: true,
  });

// =============================================================================
// IV. SCHÉMAS UTILITAIRES (Filtres, Pagination)
// =============================================================================

// Supposons une dépendance (comme dans votre exemple précédent)
const ZodQueryFilter = z.string().optional();

/**
 * Schéma Zod pour les paramètres de pagination et de tri standard.
 * Tous les champs sont optionnels car les valeurs par défaut sont appliquées côté serveur.
 */
export const PaginationAndSortSchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .positive()
      .describe("Nombre maximal d'éléments à retourner.")
      .default(10)
      .optional(),
    offset: z.coerce
      .number()
      .int()
      .nonnegative()
      .describe("Décalage (offset) pour la pagination.")
      .default(0)
      .optional(),
    orderBy: ZodQueryFilter.describe(
      "Nom du champ sur lequel trier les résultats."
    ),
    order: z
      .enum(["ASC", "DESC"])
      .optional()
      .describe("Direction du tri (ASCendant ou DESCendant)."),
  })
  .partial(); // Rendre l'objet complet optionnel pour la validation des requêtes.

/**
 * Schéma Zod utilitaire pour envelopper n'importe quel type de filtre de données
 * avec les paramètres de pagination et de tri.
 * @template TData Le schéma de base pour les filtres spécifiques à une ressource.
 */
export const WithPaginationAndSortSchema = <TData extends z.ZodRawShape>(
  dataSchema: z.ZodObject<TData>
) =>
  dataSchema
    .partial()
    .and(PaginationAndSortSchema)
    .describe("Schéma combinant les filtres de données et la pagination.");
