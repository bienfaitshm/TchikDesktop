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
