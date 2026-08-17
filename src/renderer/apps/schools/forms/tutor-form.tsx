import React from "react";
import {
  BaseTutorSchema,
  type BaseTutor,
} from "@/packages/@core/data-access/schema-validations";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { USER_GENDER_ENUM as USER_GENDER } from "@/packages/@core/data-access/db/enum";
import { Input } from "@/renderer/components/ui/input";
import {
  type BaseFormProps,
  useZodForm,
  mergeDefaultValues,
} from "@/renderer/libs/forms";
import { GENDER_OPTIONS } from "@/packages/@core/data-access/db/options";
import { GenderInput } from "@/renderer/components/form/fields/gender";

export type TutorFormData = BaseTutor;

/**
 * Returns clean default initial values for the tutor form.
 * Ensures optional fields such as birthDate are initialized as undefined.
 */
const getInitialDefaultValues = (): TutorFormData => ({
  lastName: "",
  middleName: "",
  firstName: "",
  schoolId: "",
  address: "",
  phoneNumber: "",
  profession: "",
  birthDate: undefined,
  gender: USER_GENDER.MALE,
  birthPlace: "",
});

/**
 * Form component for entering and editing tutor profile information.
 * Features semantic grouping, responsive grid layout, accessibility attributes, and schema validation.
 *
 * @param props - Component options including form ID, submit handler, and default overrides.
 * @returns Accessible HTML form structure for tutor data capture.
 */
export const TutorForm: React.FC<BaseFormProps<TutorFormData>> = ({
  onSubmit,
  formId,
  defaultValues,
}) => {
  const initialValues = React.useMemo(
    () => mergeDefaultValues(defaultValues, getInitialDefaultValues()),
    [defaultValues],
  );

  const form = useZodForm<TutorFormData>({
    schema: BaseTutorSchema,
    defaultValues: initialValues,
    onSubmit,
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        id={formId}
        className="space-y-8"
        onSubmit={form.submit}
        aria-label="Formulaire d'enregistrement du tuteur"
      >
        {/* Section 1: Personal Identity */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="text-sm font-semibold text-foreground">
            Identité du tuteur
          </legend>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">Nom</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: KABANGE"
                      autoComplete="family-name"
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
                  <FormLabel className="text-xs font-medium">Postnom</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ex: MUKALA"
                      autoComplete="additional-name"
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
                  <FormLabel className="text-xs font-medium">Prénom</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ex: Jean"
                      autoComplete="given-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Sexe / Genre
                  </FormLabel>
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
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Date de naissance{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optionnel)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? new Date(e.target.value) : undefined,
                        )
                      }
                      autoComplete="bday"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Cette information n'est pas obligatoire.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthPlace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Lieu de naissance{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (Optionnel)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ex: Lubumbashi"
                      autoComplete="address-level2"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Cette information n'est pas obligatoire.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>

        {/* Section 2: Contact & Profession */}
        <fieldset disabled={isSubmitting} className="space-y-4">
          <legend className="text-sm font-semibold text-foreground">
            Coordonnées & Profession
          </legend>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Numéro de téléphone
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      inputMode="tel"
                      value={field.value ?? ""}
                      placeholder="Ex: +243 900 000 000"
                      autoComplete="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Profession
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ex: Enseignant"
                      autoComplete="organization-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium">
                    Adresse de résidence
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Ex: Avenue Kasa-Vubu, N° 45"
                      autoComplete="street-address"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
      </form>
    </Form>
  );
};

TutorForm.displayName = "TutorForm";
