"use client";

import * as React from "react";
import { Path, useFormContext } from "react-hook-form";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
import { EnrollmentQuickCreateSchema } from "@/packages/@core/data-access/schema-validations";
import { GenericComboBox } from "@/renderer/components/form/fields/generic-combo-box";
import {
  type BaseFormProps,
  useZodForm,
  mergeDefaultValuesDeep,
} from "@/renderer/libs/forms";
import { StudentFormFields } from "./form.student";
import { SelectExistStudent } from "./form.select-student";
import type { EnrollmentFormData } from "./types";
import type { SearchOptionReturn } from "@/renderer/libs/queries/base";
import type {
  Classroom,
  TutorDTO,
  UserDTO,
} from "@/packages/@core/data-access/db";
import { USER_GENDER_ENUM } from "@/packages/@core/data-access/db/options";
import {
  ButtonDropdown,
  DropdownOption,
} from "@/components/buttons/button-dropdown";
import { UserCheckIcon, UserPlusIcon } from "lucide-react";
import { TutorFormFields } from "./form.tutor";
import type { Option } from "@/components/form/fields/select-input";

/**
 * Dropdown options for choosing between an existing system record and creating a new record.
 */
const SYSTEM_EXISTENCE_OPTIONS: DropdownOption[] = [
  {
    label: "Profil existant",
    value: "true",
    icon: UserCheckIcon,
  },
  {
    label: "Nouveau profil",
    value: "false",
    icon: UserPlusIcon,
  },
];

/**
 * Default fallback values for initializing the quick enrollment form state.
 */
export const DEFAULT_QUICK_ENROLLMENT_VALUES: Partial<EnrollmentFormData> = {
  schoolId: "",
  yearId: "",
  classroomId: "",
  isNewStudent: false,
  studentData: { isInSystem: true, studentId: "" },
  tutorData: { isTutorInSystem: true, tutorId: "" },
  status: STUDENT_STATUS_ENUM.ACTIVE,
};

/**
 * Animation variants providing smooth fade and height expansion transitions.
 */
const containerAnimationVariants: Variants = {
  initial: {
    opacity: 0,
    y: -8,
    height: 0,
  },
  animate: {
    opacity: 1,
    y: 0,
    height: "auto",
    transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    height: 0,
    transition: {
      duration: 0.2,
      ease: [0.7, 0, 0.84, 0],
    },
  },
};

/**
 * Props for the QuickEnrollmentForm component.
 */
export interface QuickEnrollmentFormProps {
  /** Indicates whether the form operates in update mode. */
  isUpdate?: boolean;
  /** Available classrooms for student assignment. */
  classrooms: SearchOptionReturn<Classroom & Option>;
  /** Search options for existing students. */
  students: SearchOptionReturn<UserDTO & Option>;
  /** Search options for existing tutors. */
  tutors: SearchOptionReturn<TutorDTO & Option>;
}

/**
 * Props for the ToggleExistenceField sub-component.
 */
interface ToggleExistenceFieldProps {
  /** Target form key name in react-hook-form. */
  name: Path<EnrollmentFormData>;
  /** Field header label text. */
  label: string;
  /** Field descriptive help text. */
  description: string;
  /** Disabled state flag. */
  disabled?: boolean;
  /** Callback fired when existence mode changes. */
  onToggleChange?: (isInSystem: boolean) => void;
}

/**
 * Renders a standardized form toggle row for system existence selection.
 * @param props - Component props including field name, label, description, and callbacks.
 * @returns The rendered dropdown form control item.
 */
