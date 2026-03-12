/**
 * @file options.ts
 * @description Générateur d'options pour les composants UI (Select, Radio, Checkbox).
 * Transforme les enums techniques en listes exploitables { label, value } avec traductions.
 */

import {
  SECTION,
  STUDENT_STATUS,
  USER_GENDER,
  USER_ROLE,
  MUTATION_ACTION,
  ENROLEMENT_ACTION,
  ENROLEMENT_ACTION_TRANSLATIONS,
  MUTATION_ACTION_TRANSLATIONS,
  SECTION_TRANSLATIONS,
  STUDENT_STATUS_TRANSLATIONS,
  USER_GENDER_TRANSLATIONS,
  USER_ROLE_TRANSLATIONS,
} from "./enum";
import { getEnumKeyValueList } from "./utils";

/** * Options pour les sections scolaires (ex: Primaire, Secondaire, Humanité).
 */
export const SECTION_OPTIONS = getEnumKeyValueList(
  SECTION,
  SECTION_TRANSLATIONS,
);

/** * Options pour le genre de l'utilisateur.
 */
export const GENDER_OPTIONS = getEnumKeyValueList(
  USER_GENDER,
  USER_GENDER_TRANSLATIONS,
);

/** * Options pour les rôles système (Admin, Prefet, Enseignant, etc.).
 */
export const ROLE_OPTIONS = getEnumKeyValueList(
  USER_ROLE,
  USER_ROLE_TRANSLATIONS,
);

/** * Options pour le statut académique de l'élève (Actif, Exclut, Abandon).
 */
export const STUDENT_STATUS_OPTIONS = getEnumKeyValueList(
  STUDENT_STATUS,
  STUDENT_STATUS_TRANSLATIONS,
);

/** * Options pour les actions d'enrôlement.
 */
export const ENROLEMENT_ACTION_OPTIONS = getEnumKeyValueList(
  ENROLEMENT_ACTION,
  ENROLEMENT_ACTION_TRANSLATIONS,
);

/** * Options pour les types de mutations/mouvements d'élèves.
 */
export const MUTATION_ACTION_OPTIONS = getEnumKeyValueList(
  MUTATION_ACTION,
  MUTATION_ACTION_TRANSLATIONS,
);
