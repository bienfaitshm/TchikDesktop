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
  type DropdownOption,
} from "@/components/buttons/button-dropdown";
import { UserCheckIcon, UserPlusIcon } from "lucide-react";
import { TutorFormFields } from "./form.tutor";
import type { Option } from "@/components/form/fields/select-input";
import { createCompleteSubmitHandler } from "./utils";

/** Options for switching between existing profile selection and new entry creation. */
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

/** Default payload state when creating a new student entry. */
const INITIAL_NEW_STUDENT_PAYLOAD = {
  isInSystem: false as const,
  student: {
    gender: USER_GENDER_ENUM.MALE,
    lastName: "",
    middleName: "",
    firstName: "",
    birthPlace: "Lubumbashi",
    birthDate: new Date(),
  },
};

/** Default payload state when choosing an existing student record. */
const INITIAL_EXISTING_STUDENT_PAYLOAD = {
  isInSystem: true as const,
  studentId: "",
};

/** Default payload state when creating a new tutor entry. */
const INITIAL_NEW_TUTOR_PAYLOAD = {
  isTutorInSystem: false as const,
  tutor: {
    gender: USER_GENDER_ENUM.MALE,
    lastName: "",
    middleName: "",
    address: "",
    firstName: "",
    phoneNumber: "",
    profession: "",
  },
};

/** Default payload state when choosing an existing tutor record. */
const INITIAL_EXISTING_TUTOR_PAYLOAD = {
  isTutorInSystem: true as const,
  tutorId: "",
};

/**
 * Default values for initializing form state and ensuring no schema properties are omitted.
 */
export const DEFAULT_QUICK_ENROLLMENT_VALUES: Partial<EnrollmentFormData> = {
  schoolId: "",
  yearId: "",
  classroomId: "",
  isNewStudent: false,
  studentData: INITIAL_EXISTING_STUDENT_PAYLOAD,
  tutorData: INITIAL_EXISTING_TUTOR_PAYLOAD,
  status: STUDENT_STATUS_ENUM.ACTIVE,
};

/** Animation variants for section expansion and fade transitions. */
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

/** Props interface for the QuickEnrollmentForm component. */
export interface QuickEnrollmentFormProps {
  /** Indicates if the form is rendering in edit mode. */
  isUpdate?: boolean;
  /** Selectable classroom option dataset. */
  classrooms: SearchOptionReturn<Classroom & Option>;
  /** Search dataset for existing student selection. */
  students: SearchOptionReturn<UserDTO & Option>;
  /** Search dataset for existing tutor selection. */
  tutors: SearchOptionReturn<TutorDTO & Option>;
}

/** Component props for ToggleExistenceField. */
interface ToggleExistenceFieldProps {
  /** Field path inside the form control tree. */
  name: Path<EnrollmentFormData>;
  /** Header label text. */
  label: string;
  /** Explanatory description text. */
  description: string;
  /** Disables interaction when set to true. */
  disabled?: boolean;
  /** Handler fired upon changing existence state. */
  onToggleChange?: (isInSystem: boolean) => void;
}

/**
 * Renders a dropdown component for toggling profile creation mode.
 * @param props - Form item properties and callbacks.
 * @returns Form field item rendering the button dropdown.
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
                value={value ? "true" : "false"}
                onValueChange={(val) => {
                  const isExisting = val === "true";
                  field.onChange(isExisting);
                  onToggleChange?.(isExisting);
                }}
                onBlur={field.onBlur}
                name={field.name}
                disabled={disabled}
                options={SYSTEM_EXISTENCE_OPTIONS}
              >
                {(val) =>
                  val === "true" ? "Profil existant" : "Nouveau profil"
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
 * Wraps conditional form sections with Framer Motion animations.
 * @param props - Active transition key and target children nodes.
 * @returns Animated motion container component.
 */