const ToggleExistenceField: React.FC<ToggleExistenceFieldProps> = ({
  name,
  label,
  description,
  disabled,
  onToggleChange,
}) => {
  const { control } = useFormContext<EnrollmentFormData>();

  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field: { value, ...field } }) => (
        <FormItem className="flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <FormLabel className="text-sm font-semibold">{label}</FormLabel>
              <FormDescription>{description}</FormDescription>
            </div>
            <FormControl>
              <ButtonDropdown
                defaultValue={value ? "true" : "false"}
                onValueChange={(value) => {
                  const isExisting = value === "true";
                  field.onChange(isExisting);
                  onToggleChange?.(isExisting);
                }}
                options={SYSTEM_EXISTENCE_OPTIONS}
                {...field}
              >
                {(value) =>
                  value === "true" ? "Profil existant" : "Nouveau profil"
                }
              </ButtonDropdown>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

ToggleExistenceField.displayName = "ToggleExistenceField";

/**
 * Main quick enrollment form component managing student and tutor registration flows.
 * @param props - Configuration properties, submission callback, and dataset options.
 * @returns The rendered quick enrollment form view.
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
  const isInSystem = form.watch("studentData.isInSystem");
  const isTutorInSystem = form.watch("tutorData.isTutorInSystem");

  /**
   * Resets student object or ID according to system existence selection.
   * @param inSystem - Whether the student exists in system.
   */
  const handleStudentSystemChange = (inSystem: boolean): void => {
    if (!inSystem) {
      form.setValue("studentData", {
        isInSystem: false,
        student: {
          gender: USER_GENDER_ENUM.MALE,
          lastName: "",
          middleName: "",
          firstName: "",
          birthPlace: "Lubumbashi",
          birthDate: new Date(),
        },
      });
    } else {
      form.setValue("studentData", {
        isInSystem: true,
        studentId: "",
      });
    }
  };

  /**
   * Resets tutor object or ID according to system existence selection.
   * @param tutorInSystem - Whether the tutor exists in system.
   */
  const handleTutorSystemChange = (tutorInSystem: boolean): void => {
    if (!tutorInSystem) {
      form.setValue("tutorData", {
        isTutorInSystem: false,
        tutor: {
          gender: USER_GENDER_ENUM.MALE,
          lastName: "",
          middleName: "",
          address: "",
          firstName: "",
          phoneNumber: "",
          profession: "",
        },
      });
    } else {
      form.setValue("tutorData", {
        isTutorInSystem: true,
        tutorId: "",
      });
    }
  };

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.submit} aria-label="Inscription rapide">
        {/* Academic Placement Section */}
        <FormField
          control={form.control}
          name="classroomId"
          render={({ field }) => (
            <FormItem className="flex flex-col mb-6">
              <FormLabel className="text-xs">Classe de destination</FormLabel>
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
                Sélectionnez la classe dans laquelle l'élève sera inscrit pour
                cette année scolaire.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Student Section */}
        <div className="mt-6 space-y-4 rounded-xl border p-4 shadow-sm bg-accent/20 shadow-accent/20">
          <ToggleExistenceField
            name="studentData.isInSystem"
            label="Identité de l'élève"
            description="L'élève possède-t-il déjà un dossier actif dans l'établissement ?"
            disabled={isUpdate || isSubmitting}
            onToggleChange={handleStudentSystemChange}
          />

          <motion.div layout className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {isInSystem ? (
                <motion.div
                  key="existing-student"
                  variants={containerAnimationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="pt-2"
                >
                  <SelectExistStudent students={students} />
                </motion.div>
              ) : (
                <motion.div
                  key="new-student"
                  variants={containerAnimationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="pt-2"
                >
                  <StudentFormFields />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Legal Tutor Section */}
        <div className="mt-6 space-y-4 rounded-xl border p-4 shadow-sm bg-accent/20 shadow-accent/20">
          <ToggleExistenceField
            name="tutorData.isTutorInSystem"
            label="Tuteur légal"
            description="Le tuteur responsable est-il déjà enregistré dans la base de données ?"
            disabled={isUpdate || isSubmitting}
            onToggleChange={handleTutorSystemChange}
          />

          <motion.div layout className="overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              {isTutorInSystem ? (
                <motion.div
                  key="existing-tutor"
                  variants={containerAnimationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="pt-2"
                >
                  <FormField
                    control={form.control}
                    name="tutorData.tutorId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Sélectionner le tuteur</FormLabel>
                        <FormControl>
                          <GenericComboBox
                            {...field}
                            onChangeValue={field.onChange}
                            options={tutors.options}
                            placeholder="Rechercher un tuteur par nom ou téléphone..."
                            className="w-full"
                            disabled={isSubmitting}
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
                  variants={containerAnimationVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="pt-2"
                >
                  <TutorFormFields />
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
