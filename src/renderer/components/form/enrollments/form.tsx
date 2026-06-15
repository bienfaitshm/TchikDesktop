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
import {
  STUDENT_STATUS_ENUM,
  USER_GENDER_ENUM,
} from "@/packages/@core/data-access/db/enum";
import { EnrollmentQuickCreateSchema } from "@/packages/@core/data-access/schema-validations";
import { GenericComboBox } from "@/renderer/components/form/fields/generic-combo-box";
import { StudentSeniorityStatusSelect } from "../fields/student-seriority-statut";
import { BaseFormProps, useZodForm } from "../base-form";
import { StudentFormFields } from "./form.student";
import { SelectExistStudent } from "./form.select-student";
import type { EnrollmentFormData } from "./types";
import { Label } from "@/renderer/components/ui/label";

export const DEFAULT_QUICK_ENROLLMENT_VALUES: Partial<EnrollmentFormData> = {
  classroomId: "",
  isNewStudent: false,
  isInSystem: false,
  status: STUDENT_STATUS_ENUM.ACTIVE,
  student: {
    lastName: "",
    middleName: "",
    birthPlace: "",
    firstName: "",
    gender: USER_GENDER_ENUM.MALE,
    birthDate: new Date(),
  },
};

interface QuickEnrollmentFormProps {
  isUpdate?: boolean;
  classrooms?: { value: string; label: string }[];
}

const fadeVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: "easeIn" } },
};

export const EnrollmentForm: React.FC<
  BaseFormProps<EnrollmentFormData> & QuickEnrollmentFormProps
> = ({ formId, onSubmit, initialValues, isUpdate, classrooms = [] }) => {
  const form = useZodForm({
    schema: EnrollmentQuickCreateSchema,
    defaultValues: {
      ...DEFAULT_QUICK_ENROLLMENT_VALUES,
      ...initialValues,
      isInSystem:
        initialValues?.isInSystem ??
        DEFAULT_QUICK_ENROLLMENT_VALUES.isInSystem ??
        true,
    } as EnrollmentFormData,
    onSubmit,
  });

  const { isSubmitting } = form.formState;
  const isInSystem = form.watch("isInSystem");

  return (
    <Form {...form}>
      <button
        type="button"
        onClick={() =>
          console.log(
            "Valeurs actuelles de RHF :",
            form.getValues(),
            "Erreurs :",
            form.formState.errors,
          )
        }
      >
        Debug RHF
      </button>
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

          {/* Existence dans le système */}
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

        {/* Section Dynamique Animée 
          `motion.div layout` gère l'ajustement de hauteur automatique et fluide du parent.
          `mode="wait"` s'assure que l'ancien bloc a fini de disparaître avant d'afficher le nouveau.
        */}
        <motion.div
          layout
          className="mt-10 overflow-hidden h-60"
          aria-disabled={!isUpdate}
        >
          <AnimatePresence mode="wait">
            {isInSystem ? (
              <motion.div
                key="exist-student"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-10"
              >
                <Label>Rechercher l'élève existant</Label>
                <div className="my-4" />
                <SelectExistStudent
                  schoolId={initialValues?.schoolId as string}
                  yearId={initialValues?.yearId}
                />
              </motion.div>
            ) : (
              <motion.div
                key="new-student"
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-10"
              >
                <Label>Informations de l'élève</Label>
                <div className="my-4" />
                <StudentFormFields />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </form>
    </Form>
  );
};

EnrollmentForm.displayName = "EnrollmentForm";
