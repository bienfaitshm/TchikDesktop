/**
 * @file options.ts
 * @description Générateur d'options pour les composants UI et utilitaires de traduction.
 * Transforme les enums techniques en listes { label, value } ou en chaînes traduites.
 */

import {
  ENROLEMENT_ACTION_ENUM,
  ENROLEMENT_ACTION_ENUM_TRANSLATIONS,
  MUTATION_ACTION_ENUM,
  MUTATION_ACTION_ENUM_TRANSLATIONS,
  SECTION_ENUM,
  SECTION_ENUM_TRANSLATIONS,
  STUDENT_STATUS_ENUM,
  STUDENT_STATUS_ENUM_TRANSLATIONS,
  USER_GENDER_ENUM,
  USER_GENDER_ENUM_TRANSLATIONS,
  USER_ROLE_ENUM,
  USER_ROLE_ENUM_TRANSLATIONS,
} from "./enum";

/**
 * Interface pour les options de composants UI (Select, Radio, etc.)
 */
export interface IOption {
  key: string;
  value: string;
  label: string;
}

/**
 * Transforme un enum en liste d'options { key, value, label }.
 */
export function getEnumOptions<T extends Record<string, string>>(
  enumObject: T,
  enumTranslation: Record<string, string>,
): IOption[] {
  return Object.entries(enumObject).map(([key, value]) => ({
    key,
    value: value,
    label: enumTranslation[value] || value,
  }));
}

/**
 * Récupère le label traduit à partir de la valeur brute de l'enum.
 */
export function getEnumLabel<T extends string>(
  value: T | undefined | null,
  enumTranslation: Record<string, string>,
  defaultValue: string = "Inconnu",
): string {
  if (!value) return defaultValue;
  return enumTranslation[value] || value;
}

export const SECTION_OPTIONS = getEnumOptions(
  SECTION_ENUM,
  SECTION_ENUM_TRANSLATIONS,
);

export const getSectionLabel = (value: SECTION_ENUM) =>
  getEnumLabel(value, SECTION_ENUM_TRANSLATIONS);

export const GENDER_OPTIONS = getEnumOptions(
  USER_GENDER_ENUM,
  USER_GENDER_ENUM_TRANSLATIONS,
);

export const getGenderLabel = (value: USER_GENDER_ENUM) =>
  getEnumLabel(value, USER_GENDER_ENUM_TRANSLATIONS);

export const ROLE_OPTIONS = getEnumOptions(
  USER_ROLE_ENUM,
  USER_ROLE_ENUM_TRANSLATIONS,
);

export const getRoleLabel = (value: USER_ROLE_ENUM) =>
  getEnumLabel(value, USER_ROLE_ENUM_TRANSLATIONS);

export const STUDENT_STATUS_OPTIONS = getEnumOptions(
  STUDENT_STATUS_ENUM,
  STUDENT_STATUS_ENUM_TRANSLATIONS,
);

export const getStudentStatusLabel = (value: STUDENT_STATUS_ENUM) =>
  getEnumLabel(value, STUDENT_STATUS_ENUM_TRANSLATIONS);

export const ENROLEMENT_ACTION_OPTIONS = getEnumOptions(
  ENROLEMENT_ACTION_ENUM,
  ENROLEMENT_ACTION_ENUM_TRANSLATIONS,
);

export const getEnrolementActionLabel = (value: ENROLEMENT_ACTION_ENUM) =>
  getEnumLabel(value, ENROLEMENT_ACTION_ENUM_TRANSLATIONS);

export const MUTATION_ACTION_OPTIONS = getEnumOptions(
  MUTATION_ACTION_ENUM,
  MUTATION_ACTION_ENUM_TRANSLATIONS,
);

export const getMutationActionLabel = (value: MUTATION_ACTION_ENUM) =>
  getEnumLabel(value, MUTATION_ACTION_ENUM_TRANSLATIONS);
