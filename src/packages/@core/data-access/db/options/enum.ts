/**
 * School sections available in the institution.
 */
export enum SECTION_ENUM {
  KINDERGARTEN = "KINDERGARTEN",
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}

/**
 * French display translations for school sections.
 */
export const SECTION_ENUM_TRANSLATIONS: Record<SECTION_ENUM, string> = {
  [SECTION_ENUM.KINDERGARTEN]: "Maternelle",
  [SECTION_ENUM.PRIMARY]: "Primaire",
  [SECTION_ENUM.SECONDARY]: "Secondaire",
};

/**
 * User roles defining system authorization levels.
 */
export enum USER_ROLE_ENUM {
  STAFF = "STAFF",
  PROMOTER = "PROMOTER",
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
}

/**
 * French display translations for user roles.
 */
export const USER_ROLE_ENUM_TRANSLATIONS: Record<USER_ROLE_ENUM, string> = {
  [USER_ROLE_ENUM.STAFF]: "Personnel",
  [USER_ROLE_ENUM.PROMOTER]: "Promoteur",
  [USER_ROLE_ENUM.ADMIN]: "Administrateur",
  [USER_ROLE_ENUM.STUDENT]: "Élève",
  [USER_ROLE_ENUM.TUTOR]: "Tuteur",
};

/**
 * Gender options for user profiles.
 */
export enum USER_GENDER_ENUM {
  MALE = "M",
  FEMALE = "F",
}

/**
 * French display translations for gender options.
 */
export const USER_GENDER_ENUM_TRANSLATIONS: Record<USER_GENDER_ENUM, string> = {
  [USER_GENDER_ENUM.MALE]: "Masculin",
  [USER_GENDER_ENUM.FEMALE]: "Féminin",
};

/**
 * Data mutation operations for audit and event tracking.
 */
export enum MUTATION_ACTION_ENUM {
  CREATE = "CREATE",
  EDIT = "EDIT",
  DELETE = "DELETE",
}

/**
 * French display translations for mutation actions.
 */
export const MUTATION_ACTION_ENUM_TRANSLATIONS: Record<
  MUTATION_ACTION_ENUM,
  string
> = {
  [MUTATION_ACTION_ENUM.CREATE]: "Créer",
  [MUTATION_ACTION_ENUM.EDIT]: "Modifier",
  [MUTATION_ACTION_ENUM.DELETE]: "Supprimer",
};

/**
 * Academic enrollment statuses for students.
 */
export enum STUDENT_STATUS_ENUM {
  ACTIVE = "ACTIVE",
  DROPOUT = "DROPOUT",
  EXPELLED = "EXPELLED",
}

/**
 * French display translations for student enrollment statuses.
 */
export const STUDENT_STATUS_ENUM_TRANSLATIONS: Record<
  STUDENT_STATUS_ENUM,
  string
> = {
  [STUDENT_STATUS_ENUM.ACTIVE]: "Actif",
  [STUDENT_STATUS_ENUM.DROPOUT]: "Abandon",
  [STUDENT_STATUS_ENUM.EXPELLED]: "Exclu",
};

/**
 * Management action types applied during student enrollment processing.
 */
export enum ENROLLMENT_ACTION_ENUM {
  STUDENT_STATUS = "STUDENT_STATUS",
  STUDENT_TRANSFER = "STUDENT_TRANSFER",
}

/**
 * French display translations for enrollment actions.
 */
export const ENROLLMENT_ACTION_ENUM_TRANSLATIONS: Record<
  ENROLLMENT_ACTION_ENUM,
  string
> = {
  [ENROLLMENT_ACTION_ENUM.STUDENT_STATUS]: "Statut de l'élève",
  [ENROLLMENT_ACTION_ENUM.STUDENT_TRANSFER]: "Transfert de l'élève",
};

/**
 * Payment progress status for scheduled fee installments.
 */
export enum FEE_SCHEDULE_STATUS_ENUM {
  UNPAID = "UNPAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERPAID = "OVERPAID",
  EXEMPTED = "EXEMPTED",
}

/**
 * @deprecated use FEE_SCHEDULE_STATUS_ENUM
 */
export const FEE_SCHEDULES_ENUM = FEE_SCHEDULE_STATUS_ENUM;

/**
 * French display translations for fee schedule payment statuses.
 */
export const FEE_SCHEDULE_STATUS_ENUM_TRANSLATIONS: Record<
  FEE_SCHEDULE_STATUS_ENUM,
  string
> = {
  [FEE_SCHEDULE_STATUS_ENUM.UNPAID]: "Non payé",
  [FEE_SCHEDULE_STATUS_ENUM.PARTIALLY_PAID]: "Avance (Partiel)",
  [FEE_SCHEDULE_STATUS_ENUM.PAID]: "Payé",
  [FEE_SCHEDULE_STATUS_ENUM.OVERPAID]: "Trop-perçu",
  [FEE_SCHEDULE_STATUS_ENUM.EXEMPTED]: "Exempté",
};

/**
 * Supported financial currencies.
 */
export enum CURRENCY_ENUM {
  USD = "USD",
  CDF = "CDF",
}

/**
 * French display translations for currencies.
 */
export const CURRENCY_ENUM_TRANSLATIONS: Record<CURRENCY_ENUM, string> = {
  [CURRENCY_ENUM.USD]: "Dollar américain",
  [CURRENCY_ENUM.CDF]: "Franc congolais",
};

/**
 * Accepted payment processing methods.
 */
export enum PAYMENT_METHOD_ENUM {
  CASH = "CASH",
  MOBILE_MONEY = "MOBILE_MONEY",
  BANK = "BANK",
}

/**
 * French display translations for payment methods.
 */
export const PAYMENT_METHOD_ENUM_TRANSLATIONS: Record<
  PAYMENT_METHOD_ENUM,
  string
> = {
  [PAYMENT_METHOD_ENUM.CASH]: "Espèces",
  [PAYMENT_METHOD_ENUM.MOBILE_MONEY]: "Mobile Money",
  [PAYMENT_METHOD_ENUM.BANK]: "Banque",
};

/**
 * Execution states for transaction records.
 */
export enum PAYMENT_STATUS_ENUM {
  VALIDATED = "VALIDATED",
  CANCELED = "CANCELED",
}

/**
 * French display translations for payment transaction states.
 */
export const PAYMENT_STATUS_ENUM_TRANSLATIONS: Record<
  PAYMENT_STATUS_ENUM,
  string
> = {
  [PAYMENT_STATUS_ENUM.CANCELED]: "Annulé",
  [PAYMENT_STATUS_ENUM.VALIDATED]: "Validé",
};
