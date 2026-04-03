import { z } from "zod";
import {
  // Schémas d'Attributs (Lecture DB)
  SchoolAttributesSchema,
  UserAttributesSchema,
  OptionAttributesSchema,
  StudyYearAttributesSchema,
  ClassroomAttributesSchema,
  EnrolementAttributesSchema,
  EnrolementActionAttributesSchema,

  // Schémas de Création (Body POST)
  SchoolCreateSchema, // Renommé de CreationSchema
  UserCreateSchema,
  OptionCreateSchema,
  StudyYearCreateSchema,
  ClassroomCreateSchema,
  EnrolementCreateSchema,
  EnrolementQuickCreateSchema,
  EnrolementActionCreateSchema,

  // Schémas de Mise à Jour (Body PUT/PATCH)
  SchoolUpdateSchema,
  UserUpdateSchema,
  OptionUpdateSchema,
  StudyYearUpdateSchema,
  ClassroomUpdateSchema,
  EnrolementUpdateSchema,
} from "./model";

import {
  BulkSeatingAssignmentSchema,
  LocalRoomAttributesSchema,
  LocalRoomCreateSchema,
  LocalRoomUpdateSchema,
  SeatingAssignmentAttributesSchema,
  SeatingAssignmentCreateSchema,
  SeatingAssignmentUpdateSchema,
  SeatingSessionAttributesSchema,
  SeatingSessionCreateSchema,
  SeatingSessionUpdateSchema,
} from "./model.seatings";

import {
  // Schémas de Filtre (Query Params)
  SchoolFilterSchema,
  UserFilterSchema,
  OptionFilterSchema,
  StudyYearFilterSchema,
  ClassroomFilterSchema,
  EnrolementFilterSchema,
  EnrolementActionFilterSchema,
  StatsFilterSchema,
} from "./filters";

import {
  LocalRoomFilterSchema,
  SeatingAssignmentFilterSchema,
  SeatingSessionFilterSchema,
  SeatingStatsFilterSchema,
} from "./filters.seatings";

// =============================================================================
// I. TYPES DE DONNÉES COMPLETS (Lecture DB)
// =============================================================================

/** Type des attributs complets d'une École (lecture depuis la DB) */
export type TSchoolAttributes = z.infer<typeof SchoolAttributesSchema>;

/** Type des attributs complets d'un Utilisateur (lecture depuis la DB) */
export type TUserAttributes = z.infer<typeof UserAttributesSchema>;

/** Type des attributs complets d'une Option (lecture depuis la DB) */
export type TOptionAttributes = z.infer<typeof OptionAttributesSchema>;

/** Type des attributs complets d'une Année Scolaire (lecture depuis la DB) */
export type TStudyYearAttributes = z.infer<typeof StudyYearAttributesSchema>;

/** Type des attributs complets d'une Classe (lecture depuis la DB) */
export type TClassroomAttributes = z.infer<typeof ClassroomAttributesSchema>;

/** Type des attributs complets d'une Inscription (lecture depuis la DB) */
export type TEnrolementAttributes = z.infer<typeof EnrolementAttributesSchema>;

/** Type des attributs complets d'une Action d'Inscription (lecture depuis la DB) */
export type TEnrolementActionAttributes = z.infer<
  typeof EnrolementActionAttributesSchema
>;

// =============================================================================
// II. TYPES DE CRÉATION (Body POST)
// =============================================================================

/** Type des données requises pour créer une École (Body de requête) */
export type TSchoolCreate = z.infer<typeof SchoolCreateSchema>;

/** Type des données requises pour créer un Utilisateur (Body de requête) */
export type TUserCreate = z.infer<typeof UserCreateSchema>;

/** Type des données requises pour créer une Option (Body de requête) */
export type TOptionCreate = z.infer<typeof OptionCreateSchema>;

/** Type des données requises pour créer une Année Scolaire (Body de requête) */
export type TStudyYearCreate = z.infer<typeof StudyYearCreateSchema>;

/** Type des données requises pour créer une Classe (Body de requête) */
export type TClassroomCreate = z.infer<typeof ClassroomCreateSchema>;

/** Type des données requises pour créer une Inscription (Body de requête) */
export type TEnrolementCreate = z.infer<typeof EnrolementCreateSchema>;

/** Type des données requises pour créer une Inscription (Body de requête) */
export type TEnrolementQuickCreate = z.infer<
  typeof EnrolementQuickCreateSchema
>;

/** Type des données requises pour créer une Action d'Inscription (Body de requête) */
export type TEnrolementActionCreate = z.infer<
  typeof EnrolementActionCreateSchema
>;

// =============================================================================
// III. TYPES DE MISE À JOUR (Body PUT/PATCH)
// =============================================================================

/** Type des données optionnelles pour mettre à jour une École (Body de requête) */
export type TSchoolUpdate = z.infer<typeof SchoolUpdateSchema>;

