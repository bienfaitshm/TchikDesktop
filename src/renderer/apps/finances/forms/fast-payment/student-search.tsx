import { memo } from "react";
import {
  ComboboxSearch,
  RenderItem,
} from "@/components/form/fields/generic-search-combo-box";
import { useSearchEnrollments } from "@/renderer/libs/queries/enrollements/helpers";
import type { EnrollmentOption } from "./types";

type StudentSearchProps = {
  schoolId: string;
  yearId: string;
  enrollment?: EnrollmentOption;
  onChange: (enrollmentId: string, enrollment?: EnrollmentOption) => void;
  value?: string;
};

export const StudentSearch = memo<StudentSearchProps>(
  ({ schoolId, yearId, onChange, value, enrollment }) => {
    const { isSearching, options, searchQuery, setSearchQuery } =
      useSearchEnrollments({
        schoolId,
        yearId,
      });

    return (
      <ComboboxSearch
        placeholder="Sélectionner l'élève"
        options={options}
        selectedItem={enrollment}
        value={value}
        onChange={onChange}
        search={searchQuery}
        isLoading={isSearching}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Rechercher par nom, code..."
        renderItem={(item) => (
          <RenderItem
            label={item.label}
            description={`${item.student?.gender} - ${item.classroom.shortIdentifier}`}
          />
        )}
      />
    );
  },
);

StudentSearch.displayName = "StudentSearch";
