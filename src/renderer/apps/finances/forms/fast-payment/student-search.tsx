"use client";

import { memo, useCallback } from "react";
import {
  ComboboxSearch,
  RenderItem,
} from "@/components/form/fields/generic-search-combo-box";
import { useSearchEnrollments } from "@/renderer/libs/queries/enrollements/helpers";
import type { EnrollmentOption } from "./types";

/**
 * Props for the StudentSearch component.
 */
export type StudentSearchProps = {
  /** Target school identifier. */
  schoolId: string;
  /** Target academic year identifier. */
  yearId: string;
  /** Currently selected enrollment option. */
  enrollment?: EnrollmentOption;
  /** Callback triggered when student selection changes. */
  onChange: (enrollmentId: string, enrollment?: EnrollmentOption) => void;
  /** Selected enrollment value string. */
  value?: string;
  /** Optional HTML element ID for form label association. */
  id?: string;
};

/**
 * Autocomplete student search combobox component.
 * Retrieves enrollment data asynchronously based on school and year contexts.
 *
 * @param props - Component parameters including search filters and selection handlers.
 * @returns Styled combobox component for student selection.
 */
export const StudentSearch = memo<StudentSearchProps>(
  ({ schoolId, yearId, onChange, value, enrollment, id }) => {
    const { isSearching, options, searchQuery, setSearchQuery } =
      useSearchEnrollments({
        schoolId,
        yearId,
      });

    const renderStudentItem = useCallback((item: EnrollmentOption) => {
      const gender = item.student?.gender ?? "—";
      const classroom = item.classroom?.shortIdentifier ?? "—";

      return (
        <RenderItem
          label={item.label}
          description={`${gender} - ${classroom}`}
        />
      );
    }, []);

    return (
      <ComboboxSearch
        id={id}
        placeholder="Sélectionner l'élève"
        options={options}
        selectedItem={enrollment}
        value={value}
        onChange={onChange}
        search={searchQuery}
        isLoading={isSearching}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par nom, code..."
        renderItem={renderStudentItem}
      />
    );
  },
);

StudentSearch.displayName = "StudentSearch";
