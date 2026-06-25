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
import { GenericComboBox } from "@/renderer/components/form/fields/generic-combo-box";
import { StudentSeniorityStatusSelect } from "../fields/student-seriority-statut";
import {
  type BaseFormProps,
  useZodForm,
  mergeDefaultValuesDeep,
} from "@/renderer/libs/forms";
import {
  EnrollmentCreate,
  EnrollmentCreateSchema,
} from "@/packages/@core/data-access/schema-validations";

export const DEFAULT_VALUES: Partial<EnrollmentCreate> = {
  classroomId: "",
  isNewStudent: false,
  status: STUDENT_STATUS_ENUM.ACTIVE,
  schoolId: "",
  yearId: "",
};

interface QuickEnrollmentFormProps {
  classrooms?: { value: string; label: string }[];
}

export const EnrollmentForm: React.FC<
  BaseFormProps<EnrollmentCreate> & QuickEnrollmentFormProps
> = ({ formId, onSubmit, defaultValues, classrooms = [] }) => {
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
                  onChangeValue={(val) => field.onChange(val)}
                  options={classrooms}
                  placeholder="Sélectionner la classe"
                  className="w-full"
                />
              </FormControl>
              <FormDescription>
                L'élève sera assigné à cette classe pour l'année en cours.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
