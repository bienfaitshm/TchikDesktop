"use client";

import * as React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/renderer/components/ui/radio-group";
import { Input } from "@/renderer/components/ui/input";
import { Label } from "@/renderer/components/ui/label";
import {
  STUDENT_STATUS_ENUM,
  USER_GENDER_ENUM,
} from "@/packages/@core/data-access/db/enum";
import { EnrollmentQuickCreateSchema } from "@/packages/@core/data-access/schema-validations";
import { GenericComboBox } from "@/renderer/components/form/fields/generic-combo-box";
import { StudentSeniorityStatusSelect } from "../fields/student-seriority-statut";
import {
  type BaseFormProps,
  useZodForm,
  mergeDefaultValuesDeep,
} from "@/renderer/libs/forms";
import { StudentFormFields } from "./form.student";
import { SelectExistStudent } from "./form.select-student";
import type { EnrollmentFormData } from "./types";
import type { SearchOption } from "@/renderer/libs/queries/base";

/**
 * Default fallback values for initializing the Quick Enrollment form.
 */
export const DEFAULT_QUICK_ENROLLMENT_VALUES: Partial<EnrollmentFormData> = {
  classroomId: "",
  isNewStudent: false,
  isInSystem: false,
  isTutorInSystem: false,
  tutorId: "",
  status: STUDENT_STATUS_ENUM.ACTIVE,
  student: {
    lastName: "",
    middleName: "",
    birthPlace: "",
    firstName: "",
    gender: USER_GENDER_ENUM.MALE,
    birthDate: new Date(),
  },
  tutor: {
    profession: "",
    address: "",
    phoneNumber: "",
  },
};

/**
 * Props for the QuickEnrollmentForm component.
 */
interface QuickEnrollmentFormProps {
  /** Flag indicating if the form is operating in update mode */
  isUpdate?: boolean;
  /** Available options for classroom selection */
  classrooms: SearchOption;
  /** Available options for existing students search */
  students: SearchOption;
  /** Available options for existing tutors search */
  tutors: SearchOption;
}

/**
 * Animation variants for smooth fade-in and fade-out transition effects.
 */
const fadeVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: "easeIn" } },
};

/**
 * Quick enrollment form component enabling fast registration of students and tutors.
 *
 * @param props - Form configuration, submission handler, and lookup options.
 * @returns The rendered quick enrollment form element.
 */
export const QuickEnrollmentForm: React.FC<
  BaseFormProps<EnrollmentFormData> & QuickEnrollmentFormProps
> = ({
  formId,
  onSubmit,
  defaultValues,
  isUpdate,
  classrooms,
  students,
  tutors,
}) => {
  const form = useZodForm<EnrollmentFormData>({
    schema: EnrollmentQuickCreateSchema,
    defaultValues: mergeDefaultValuesDeep(
      defaultValues,
      DEFAULT_QUICK_ENROLLMENT_VALUES,
    ),
    onSubmit,
  });

  const { isSubmitting } = form.formState;
  const isInSystem = form.watch("isInSystem");
  const isTutorInSystem = form.watch("isTutorInSystem");

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.submit} aria-label="Inscription rapide">
        {/* Section Affectation Académique */}
        <FormField
          control={form.control}
          name="classroomId"
          render={({ field }) => (
            <FormItem className="flex flex-col mb-6">
              <FormLabel>Classe de destination</FormLabel>
              <FormControl>
                <GenericComboBox
                  {...field}
                  onChangeValue={(val) => field.onChange(val)}
                  options={classrooms.options}
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

        <div className="space-y-6">
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

          {/* Existence de l'élève dans le système */}
          <FormField
            control={form.control}
            name="isInSystem"
            disabled={isUpdate}
            render={({ field }) => (
              <FormItem className="flex flex-col justify-between">
                <div className="space-y-0.5">
                  <FormLabel>Existence de l'élève</FormLabel>
                  <FormDescription>
                    L'élève possède-t-il déjà un dossier ?
                  </FormDescription>
                </div>
                <FormControl className="mt-2">
                  <RadioGroup
                    onValueChange={(val) => field.onChange(val === "true")}
                    value={field.value ? "true" : "false"}
                    disabled={isSubmitting}
                    className="flex space-x-4 pt-2"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="false" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Nouveau dans l'établissement
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="true" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Déjà dans le système
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section Dynamique Élève */}
        <motion.div layout className="mt-8 overflow-hidden h-auto">
          <AnimatePresence mode="wait">
            {isInSystem ? (
              <motion.div
                key="exist-student"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <Label className="text-base font-semibold">
                  Rechercher l'élève existant
                </Label>
                <SelectExistStudent students={students} />
              </motion.div>
            ) : (
              <motion.div
                key="new-student"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <Label className="text-base font-semibold">
                  Informations de l'élève
                </Label>
                <StudentFormFields />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section Tuteur */}
        <div className="mt-10 pt-6 border-t space-y-6">
          <FormField
            control={form.control}
            name="isTutorInSystem"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base font-semibold">
                    Tuteur légal
                  </FormLabel>
                  <FormDescription>
                    Le tuteur est-il déjà enregistré dans le système ?
                  </FormDescription>
                </div>
                <FormControl className="mt-2">
                  <RadioGroup
                    onValueChange={(val) => field.onChange(val === "true")}
                    value={field.value ? "true" : "false"}
                    disabled={isSubmitting}
                    className="flex space-x-4 pt-2"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="false" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Nouveau tuteur
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="true" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Tuteur existant
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Section Dynamique Tuteur */}
          <motion.div layout className="mt-6 overflow-hidden h-auto">
            <AnimatePresence mode="wait">
              {isTutorInSystem ? (
                <motion.div
                  key="exist-tutor"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="tutorId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Sélectionner le tuteur</FormLabel>
                        <FormControl>
                          <GenericComboBox
                            {...field}
                            onChangeValue={(val) => field.onChange(val)}
                            options={tutors.options}
                            placeholder="Rechercher un tuteur..."
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="new-tutor"
                  variants={fadeVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <FormField
                    control={form.control}
                    name="tutor.profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
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
                    control={form.control}
                    name="tutor.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Ex: +243..."
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tutor.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder="Adresse de résidence"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </form>
    </Form>
  );
};

QuickEnrollmentForm.displayName = "QuickEnrollmentForm";
