import type { WhereOptions } from "sequelize";
import type {
  SECTION,
  USER_GENDER,
  USER_ROLE,
  STUDENT_STATUS,
  ENROLEMENT_ACTION,
} from "@/commons/constants/enum";

// =============================================================================
//  1. SCHOOL INTERFACES
// =============================================================================

/** Attributs de base du modèle School (lectures depuis la DB) */
export interface SchoolAttributes {
  schoolId: string;
  name: string;
  adress: string;
  town: string;
  logo?: string | null;
}

export type TSchool = Required<SchoolAttributes>;
export type TSchoolInsert = Omit<SchoolAttributes, "schoolId">;

/** Types pour les associations */
export type TWithSchool<T> = T & { School: TSchool };
export type TWithSchools<T> = T & { School: TSchool[] };

// =============================================================================
//  2. USER INTERFACES
// =============================================================================

/** Attributs de base du modèle User */
export interface UserAttributes {
  userId?: string;
  // Champs requis
  lastName: string;
  middleName: string;
  // Champs optionnels ou virtuels
  firstName?: string | null;
  fullname?: string; // Virtuel
  gender?: USER_GENDER;
  role?: USER_ROLE;
  birthDate?: Date | null;
  birthPlace?: string | null;
  // Clés/Authentification
  username?: string;
  schoolId?: string;
  password?: string;
}

export type TUser = Required<UserAttributes>;
export type TUserInsert = Omit<UserAttributes, "userId" | "fullname">; // On retire aussi fullname (Virtuel)

/** Types pour les associations */
export type TWithUser<T> = T & { User: TUser };
export type TWithUsers<T> = T & { User: TUser[] };

// =============================================================================
//  3. OPTION INTERFACES
// =============================================================================

/** Attributs de base du modèle Option */
export interface OptionAttributes {
  optionId: string;
  //
  optionName: string;
  optionShortName: string;
  schoolId: string;
  section?: SECTION;
}

export type TOption = Required<OptionAttributes>;
export type TOptionInsert = Omit<OptionAttributes, "optionId">;

/** Types pour les associations */
export type TWithOption<T> = T & { Option: TOption };
export type TWithOptions<T> = T & { Options: TOption[] };

// =============================================================================
//  4. STUDY YEAR INTERFACES
// =============================================================================

/** Attributs de base du modèle StudyYear */
export interface StudyYearAttributes {
  yearId: string;
  //
  yearName: string;
  startDate: Date;
  endDate: Date;
  schoolId: string;
}

export type TStudyYear = Required<StudyYearAttributes>;
export type TStudyYearInsert = Omit<StudyYearAttributes, "yearId">;

/** Types pour les associations */
export type TWithStudyYear<T> = T & { StudyYear: TStudyYear }; // CORRIGÉ
export type TWithStudyYears<T> = T & { StudyYears: TStudyYear[] }; // CORRIGÉ

// =============================================================================
//  5. CLASSROOM INTERFACES
// =============================================================================

/** Attributs de base du modèle ClassRoom */
export interface ClassroomAttributes {
  // Renommé de ClassAttributes
  classId?: string;
  //
  identifier: string;
  shortIdentifier: string;
  yearId: string;
  schoolId: string;
  section?: SECTION;
  optionId?: string | null;
}

export type TClassroom = Required<ClassroomAttributes>;
export type TClassroomInsert = Omit<ClassroomAttributes, "classId">;

/** Types pour les associations */
export type TWithClassroom<T> = T & { ClassRoom: TClassroom };
export type TWithClassrooms<T> = T & { ClassRooms: TClassroom[] };

// =============================================================================
//  6. CLASSROOM ENROLEMENT INTERFACES
// =============================================================================

/** Attributs de base du modèle ClassroomEnrolement */
export interface ClassroomEnrolementAttributes {
  enrolementId: string;
  //
  classroomId: string;
  studentId: string; // userId
  isNewStudent: boolean;
  schoolId: string;
  yearId: string;
  //
  status?: STUDENT_STATUS;
  code?: string;
}

export type TEnrolement = Required<ClassroomEnrolementAttributes>;
export type TEnrolementInsert = Omit<
  ClassroomEnrolementAttributes,
  "enrolementId"
>;

/** Types pour les associations */
export type TWithEnrolement<T> = T & { ClassroomEnrolement: TEnrolement };
export type TWithEnrolements<T> = T & { ClassroomEnrolements: TEnrolement[] };

// =============================================================================
//  7. ENROLEMENT ACTION INTERFACES
// =============================================================================

/** Attributs pour tracer les actions sur les inscriptions (historique de statut) */
export interface ClassroomEnrolementActionAttributes {
  actionId: string;
  //
  enrolementId: string;
  reason?: string;
  action: ENROLEMENT_ACTION;
}

// =============================================================================
//  8. ALIAS D'INSERTION SIMPLIFIÉS
// =============================================================================

/** Alias pour la création de nouvelles entrées dans la DB. */
export type UserAttributesInsert = TUserInsert;
export type SchoolAttributesInsert = TSchoolInsert;
export type ClassAttributesInsert = TClassroomInsert;
export type OptionAttributesInsert = TOptionInsert;
export type StudyYearAttributesInsert = TStudyYearInsert;
export type ClassroomEnrolementAttributesInsert = TEnrolementInsert;

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

export type PaginationAndSort = {
  // 'limit' est transformé en nombre (`z.coerce.number()`), mais reste optionnel (`.optional()`)
  limit: number;

  // 'offset' est transformé en nombre, optionnel, non négatif.
  offset: number;

  // 'orderBy' est du type déduit de ZodQueryFilter (ici, string ou undefined si non fourni).
  orderBy: string | undefined;

  // 'order' est optionnel et doit être l'une des deux chaînes de caractères.
  order: "ASC" | "DESC" | undefined;
};

export type WithPaginationAndSort<TData> = Partial<PaginationAndSort> & TData;
