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
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";
import type { EnrollmentFormData, SelectExistStudentProps } from "./types";

export const SelectExistStudent: React.FC<SelectExistStudentProps> = ({
  students,
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
              <ComboboxSearch
                {...field}
                disabled={isSubmitting}
                options={students.options}
                placeholder="Rechercher un élève..."
                searchPlaceholder="Saisissez le nom ou matricule/code..."
                isLoading={students.isSearching}
                onSearchChange={students.setSearchQuery}
                search={students.searchQuery}
                aria-required="true"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </fieldset>
  );
};
