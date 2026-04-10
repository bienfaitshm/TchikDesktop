import { z } from "zod";
import {
  SECTION_ENUM,
  USER_GENDER_ENUM,
  USER_ROLE_ENUM,
  STUDENT_STATUS_ENUM,
  ENROLEMENT_ACTION_ENUM,
} from "@/packages/@core/data-access/db/enum";
import { createZodEnum } from "./utils";

// =============================================================================
// I. ENUMS ZOD (Définitions Simples)
// =============================================================================

const ZSECTION_ENUM = createZodEnum(SECTION_ENUM);
const ZUSER_GENDER_ENUM = createZodEnum(USER_GENDER_ENUM);
const ZUSER_ROLE_ENUM = createZodEnum(USER_ROLE_ENUM);
const ZSTUDENT_STATUS_ENUM = createZodEnum(STUDENT_STATUS_ENUM);
const ZENROLEMENT_ACTION_ENUM = createZodEnum(ENROLEMENT_ACTION_ENUM);

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
  schoolId: z.string().describe("Identifiant unique de l'école (UUID)"),
  name: z.string().min(3).max(255).describe("Nom complet de l'école"),
  adress: z.string().max(255).describe("Adresse physique de l'école"),
  town: z.string().max(100).describe("Ville où se situe l'école"),
  logo: z
    .string()
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
    .optional()
    .describe(
      "Identifiant unique de l'utilisateur (optionnel pour l'insertion)",
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
  fullName: z
    .string()
    .optional()
    .describe("Nom complet (Champ virtuel, non géré par le client)"),
  gender: ZUSER_GENDER_ENUM.optional().describe("Sexe de l'utilisateur"),
  role: ZUSER_ROLE_ENUM.optional().describe(
    "Rôle de l'utilisateur (Admin, Teacher, Student)",
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
  schoolId: z.string().optional().describe("Clé étrangère vers l'École"),
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
  optionId: z.string().describe("Identifiant unique de l'option"),
  optionName: z.string().min(3).max(100).describe("Nom complet de l'option"),
  optionShortName: z
    .string()
    .min(1)
    .max(10)
    .describe("Nom abrégé (sigle) de l'option"),
  schoolId: z.string().describe("Clé étrangère vers l'École"),
  section: ZSECTION_ENUM.optional().describe(
    "Section à laquelle appartient l'option",
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
  yearId: z.string().describe("Identifiant unique de l'année d'étude"),
  yearName: z
    .string()
    .min(4)
    .max(50)
    .describe("Nom de l'année (ex: 2024-2025)"),
  startDate: z.coerce.date().describe("Date de début de l'année scolaire"),
  endDate: z.coerce.date().describe("Date de fin de l'année scolaire"),
  schoolId: z.string().describe("Clé étrangère vers l'École"),
});

// ---------------------------
// 5. Classroom Schemas
// ---------------------------

/**
 * Schéma Zod pour valider les attributs complets d'une Classe (Classroom).
 * @typedef {z.infer<typeof ClassroomAttributesSchema>} ClassroomAttributes
 */
export const ClassroomAttributesSchema = z.object({
  classId: z.string().describe("Identifiant unique de la classe"),
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
  yearId: z.string().describe("Clé étrangère vers l'Année d'Étude"),
  schoolId: z.string().describe("Clé étrangère vers l'École"),
  section: ZSECTION_ENUM.optional().describe("Section de la classe"),
  optionId: z
    .string()

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

    .describe("Identifiant unique de l'inscription"),
  classroomId: z.string().describe("Clé étrangère vers la Classe"),
  studentId: z
    .string()

    .describe("Clé étrangère vers l'Utilisateur (Étudiant)"),
  isNewStudent: z
    .boolean()
    .describe("Indique si c'est un nouvel étudiant dans l'école"),
  schoolId: z.string().describe("Clé étrangère vers l'École"),
  yearId: z.string().describe("Clé étrangère vers l'Année d'Étude"),
  status: ZSTUDENT_STATUS_ENUM.optional().describe(
    "Statut de l'étudiant dans cette classe",
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
  actionId: z.string().describe("Identifiant unique de l'action"),
  enrolementId: z
    .string()

    .describe("Clé étrangère vers l'inscription concernée"),
  reason: z
    .string()
    .max(500)
    .optional()
    .describe("Raison du changement de statut ou de l'action"),
  action: ZENROLEMENT_ACTION_ENUM.describe(
    "Type d'action effectuée (Create, ChangeStatus, Transfer)",
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
  code: true,
});
/** Schéma pour la mise à jour d'une Inscription (exclut les clés étrangères essentielles 'studentId' et 'classroomId' de la modification). */
export const EnrolementUpdateSchema = EnrolementCreateSchema.omit({
  studentId: true,
  classroomId: true,
}).partial();

// Schéma de base des attributs de l'utilisateur pour la création, moins les champs système
const BaseStudentSchema = UserCreateSchema.omit({
  password: true,
  username: true,
  schoolId: true,
});

/**
 * Schéma Zod pour la création rapide d'une inscription (Quick Enrolment).
 *
 * Ce schéma est conditionnel :
 * 1. Si `isInSystem` est VRAI : `studentId` est requis, et `student` doit être omis.
 * 2. Si `isInSystem` est FAUX : `student` est requis (pour créer le nouvel utilisateur), et `studentId` doit être omis.
 *
 * @typedef {z.infer<typeof EnrolementQuickCreateSchema>} TEnrolementQuickCreate
 */
export const EnrolementQuickCreateSchema = EnrolementCreateSchema.merge(
  z.object({
    // Indique si l'étudiant existe déjà dans le système. Défaut à FAUX.
    isInSystem: z.boolean().default(false).optional(),

    // ID de l'étudiant existant (requis si isInSystem est VRAI).
    studentId: z.string().optional(),

    // Données du nouvel étudiant (requis si isInSystem est FAUX).
    student: BaseStudentSchema.optional(),
  }),
)
  // -------------------------------------------------------------------------
  // Logique de validation conditionnelle appliquée via superRefine
  // -------------------------------------------------------------------------
  .superRefine((data, ctx) => {
    const { isInSystem, studentId, student } = data;

    if (isInSystem) {
      // CAS 1 : L'étudiant existe (isInSystem = true ou undefined)

      // studentId DOIT être fourni et être un UUID valide.
      if (!studentId || !z.string().uuid().safeParse(studentId).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "L'ID de l'étudiant existant (`studentId`) est requis lorsque l'étudiant est déjà dans le système.",
          path: ["studentId"],
        });
      }

      // Le corps du nouvel étudiant (`student`) DOIT être omis.
      if (student) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Les données de l'étudiant (`student`) doivent être omises lorsque son ID (`studentId`) est fourni.",
          path: ["student"],
        });
      }
    } else {
      // CAS 2 : L'étudiant est nouveau (isInSystem = false)

      // Le corps du nouvel étudiant (`student`) DOIT être fourni.
      if (!student) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Les données de l'étudiant (`student`) sont requises pour la création d'un nouvel utilisateur.",
          path: ["student"],
        });
      }

      // studentId DOIT être omis.
      if (studentId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "L'ID de l'étudiant (`studentId`) doit être omis lors de la création d'un nouvel utilisateur.",
          path: ["studentId"],
        });
      }
    }
  });

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

