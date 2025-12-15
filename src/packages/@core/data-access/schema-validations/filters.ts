import {
  SchoolAttributesSchema,
  UserAttributesSchema,
  OptionAttributesSchema,
  StudyYearAttributesSchema,
  ClassroomAttributesSchema,
  EnrolementAttributesSchema,
  EnrolementActionAttributesSchema,
  WithPaginationAndSortSchema,
} from "./model";

// =============================================================================
// I. SCHÉMAS DE FILTRE
// =============================================================================

// ---------------------------
// 1. School Filter
// ---------------------------

/**
 * Schéma Zod pour filtrer les Écoles.
 * Permet le filtrage par nom, adresse ou ville (ou une partie) et inclut la pagination.
 * @typedef {z.infer<typeof SchoolFilterSchema>} TSchoolFilter
 */
export const SchoolFilterSchema = WithPaginationAndSortSchema(
  SchoolAttributesSchema.pick({
    name: true,
    adress: true,
    town: true,
  })
);

// ---------------------------
// 2. User Filter
// ---------------------------

/**
 * Schéma Zod pour filtrer les Utilisateurs.
 * Permet le filtrage par identifiants, nom, rôle ou genre, et inclut la pagination.
 * @typedef {z.infer<typeof UserFilterSchema>} TUserFilter
 */
export const UserFilterSchema = WithPaginationAndSortSchema(
  UserAttributesSchema.pick({
    userId: true,
    lastName: true,
    middleName: true,
    firstName: true,
    gender: true,
    role: true,
    schoolId: true,
  })
);

// ---------------------------
// 3. Option Filter
// ---------------------------

/**
 * Schéma Zod pour filtrer les Options (Filières).
 * Permet le filtrage par identifiants, nom ou section, et inclut la pagination.
 * @typedef {z.infer<typeof OptionFilterSchema>} TOptionFilter
 */
export const OptionFilterSchema = WithPaginationAndSortSchema(
  OptionAttributesSchema.pick({
    optionId: true,
    optionName: true,
    optionShortName: true,
    schoolId: true,
    section: true,
  })
);

// ---------------------------
// 4. StudyYear Filter
// ---------------------------

/**
 * Schéma Zod pour filtrer les Années d'Étude.
 * Permet le filtrage par nom, ou par l'école associée, et inclut la pagination.
 * @typedef {z.infer<typeof StudyYearFilterSchema>} TStudyYearFilter
 */
export const StudyYearFilterSchema = WithPaginationAndSortSchema(
  StudyYearAttributesSchema.pick({
    yearId: true,
    yearName: true,
    schoolId: true,
  })
);

// ---------------------------
// 5. Classroom Filter
// ---------------------------

/**
 * Schéma Zod pour filtrer les Classes.
 * Permet le filtrage par identifiants, année scolaire ou option, et inclut la pagination.
 * @typedef {z.infer<typeof ClassroomFilterSchema>} TClassroomFilter
 */
export const ClassroomFilterSchema = WithPaginationAndSortSchema(
  ClassroomAttributesSchema.pick({
    classId: true,
    identifier: true,
    yearId: true,
    schoolId: true,
    section: true,
    optionId: true,
  })
);

// ---------------------------
// 6. Enrolement Filter
// ---------------------------

/**
 * Schéma Zod pour filtrer les Inscriptions (ClassroomEnrolement).
 * Permet le filtrage par identifiants, statut, classe ou étudiant, et inclut la pagination.
 * @typedef {z.infer<typeof EnrolementFilterSchema>} TEnrolementFilter
 */
export const EnrolementFilterSchema = WithPaginationAndSortSchema(
  EnrolementAttributesSchema.pick({
    enrolementId: true,
    classroomId: true,
    studentId: true,
    schoolId: true,
    status: true,
  })
);

// ---------------------------
// 7. Enrolement Action Filter
// ---------------------------

/**
 * Schéma Zod pour filtrer l'Historique d'Actions d'Inscription (Audit).
 * Permet le filtrage par ID d'inscription et type d'action, et inclut la pagination.
 * @typedef {z.infer<typeof EnrolementActionFilterSchema>} TEnrolementActionFilter
 */
export const EnrolementActionFilterSchema = WithPaginationAndSortSchema(
  EnrolementActionAttributesSchema.pick({
    actionId: true,
    enrolementId: true,
    action: true,
  })
);
