"use client";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { USER_GENDER_ENUM } from "@/packages/@core/data-access/db/enum";
import { Input } from "@/renderer/components/ui/input";
import { DateInput } from "@/renderer/components/form/fields/date";
import { GenderInput } from "@/renderer/components/form/fields/gender";
import type { EnrollmentFormData } from "./types";
import React from "react";
import { StudentSeniorityStatusSelect } from "../fields/student-seriority-statut";
import { Label } from "@/components/ui/label";

export const StudentFormFields: React.FC = () => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<EnrollmentFormData>();

  return (
    <fieldset className="space-y-4" disabled={isSubmitting}>
      <Label className="xs">Informations de l'élève</Label>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField
          control={control}
          name="studentData.student.lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Nom</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: KABILA"
                  autoComplete="family-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="studentData.student.middleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Postnom</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: MUKALA" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="studentData.student.firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Prénom</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value!}
                  placeholder="Ex: Jean"
                  autoComplete="given-name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField
          control={control}
          name="studentData.student.gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Sexe</FormLabel>
              <FormControl>
                <GenderInput
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { label: "Masculin", value: USER_GENDER_ENUM.MALE },
                    { label: "Féminin", value: USER_GENDER_ENUM.FEMALE },
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="studentData.student.birthPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Lieu de naissance</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value!}
                  placeholder="Ville ou Territoire"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="studentData.student.birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs">Date de naissance</FormLabel>
              <FormControl>
                <DateInput
                  {...field}
                  value={field.value!}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <div>
        {/* Seniority Status */}
        <FormField
          control={control}
          name="isNewStudent"
          render={({ field }) => (
            <FormItem className="flex flex-col justify-between">
              <div className="space-y-1">
                <FormLabel className="text-sm">Statut d'inscription</FormLabel>
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
    </fieldset>
  );
};