/**
 * Extrait les clés d'un schéma Zod pour garantir que
 * les tris et recherches ne se font que sur des colonnes existantes.
 */
const getKeys = <T extends z.ZodRawShape>(shape: T) => {
  return Object.keys(shape) as [keyof T & string, ...(keyof T & string)[]];
};

/**
 * REECRITURE PRO & GÉNÉRIQUE
 */
export const withQueryOptions = <T extends z.ZodRawShape>(
  dataSchema: z.ZodObject<T>,
) => {
  const keys = getKeys(dataSchema.shape);

  // 1. Schéma pour le tri (Strict sur les colonnes)
  const SortStepSchema = z.object({
    column: z.enum(keys).describe("Nom de la colonne existante"),
    order: z.enum(["asc", "desc"]).default("asc"),
  });

  // 2. Construction du schéma global
  return z
    .object({
      /**
       * WHERE : Filtres d'égalité simples
       * On utilise partial() pour que chaque champ soit optionnel
       */
      where: dataSchema.partial().optional(),

      /**
       * WHERE IN : Record<colonne, tableau_de_valeurs>
       */
      whereIn: z.record(z.enum(keys), z.array(z.any())).optional(),

      /**
       * SEARCH : Record<colonne, chaine_recherche>
       */
      search: z.record(z.enum(keys), z.string()).optional(),

      /**
       * OR : Tableau de filtres partiels (chaque objet est un bloc OR)
       */
      or: z.array(dataSchema.partial()).optional(),

      /**
       * PAGINATION & TRI
       */
      limit: z.coerce
        .number()
        .int()
        .positive()
        .max(500)
        .default(100)
        .optional(),
      offset: z.coerce.number().int().nonnegative().default(0).optional(),
      orderBy: z.array(SortStepSchema).optional(),
    })
    .describe("Options de requête génériques typées sur la ressource.");
};