const FormSectionAnimator: React.FC<{
  activeKey: string;
  children: React.ReactNode;
}> = ({ activeKey, children }) => (
  <motion.div layout className="overflow-hidden">
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={activeKey}
        variants={containerAnimationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="pt-2"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  </motion.div>
);

FormSectionAnimator.displayName = "FormSectionAnimator";

/**
 * Renders a combobox input for selecting an existing tutor from available choices.
 * @param props - Tutor datasets and field disabled status.
 * @returns Form item containing generic combobox control.
 */
const SelectExistTutor: React.FC<{
  tutors: SearchOptionReturn<TutorDTO & Option>;
  disabled?: boolean;
}> = ({ tutors, disabled }) => {
  const { control } = useFormContext<EnrollmentFormData>();

  return (
    <FormField
      control={control}
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
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

SelectExistTutor.displayName = "SelectExistTutor";

/**
 * Renders hidden input elements to register context parameters into React Hook Form.
 * @returns Fragment containing hidden inputs for state persistence during submit.
 */
const HiddenFormContextFields: React.FC = () => {
  const { register } = useFormContext<EnrollmentFormData>();

  return (
    <>
      <input type="hidden" {...register("schoolId")} />
      <input type="hidden" {...register("yearId")} />
      <input type="hidden" {...register("isNewStudent")} />
      <input type="hidden" {...register("status")} />
    </>
  );
};

HiddenFormContextFields.displayName = "HiddenFormContextFields";

/**
 * Coordinates student quick enrollment and handles submission without field omission.
 * @param props - Form identifiers, submit handlers, and dataset selections.
 * @returns Complete quick enrollment form component.
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
  const _defaultValues = React.useMemo(
    () =>
      mergeDefaultValuesDeep<EnrollmentFormData>(
        defaultValues,
        DEFAULT_QUICK_ENROLLMENT_VALUES,
      ),
    [defaultValues],
  );
  const form = useZodForm<EnrollmentFormData>({
    schema: EnrollmentQuickCreateSchema,
    defaultValues: _defaultValues,
    onSubmit,
  });

  const { isSubmitting } = form.formState;
  const isInSystem = form.watch("studentData.isInSystem");
  const isTutorInSystem = form.watch("tutorData.isTutorInSystem");

  /**
   * Re-initializes student data sub-tree when toggling between existing and new modes.
   * @param inSystem - True if selecting existing student record.
   */
  const handleStudentSystemChange = (inSystem: boolean): void => {
    const nextValue = inSystem
      ? INITIAL_EXISTING_STUDENT_PAYLOAD
      : INITIAL_NEW_STUDENT_PAYLOAD;

    form.setValue("studentData", nextValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  /**
   * Re-initializes tutor data sub-tree when toggling between existing and new modes.
   * @param tutorInSystem - True if selecting existing tutor record.
   */
  const handleTutorSystemChange = (tutorInSystem: boolean): void => {
    const nextValue = tutorInSystem
      ? INITIAL_EXISTING_TUTOR_PAYLOAD
      : INITIAL_NEW_TUTOR_PAYLOAD;

    form.setValue("tutorData", nextValue, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleSubmit = React.useCallback(
    createCompleteSubmitHandler(form, onSubmit),
    [],
  );

  return (
    <Form {...form}>
      <form id={formId} onSubmit={handleSubmit} aria-label="Inscription rapide">
        {/* Hidden inputs ensuring non-rendered context values are registered on handleSubmit */}
        <HiddenFormContextFields />

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

          <FormSectionAnimator
            activeKey={isInSystem ? "existing-student" : "new-student"}
          >
            {isInSystem ? (
              <SelectExistStudent students={students} />
            ) : (
              <StudentFormFields />
            )}
          </FormSectionAnimator>
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

          <FormSectionAnimator
            activeKey={isTutorInSystem ? "existing-tutor" : "new-tutor"}
          >
            {isTutorInSystem ? (
              <SelectExistTutor tutors={tutors} disabled={isSubmitting} />
            ) : (
              <TutorFormFields />
            )}
          </FormSectionAnimator>
        </div>
      </form>
    </Form>
  );
};

QuickEnrollmentForm.displayName = "QuickEnrollmentForm";
