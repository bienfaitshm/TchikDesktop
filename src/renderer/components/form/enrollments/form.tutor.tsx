"use client";
import * as React from "react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import type { EnrollmentFormData } from "./types";

/**
 * Renders form input fields for registering a new tutor.
 * @returns The rendered tutor input grid component.
 */
export const TutorFormFields: React.FC = () => {
  const { control, formState } = useFormContext<EnrollmentFormData>();
  const isSubmitting = formState.isSubmitting;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="tutorData.tutor.lastName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Nom du tuteur</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ex: Kabamba"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tutorData.tutor.middleName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Postnom du tuteur</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ex: Kabamba"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tutorData.tutor.firstName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Prénom du tuteur</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ex: Joseph"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tutorData.tutor.phoneNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Numéro de téléphone</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ex: +243 900 000 000"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tutorData.tutor.profession"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Profession</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ex: Enseignant"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="tutorData.tutor.address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs">Adresse de résidence</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Ex: Avenue Kasa-Vubu, N° 45"
                disabled={isSubmitting}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

TutorFormFields.displayName = "TutorFormFields";
