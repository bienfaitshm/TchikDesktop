"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import {
  ComboboxSearch,
  type ComboboxSearchProps,
} from "@/renderer/components/form/fields/generic-search-combo-box";
import type { EnrollmentFormData, SelectExistStudentProps } from "./types";
import { useSearchUsers } from "@/renderer/hooks/users";

const SearchStudentField: React.FC<
  SelectExistStudentProps & ComboboxSearchProps
> = ({ schoolId, yearId, ...props }) => {
  const { options, isLoading, onSearchValue, searchQuery } = useSearchUsers({
    schoolId,
    yearId,
  });
  return (
    <ComboboxSearch
      {...props}
      options={options}
      placeholder="Rechercher un élève..."
      searchPlaceholder="Saisissez le nom ou matricule/code..."
      isLoading={isLoading}
      onSearchChange={onSearchValue}
      search={searchQuery}
      aria-required="true"
      contentClassName="w-full lg:w-[935px] md:w-[700px]"
    />
  );
};

export const SelectExistStudent: React.FC<SelectExistStudentProps> = ({
  schoolId,
  yearId,
}) => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<EnrollmentFormData>();

  return (
    <fieldset className="space-y-6 border-none p-0 m-0">
      <FormField
        control={control}
        name="studentId"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Élève à inscrire</FormLabel>
            <FormControl>
              <SearchStudentField
                {...field}
                disabled={isSubmitting}
                schoolId={schoolId}
                yearId={yearId}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
};
