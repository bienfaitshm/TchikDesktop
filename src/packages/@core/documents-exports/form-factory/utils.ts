import type { SelectOption } from "@/packages/dynamic-form";

/**
 * Maps Electron file filters to select options for file type selection.
 * Handles empty or malformed extension structures gracefully.
 *
 * @example
 * mapFiltersToSelectOptions([{ name: 'Images', extensions: ['jpg', 'png'] }])
 * // Returns: [{ label: 'Images', value: 'jpg' }, { label: 'Fichiers PNG', value: 'png' }]
 */
export const mapFiltersToSelectOptions = (
  filters: readonly Electron.FileFilter[],
): readonly SelectOption[] => {
  if (!filters?.length) {
    return [];
  }

  return filters
    .filter(hasValidExtensions)
    .flatMap(({ name, extensions }) =>
      createOptionsFromFilter(name, extensions),
    );
};

/**
 * Type guard to ensure filter has valid, non-empty extensions
 */
const hasValidExtensions = (
  filter: Electron.FileFilter,
): filter is Electron.FileFilter & { extensions: string[] } => {
  return Array.isArray(filter.extensions) && filter.extensions.length > 0;
};

/**
 * Creates select options from a single filter's extensions
 * Each extension becomes its own option for better UX
 */
const createOptionsFromFilter = (
  name: string | undefined,
  extensions: readonly string[],
): SelectOption[] => {
  return extensions.map((extension) => ({
    label: formatOptionLabel(name, extension),
    value: extension,
  }));
};

/**
 * Formats the display label for a file type option
 */
const formatOptionLabel = (
  filterName: string | undefined,
  extension: string,
): string => {
  if (filterName) {
    return `${filterName} (.${extension})`;
  }
  return `Fichiers ${extension.toUpperCase()}`;
};
