import type { FormFieldDef, SelectOption } from "@/packages/dynamic-form";
import { FileTypeFormFactory } from "../form-factory";

/**
 * Transforme les filtres de fichiers Electron en options de sélection.
 * Utilise une approche défensive pour éviter les erreurs sur les tableaux vides.
 */
const mapFiltersToSelectOptions = (
  filters: Electron.FileFilter[],
): SelectOption[] => {
  return filters
    .filter((filter) => filter.extensions.length > 0)
    .map(({ name, extensions }) => ({
      label: name,
      value: extensions[0],
    }));
};

/**
 * Enrichit une liste de champs de formulaire avec un sélecteur de type de fichier.
 * Le champ est injecté en début de liste par défaut.
 *
 * @param existingFields - La liste actuelle des définitions de champs.
 * @param fileFilters - Les filtres Electron à convertir en options.
 * @returns Une nouvelle copie du tableau de champs incluant le sélecteur de fichiers.
 */
export const prependFileTypeField = (
  existingFields: FormFieldDef[],
  fileFilters: Electron.FileFilter[],
): FormFieldDef[] => {
  const fileTypeOptions = mapFiltersToSelectOptions(fileFilters);

  const fileTypeField = FileTypeFormFactory.buildFileTypeField({
    options: fileTypeOptions,
  });

  return [fileTypeField, ...existingFields];
};
