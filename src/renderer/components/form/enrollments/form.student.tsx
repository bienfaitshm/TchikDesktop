"use client";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
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

export const StudentFormFields = () => {
  const {
    control,
    formState: { isSubmitting },
  } = useFormContext<EnrollmentFormData>();

  return (
    <fieldset className="space-y-4" disabled={isSubmitting}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <FormField
          control={control}
          name="student.lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
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
          name="student.middleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Postnom</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: MUKALA" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="student.firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prénom</FormLabel>
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
          name="student.gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sexe</FormLabel>
              <FormControl>
                <GenderInput
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
          name="student.birthPlace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lieu de naissance</FormLabel>
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
          name="student.birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="mb-2">Date de naissance</FormLabel>
              <FormControl>
                <DateInput value={field.value!} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </fieldset>
  );
};
