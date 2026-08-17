"use client";

import * as React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { STUDENT_STATUS_ENUM } from "@/packages/@core/data-access/db/enum";
import { STUDENT_STATUS_OPTIONS } from "@/packages/@core/data-access/db/options";
import { GenericComboBox } from "@/renderer/components/form/fields/generic-combo-box";
import { ComboboxSearch } from "@/components/form/fields/generic-search-combo-box";
import { StudentSeniorityStatusSelect } from "@/renderer/components/form/fields/student-seriority-statut";
import {
  type BaseFormProps,
  useZodForm,
  mergeDefaultValuesDeep,
} from "@/renderer/libs/forms";
import {
  EnrollmentCreate,
  EnrollmentCreateSchema,
} from "@/packages/@core/data-access/schema-validations";
import { StudentStatus } from "../fields/student-status";
import { SearchOptionReturn } from "@/renderer/libs/queries/base";
import type { Option } from "@/components/form/fields/select-input";
import type { Classroom, TutorDTO } from "@/packages/@core/data-access/db";

export const DEFAULT_VALUES: Partial<EnrollmentCreate> = {
  classroomId: "",
  isNewStudent: false,
  status: STUDENT_STATUS_ENUM.ACTIVE,
  schoolId: "",
  yearId: "",
};

interface QuickEnrollmentFormProps {
  classrooms: SearchOptionReturn<Classroom & Option>;
  /** Search dataset for existing tutor selection. */
  tutors: SearchOptionReturn<TutorDTO & Option>;
}

export const EnrollmentForm: React.FC<
  BaseFormProps<EnrollmentCreate> & QuickEnrollmentFormProps
> = ({ formId, onSubmit, defaultValues, classrooms, tutors }) => {
  const form = useZodForm<EnrollmentCreate>({
    schema: EnrollmentCreateSchema,
    defaultValues: mergeDefaultValuesDeep(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.submit} aria-label="Inscription rapide">
        {/* Section Affectation Académique */}
        <FormField
          control={form.control}
          name="classroomId"
          render={({ field }) => (
            <FormItem className="flex flex-col mb-4">
              <FormLabel>Classe de destination</FormLabel>
              <FormControl>
                <GenericComboBox
                  {...field}
                  onChangeValue={field.onChange}
                  options={classrooms.options}
                  placeholder="Rechercher ou sélectionner une classe..."
                  className="w-full"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                L'élève sera assigné à cette classe pour l'année en cours.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Statud */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col mb-4">
                <FormLabel>Statut de l'eleves</FormLabel>
                <FormControl>
                  <StudentStatus
                    {...field}
                    options={STUDENT_STATUS_OPTIONS}
                    className="w-full"
                  />
                </FormControl>
                <FormDescription>
                  le status de l'élève sera changé, par exemple l'exclusion ou
                  signaler l'abandon.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tutorId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Sélectionner le tuteur</FormLabel>
                <FormControl>
                  <ComboboxSearch
                    {...field}
                    onChange={field.onChange}
                    options={tutors.options}
                    value={field.value ?? ""}
                    search={tutors.searchQuery}
                    isLoading={tutors.isSearching}
                    onSearchChange={tutors.setSearchQuery}
                    placeholder="Rechercher un tuteur par nom ou téléphone..."
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-10">
          {/* Statut d'ancienneté */}
          <FormField
            control={form.control}
            name="isNewStudent"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Statut d'inscription</FormLabel>
                  <FormDescription>
                    Précisez s'il s'agit d'une nouvelle inscription.
                  </FormDescription>
                </div>
                <FormControl>
                  <StudentSeniorityStatusSelect
                    {...field}
                    value={field.value}
                    onChangeValue={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

EnrollmentForm.displayName = "EnrollmentForm";
