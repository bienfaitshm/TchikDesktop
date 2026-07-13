export enum SECTION_ENUM {
  KINDERGARTEN = "KINDERGARTEN",
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}

export const SECTION_ENUM_TRANSLATIONS: Record<SECTION_ENUM, string> = {
  [SECTION_ENUM.KINDERGARTEN]: "Maternelle",
  [SECTION_ENUM.PRIMARY]: "Primaire",
  [SECTION_ENUM.SECONDARY]: "Secondaire",
};

export enum USER_ROLE_ENUM {
  STAFF = "STAFF",
  PROMOTER = "PROMOTER",
  ADMIN = "ADMIN", // Standardisé : Clé === Valeur
  STUDENT = "STUDENT",
}

export const USER_ROLE_ENUM_TRANSLATIONS: Record<USER_ROLE_ENUM, string> = {
  [USER_ROLE_ENUM.STAFF]: "Personnel",
  [USER_ROLE_ENUM.PROMOTER]: "Promoteur",
  [USER_ROLE_ENUM.ADMIN]: "Administrateur",
  [USER_ROLE_ENUM.STUDENT]: "Élève",
};

export enum USER_GENDER_ENUM {
  MALE = "M",
  FEMALE = "F",
}

export const USER_GENDER_ENUM_TRANSLATIONS: Record<USER_GENDER_ENUM, string> = {
  [USER_GENDER_ENUM.MALE]: "Masculin",
  [USER_GENDER_ENUM.FEMALE]: "Féminin",
};

export enum MUTATION_ACTION_ENUM {
  CREATE = "CREATE",
  EDIT = "EDIT",
  DELETE = "DELETE",
}

export const MUTATION_ACTION_ENUM_TRANSLATIONS: Record<
  MUTATION_ACTION_ENUM,
  string
> = {
  [MUTATION_ACTION_ENUM.CREATE]: "Créer",
  [MUTATION_ACTION_ENUM.EDIT]: "Modifier",
  [MUTATION_ACTION_ENUM.DELETE]: "Supprimer",
};

export enum STUDENT_STATUS_ENUM {
  ACTIVE = "ACTIVE", // Corrigé : Au lieu de EN_COURS
  DROPOUT = "DROPOUT", // Corrigé : Au lieu de ABANDON
  EXPELLED = "EXPELLED", // Corrigé : Au lieu de EXCLUT (qui prenait un 't' par erreur)
}

export const STUDENT_STATUS_ENUM_TRANSLATIONS: Record<
  STUDENT_STATUS_ENUM,
  string
> = {
  [STUDENT_STATUS_ENUM.ACTIVE]: "Actif",
  [STUDENT_STATUS_ENUM.DROPOUT]: "Abandon",
  [STUDENT_STATUS_ENUM.EXPELLED]: "Exclu",
};

// Corrigé : ENROLLMENT avec deux 'L' pour correspondre au schéma
export enum ENROLLMENT_ACTION_ENUM {
  STUDENT_STATUS = "STUDENT_STATUS",
  STUDENT_TRANSFER = "STUDENT_TRANSFER", // Corrigé : TRANSFER au lieu de TRANSFERT
}

export const ENROLLMENT_ACTION_ENUM_TRANSLATIONS: Record<
  ENROLLMENT_ACTION_ENUM,
  string
> = {
  [ENROLLMENT_ACTION_ENUM.STUDENT_STATUS]: "Statut de l'élève",
  [ENROLLMENT_ACTION_ENUM.STUDENT_TRANSFER]: "Transfert de l'élève",
};

export enum FEE_SCHEDULES_ENUM {
  UNPAID = "UNPAID",
  PARTIALLY_PAID = "PARTIALLY_PAID",
  PAID = "PAID",
  OVERPAID = "OVERPAID",
  EXEMPTED = "EXEMPTED",
}

export const FEE_SCHEDULES_ENUM_TRANSLATIONS: Record<
  FEE_SCHEDULES_ENUM,
  string
> = {
  [FEE_SCHEDULES_ENUM.UNPAID]: "Non payé",
  [FEE_SCHEDULES_ENUM.PARTIALLY_PAID]: "Avance (Partiel)",
  [FEE_SCHEDULES_ENUM.PAID]: "Payé",
  [FEE_SCHEDULES_ENUM.OVERPAID]: "Trop-perçu",
  [FEE_SCHEDULES_ENUM.EXEMPTED]: "Exempté",
};

export enum CURRENCY_ENUM {
  USD = "USD",
  CDF = "CDF",
}

export const CURRENCY_ENUM_TRANSLATIONS: Record<CURRENCY_ENUM, string> = {
  [CURRENCY_ENUM.USD]: "Dollar américain",
  [CURRENCY_ENUM.CDF]: "Franc congolais",
};

export enum PAYMENT_METHOD_ENUM {
  CASH = "CASH",
  MOBILE_MONEY = "MOBILE_MONEY",
  BANK = "BANK",
}

export const PAYMENT_METHOD_ENUM_TRANSLATIONS: Record<
  PAYMENT_METHOD_ENUM,
  string
> = {
  [PAYMENT_METHOD_ENUM.CASH]: "Espèces",
  [PAYMENT_METHOD_ENUM.MOBILE_MONEY]: "Mobile Money",
  [PAYMENT_METHOD_ENUM.BANK]: "Banque",
};
