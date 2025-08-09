export enum SECTION {
  KINDERGARTEN = "KINDERGARTEN",
  PRIMARY = "PRIMARY",
  SECONDARY = "SECONDARY",
}

export const SECTION_TRANSLATIONS: Record<SECTION, string> = {
  [SECTION.KINDERGARTEN]: "Maternelle",
  [SECTION.PRIMARY]: "Primaire",
  [SECTION.SECONDARY]: "Secondaire",
};

export enum USER_ROLE {
  STAFF = "STAFF",
  PROMOTER = "PROMOTER",
  ADMIN = "ADMINISTRATOR",
  STUDENT = "STUDENT",
}

export const USER_ROLE_TRANSLATIONS: Record<USER_ROLE, string> = {
  [USER_ROLE.STAFF]: "Personnel",
  [USER_ROLE.PROMOTER]: "Promoteur",
  [USER_ROLE.ADMIN]: "Administrateur",
  [USER_ROLE.STUDENT]: "Élève",
};

export enum USER_GENDER {
  MALE = "M",
  FEMALE = "F",
}

export const USER_GENDER_TRANSLATIONS: Record<USER_GENDER, string> = {
  [USER_GENDER.MALE]: "Masculin",
  [USER_GENDER.FEMALE]: "Féminin",
};

export enum MUTATION_ACTION {
  CREATE = "CREATE",
  EDIT = "EDIT",
}

export const MUTATION_ACTION_TRANSLATIONS: Record<MUTATION_ACTION, string> = {
  [MUTATION_ACTION.CREATE]: "Créer",
  [MUTATION_ACTION.EDIT]: "Modifier",
};

export enum STUDENT_STATUS {
  EN_COURS = "EN_COURS",
  ABANDON = "ABANDON",
  EXCLUT = "EXCLUT",
}

export const STUDENT_STATUS_TRANSLATIONS: Record<STUDENT_STATUS, string> = {
  [STUDENT_STATUS.EN_COURS]: "En cours",
  [STUDENT_STATUS.ABANDON]: "Abandon",
  [STUDENT_STATUS.EXCLUT]: "Exclu",
};

export enum ENROLEMENT_ACTION {
  STUDENT_STATUS = "STUDENT_STATUS",
  STUDENT_TRANSFERT = "STUDENT_TRANSFERT",
}

export const ENROLEMENT_ACTION_TRANSLATIONS: Record<ENROLEMENT_ACTION, string> =
  {
    [ENROLEMENT_ACTION.STUDENT_STATUS]: "Statut de l'élève",
    [ENROLEMENT_ACTION.STUDENT_TRANSFERT]: "Transfert de l'élève",
  };
