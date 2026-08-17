export const DOCUMENT_EXPORT_ROUTES = {
  GET_INFOS: "export/documents/infos",
  EXPORT_DOCUMENT: "export/documents",
} as const;

export enum DocumentCategory {
  FINANCES = "FINANCES",
  DATA_SCHOOL = "DATA_SCHOOL",
  APP_DATA = "APP_DATA",
  OTHER = "OTHER",
}

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

export const DOCUMENT_CATEGORY_TRANSLATIONS: Record<DocumentCategory, string> =
  {
    [DocumentCategory.FINANCES]: "Finances",
    [DocumentCategory.DATA_SCHOOL]: "Données scolaires",
    [DocumentCategory.APP_DATA]: "Données de l'application",
    [DocumentCategory.OTHER]: "Autre",
  };

export const DOCUMENT_CATEGORY_OPTIONS: IOption[] = getEnumOptions(
  DocumentCategory,
  DOCUMENT_CATEGORY_TRANSLATIONS,
);

export const getDocumentCategoryLabel = (
  value: DocumentCategory | string,
): string => getEnumLabel(value, DOCUMENT_CATEGORY_TRANSLATIONS);
