import type { FormFieldDef, SelectOption } from "@/packages/dynamic-form";
import { FileTypeFormFactory } from "../form-factory";

/**
 * Transforme les filtres de fichiers Electron en options de sélection.
 * Sécurisé contre les structures d'extensions vides ou malformées.
 */
const mapFiltersToSelectOptions = (
  filters: Electron.FileFilter[],
): SelectOption[] => {
  if (!filters || filters.length === 0) return [];

  return filters
    .filter((filter) => filter.extensions && filter.extensions.length > 0)
    .map(({ name, extensions }) => {
      const primaryExtension = extensions[0];

      return {
        label: name || `Fichiers ${primaryExtension.toUpperCase()}`,
        value: primaryExtension,
      };
    });
};

/**
 * Enrichit une liste de champs de formulaire avec un sélecteur de type de fichier.
 * Le champ est injecté en début de liste uniquement si des filtres valides sont fournis.
 *
 * @param existingFields - La liste actuelle des définitions de champs.
 * @param fileFilters - Les filtres Electron à convertir en options de sélection.
 * @returns Une nouvelle copie du tableau de champs incluant le sélecteur de fichiers.
 */
export const prependFileTypeField = (
  existingFields: FormFieldDef[],
  fileFilters: Electron.FileFilter[],
  config?: Partial<FormFieldDef>,
): FormFieldDef[] => {
  const fileTypeOptions = mapFiltersToSelectOptions(fileFilters);

  if (fileTypeOptions.length === 0) {
    return existingFields;
  }

  const defaultExtensionValue = fileTypeOptions[0]?.value;

  const fileTypeField = FileTypeFormFactory.buildFileTypeField({
    options: fileTypeOptions,
    defaultValue: defaultExtensionValue,
    ...config,
  });

  return [fileTypeField, ...existingFields];
};
