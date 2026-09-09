"use client";

import * as React from "react";

/**
 * Represents a single selectable option inside the multi-select component.
 */
export type FilterOption = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

/**
 * Represents a group of options under an optional section heading.
 */
export type FilterGroup = {
  heading?: string;
  options: FilterOption[];
};

/**
 * Parameters for the useFilterCheckBoxInput custom hook.
 */
export interface FilterCheckBoxInputParams {
  options?: FilterOption[];
  groups?: FilterGroup[];
  value?: string[];
  onChange?: (values: string[]) => void;
  placeholder?: string;
  labelPlural?: string;
}

/**
 * Custom hook managing search filtering across groups, state selection, and batch actions.
 * @param params - Configuration parameters including options or groups, value, and callbacks.
 * @returns State properties and helper actions for the multi-select interface.
 */
export function useFilterCheckBoxInput({
  options,
  groups,
  value = [],
  onChange,
  placeholder = "Sélectionner...",
  labelPlural = "éléments",
}: FilterCheckBoxInputParams) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const normalizedGroups = React.useMemo<FilterGroup[]>(() => {
    if (groups && groups.length > 0) return groups;
    if (options && options.length > 0) return [{ options }];
    return [];
  }, [groups, options]);

  const allOptions = React.useMemo(() => {
    return normalizedGroups.flatMap((group) => group.options);
  }, [normalizedGroups]);

  const filteredGroups = React.useMemo<FilterGroup[]>(() => {
    if (!searchTerm) return normalizedGroups;
    const lowerTerm = searchTerm.toLowerCase();

    return normalizedGroups
      .map((group) => ({
        ...group,
        options: group.options.filter((opt) =>
          opt.label.toLowerCase().includes(lowerTerm),
        ),
      }))
      .filter((group) => group.options.length > 0);
  }, [normalizedGroups, searchTerm]);

  const filteredOptions = React.useMemo(() => {
    return filteredGroups.flatMap((group) => group.options);
  }, [filteredGroups]);

  const areAllFilteredSelected = React.useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every((opt) => selectedSet.has(opt.value));
  }, [filteredOptions, selectedSet]);

  const handleCheckedChange = React.useCallback(
    (checked: boolean | "indeterminate", optionValue: string) => {
      const newValues = checked
        ? [...value, optionValue]
        : value.filter((val) => val !== optionValue);

      onChange?.(newValues);
    },
    [value, onChange],
  );

  const toggleAllFiltered = React.useCallback(() => {
    const filteredValues = filteredOptions.map((opt) => opt.value);

    if (areAllFilteredSelected) {
      const newValues = value.filter((v) => !filteredValues.includes(v));
      onChange?.(newValues);
    } else {
      const merged = Array.from(new Set([...value, ...filteredValues]));
      onChange?.(merged);
    }
  }, [filteredOptions, areAllFilteredSelected, value, onChange]);

  const clearSelection = React.useCallback(() => {
    onChange?.([]);
  }, [onChange]);

  const getButtonText = React.useCallback(() => {
    const count = value.length;
    if (count === 0) return placeholder;
    if (count === 1) {
      const label = allOptions.find((opt) => opt.value === value[0])?.label;
      return label ?? `1 sélectionné`;
    }
    return `${count} ${labelPlural} sélectionnés`;
  }, [value, allOptions, placeholder, labelPlural]);

  return {
    searchTerm,
    setSearchTerm,
    filteredGroups,
    filteredOptions,
    getButtonText,
    clearSelection,
    toggleAllFiltered,
    handleCheckedChange,
    areAllFilteredSelected,
    selectedSet,
  };
}
