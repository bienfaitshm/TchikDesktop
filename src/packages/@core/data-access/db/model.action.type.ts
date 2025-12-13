// Importations nécessaires pour la Type Safety
import { WhereOptions } from "sequelize";
// Importations des types d'attributs existants
import type {
  SchoolAttributes,
  TUser, // Réfère aux attributs complets de l'utilisateur (TUser, pas TUserInsert)
  TClassroom, // Réfère aux attributs complets de la salle de classe
  TEnrolement, // Réfère aux attributs complets de l'inscription
  OptionAttributes,
  StudyYearAttributes,
  ClassroomEnrolementActionAttributes,
  // Note: TUserInsert, TClassroomInsert, TEnrolementInsert sont utilisés comme base TCreate
  TUserInsert,
  TClassroomInsert,
  TEnrolementInsert,
} from "./model.type";

// =============================================================================
// I. SCHOOL (École)
// =============================================================================

/**
 * Type de données nécessaire pour créer une nouvelle École.
 * Exclut l'ID et les champs gérés automatiquement (timestamps).
 */
export type TSchoolCreate = Omit<
  SchoolAttributes,
  "schoolId" | "createdAt" | "updatedAt"
>;

/**
 * Type de données pour la mise à jour des attributs d'une École.
 * Toutes les propriétés sont optionnelles.
 */
export type TSchoolUpdate = Partial<TSchoolCreate>;

/**
 * Type de filtre pour interroger le modèle School (utilise les opérateurs Sequelize).
 */
export type TSchoolFilter = WhereOptions<SchoolAttributes>;

// =============================================================================
// II. USER (Utilisateur - Admin, Prof, Étudiant)
// =============================================================================

/**
 * Type de données nécessaire pour créer un nouvel Utilisateur.
 * Utilise TUserInsert (qui doit omettre userId et fullname virtuel).
 */
export type TUserCreate = TUserInsert;

/**
 * Type de données pour la mise à jour des attributs d'un Utilisateur.
 * Exclut les champs invariants (fullname, schoolId) et rend tous les autres optionnels.
 * Note: On permet l'update du 'password' s'il est fourni.
 */
export type TUserUpdate = Partial<
  Omit<TUserCreate, "fullname" | "username" | "schoolId"> & {
    username?: string;
    password?: string;
  }
>;

/**
 * Type de filtre pour interroger le modèle User.
 */
export type TUserFilter = WhereOptions<TUser>;

// =============================================================================
// III. OPTION (Filière)
// =============================================================================

/**
 * Type de données pour la création d'une Option.
 */
export type TOptionCreate = Omit<OptionAttributes, "optionId">;

/**
 * Type de données pour la mise à jour des attributs d'une Option.
 */
export type TOptionUpdate = Partial<TOptionCreate>;

/**
 * Type de filtre pour interroger le modèle Option.
 */
export type TOptionFilter = WhereOptions<OptionAttributes>;

// =============================================================================
// IV. STUDY YEAR (Année d'Étude)
// =============================================================================

/**
 * Type de données pour la création d'une Année d'Étude.
 */
export type TStudyYearCreate = Omit<
  StudyYearAttributes,
  "yearId" | "createdAt" | "updatedAt"
>;

/**
 * Type de données pour la mise à jour des attributs d'une Année d'Étude.
 */
export type TStudyYearUpdate = Partial<TStudyYearCreate>;

/**
 * Type de filtre pour interroger le modèle StudyYear.
 */
export type TStudyYearFilter = WhereOptions<StudyYearAttributes>;

// =============================================================================
// V. CLASSROOM (Classe)
// =============================================================================

/**
 * Type de données pour la création d'une Classe.
 * Utilise TClassroomInsert (qui doit omettre classId).
 */
export type TClassroomCreate = TClassroomInsert;

/**
 * Type de données pour la mise à jour des attributs d'une Classe.
 */
export type TClassroomUpdate = Partial<TClassroomCreate>;

/**
 * Type de filtre pour interroger le modèle ClassRoom.
 */
export type TClassroomFilter = WhereOptions<TClassroom>;

// =============================================================================
// VI. CLASSROOM ENROLEMENT (Inscription)
// =============================================================================

/**
 * Type de données pour la création d'une Inscription.
 * Utilise TEnrolementInsert (qui doit omettre enrolementId).
 */
export type TEnrolementCreate = TEnrolementInsert;

/**
 * Type de données pour la mise à jour des attributs d'une Inscription.
 * On exclut les clés étrangères studentId et classroomId.
 */
export type TEnrolementUpdate = Partial<
  Omit<TEnrolementCreate, "studentId" | "classroomId">
>;

/**
 * Type de filtre pour interroger le modèle ClassroomEnrolement.
 */
export type TEnrolementFilter = WhereOptions<TEnrolement>;

// =============================================================================
// VII. CLASSROOM ENROLEMENT ACTION (Historique/Audit)
// =============================================================================

/**
 * Type de données pour l'enregistrement d'une nouvelle Action d'Inscription (Audit).
 * Exclut l'ID et les timestamps automatiques.
 */
export type TEnrolementActionCreate = Omit<
  ClassroomEnrolementActionAttributes,
  "actionId" | "createdAt" | "updatedAt"
>;

/**
 * Type de filtre pour interroger le modèle ClassroomEnrolementAction.
 */
export type TEnrolementActionFilter =
  WhereOptions<ClassroomEnrolementActionAttributes>;

// Aucune TEnrolementActionUpdate n'est définie car l'historique d'audit ne devrait jamais être modifié.
