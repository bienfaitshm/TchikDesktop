import React from "react";
import { parse, isDate } from "date-fns";
import {
  BaseStudentSchema,
  type BaseStudent,
} from "@/packages/@core/data-access/schema-validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/renderer/components/ui/form";
import { USER_GENDER_ENUM as USER_GENDER } from "@/packages/@core/data-access/db/enum";

import { Input } from "@/renderer/components/ui/input";
import { GenderInput } from "./fields/gender";
import { DateInput } from "./fields/date";
import {
  type BaseFormProps,
  useZodForm,
  mergeDefaultValues,
} from "@/renderer/libs/forms";
import { GENDER_OPTIONS } from "@/packages/@core/data-access/db/options";

export type UserCreateFormData = BaseStudent;

const DEFAULT_VALUES: UserCreateFormData = {
  lastName: "",
  middleName: "",
  firstName: "",
  birthDate: new Date(),
  gender: USER_GENDER.MALE,
  birthPlace: "",
};

export interface UserCreateSchemaFormProps {}

export interface BaseUserFormHandle {}

/**
 * Formulaire de base pour les informations d'un utilisateur (Élève/Personnel).
 * Optimisé pour la saisie administrative rapide.
 */
export const BaseUserForm: React.FC<
  BaseFormProps<UserCreateFormData> & UserCreateSchemaFormProps
> = ({ onSubmit, formId, defaultValues }) => {
  const form = useZodForm<UserCreateFormData>({
    schema: BaseStudentSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        className="space-y-8"
        onSubmit={form.submit}
        aria-label="Informations d'identité"
      >
        <fieldset className="space-y-6">
          {/* Ligne 1 : Les Noms */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Nom</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: KABANGE"
                      autoComplete="family-name"
                      className="h-11 uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Postnom</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: MUKALA"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Prénom</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ex: Jean"
                      autoComplete="given-name"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 2 : Sexe et Date de naissance */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">Sexe / Genre</FormLabel>
                  <FormControl>
                    <GenderInput {...field} options={GENDER_OPTIONS} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="mb-2 font-semibold">
                    Date de naissance
                  </FormLabel>
                  <FormControl>
                    <DateInput
                      value={
                        isDate(field.value)
                          ? field.value
                          : parse(`${field.value}`, "T", new Date())
                      }
                      onChange={field.onChange}
                      placeholder="JJ/MM/AAAA"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ligne 3 : Lieu de naissance */}
          <FormField
            control={form.control}
            name="birthPlace"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Lieu de naissance
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Ex: Lubumbashi, Haut-Katanga"
                    autoComplete="address-level2"
                    className="h-11"
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Précisez la ville et/ou la province.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>
      </form>
    </Form>
  );
};

BaseUserForm.displayName = "BaseUserFormHandle";