/** Type des données optionnelles pour mettre à jour un Utilisateur (Body de requête) */
export type TUserUpdate = z.infer<typeof UserUpdateSchema>;

/** Type des données optionnelles pour mettre à jour une Option (Body de requête) */
export type TOptionUpdate = z.infer<typeof OptionUpdateSchema>;

/** Type des données optionnelles pour mettre à jour une Année Scolaire (Body de requête) */
export type TStudyYearUpdate = z.infer<typeof StudyYearUpdateSchema>;

/** Type des données optionnelles pour mettre à jour une Classe (Body de requête) */
export type TClassroomUpdate = z.infer<typeof ClassroomUpdateSchema>;

/** Type des données optionnelles pour mettre à jour une Inscription (Body de requête) */
export type TEnrolementUpdate = z.infer<typeof EnrolementUpdateSchema>;

// =============================================================================
// IV. TYPES DE FILTRE (Query Params)
// =============================================================================

/** Type pour filtrer les Écoles (Query Params, incluant pagination/tri) */
export type TSchoolFilter = z.infer<typeof SchoolFilterSchema>;

/** Type pour filtrer les Utilisateurs (Query Params, incluant pagination/tri) */
export type TUserFilter = z.infer<typeof UserFilterSchema>;

/** Type pour filtrer les Options (Query Params, incluant pagination/tri) */
export type TOptionFilter = z.infer<typeof OptionFilterSchema>;

/** Type pour filtrer les Années Scolaires (Query Params, incluant pagination/tri) */
export type TStudyYearFilter = z.infer<typeof StudyYearFilterSchema>;

/** Type pour filtrer les Classes (Query Params, incluant pagination/tri) */
export type TClassroomFilter = z.infer<typeof ClassroomFilterSchema>;

/** Type pour filtrer les Inscriptions (Query Params, incluant pagination/tri) */
export type TEnrolementFilter = z.infer<typeof EnrolementFilterSchema>;

/** Type pour filtrer l'Historique d'Inscriptions (Query Params, incluant pagination/tri) */
export type TEnrolementActionFilter = z.infer<
  typeof EnrolementActionFilterSchema
>;

export type TStatsFilter = z.infer<typeof StatsFilterSchema>;

// ... (tes imports et types précédents)

// =============================================================================
// V. TYPES SEATING - DONNÉES COMPLETS (Lecture DB)
// =============================================================================

/** Type des attributs complets d'un Local (Salle) */
export type TLocalRoomAttributes = z.infer<typeof LocalRoomAttributesSchema>;

/** Type des attributs complets d'une Session de placement */
export type TSeatingSessionAttributes = z.infer<
  typeof SeatingSessionAttributesSchema
>;

/** Type des attributs complets d'une Assignation de place */
export type TSeatingAssignmentAttributes = z.infer<
  typeof SeatingAssignmentAttributesSchema
>;

// =============================================================================
// VI. TYPES SEATING - CRÉATION (Body POST)
// =============================================================================

/** Type pour créer un Local */
export type TLocalRoomCreate = z.infer<typeof LocalRoomCreateSchema>;

/** Type pour créer une Session de placement */
export type TSeatingSessionCreate = z.infer<typeof SeatingSessionCreateSchema>;

/** Type pour créer une assignation individuelle */
export type TSeatingAssignmentCreate = z.infer<
  typeof SeatingAssignmentCreateSchema
>;

/** Type pour le placement en masse (Bulk) d'une salle entière */
export type TBulkSeatingAssignment = z.infer<
  typeof BulkSeatingAssignmentSchema
>;

// =============================================================================
// VII. TYPES SEATING - MISE À JOUR (Body PUT/PATCH)
// =============================================================================

/** Type pour mettre à jour un Local (partiel) */
export type TLocalRoomUpdate = z.infer<typeof LocalRoomUpdateSchema>;

/** Type pour mettre à jour une Session (partiel) */
export type TSeatingSessionUpdate = z.infer<typeof SeatingSessionUpdateSchema>;

/** Type pour mettre à jour une assignation (ex: changer de place) */
export type TSeatingAssignmentUpdate = z.infer<
  typeof SeatingAssignmentUpdateSchema
>;

// =============================================================================
// VIII. TYPES SEATING - FILTRE (Query Params)
// =============================================================================

/** Filtres pour les Locaux (avec pagination/tri) */
export type TLocalRoomFilter = z.infer<typeof LocalRoomFilterSchema>;

/** Filtres pour les Sessions de placement (avec pagination/tri) */
export type TSeatingSessionFilter = z.infer<typeof SeatingSessionFilterSchema>;

/** Filtres pour les Assignations (ex: voir tout un local ou toute une session) */
export type TSeatingAssignmentFilter = z.infer<
  typeof SeatingAssignmentFilterSchema
>;

/** Filtres pour les statistiques de placement */
export type TSeatingStatsFilter = z.infer<typeof SeatingStatsFilterSchema>;
