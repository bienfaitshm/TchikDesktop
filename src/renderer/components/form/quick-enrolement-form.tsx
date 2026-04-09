import React, { PropsWithChildren } from "react";
import { useZodForm } from "@/packages/use-zod-form";
import { EnrolementQuickCreateSchema, type TEnrolementQuickCreate } from "@/packages/@core/data-access/schema-validations";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/renderer/components/ui/form";
import { useFormImperativeHandle, type ImperativeFormHandle } from "./utils";
import { USER_GENDER_ENUM, USER_ROLE_ENUM } from "@/packages/@core/data-access/db/enum";
import { Input } from "@/renderer/components/ui/input";
import { GenderInput } from "./fields/gender";
import { UseFormReturn } from "react-hook-form";
import { Combobox } from "../ui/combobox";
import { DateInput } from "@/renderer/components/form/fields/date";
import { StudentSeniorityStatusSelect } from "./fields/student-seriority-statut";

export * from "./utils";

export type QuickEnrollmentFormData = TEnrolementQuickCreate;

export const DEFAULT_QUICK_ENROLLMENT_VALUES: QuickEnrollmentFormData = {
    classroomId: "",
    isNewStudent: false,
    schoolId: "",
    yearId: "",
    isInSystem: false,
    studentId: undefined,
    student: {
        lastName: "",
        middleName: "",
        firstName: "",
        role: USER_ROLE_ENUM.STUDENT,
        birthDate: new Date(),
        gender: USER_GENDER_ENUM.MALE,
        birthPlace: "Lubumbashi",
    },
};

/**
 * Informations sur l'élève (Sous-section)
 * Optimisée pour la navigation au clavier et la lecture d'écran.
 */
const StudentFields: React.FC<{
    form: UseFormReturn<QuickEnrollmentFormData, any, QuickEnrollmentFormData>;
}> = ({ form }) => {
    return (
        <fieldset className="space-y-6 border-t pt-6">
            <legend className="text-lg font-bold text-foreground px-1 mb-4">
                Informations sur l'élève
            </legend>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                    control={form.control}
                    name="student.lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Nom</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Nom de famille" autoComplete="family-name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="student.middleName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Postnom</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Deuxième nom" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="student.firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Prénom</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ""} placeholder="Prénom de l'élève" autoComplete="given-name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                    control={form.control}
                    name="student.gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Sexe</FormLabel>
                            <FormControl>
                                <GenderInput {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="student.birthPlace"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-medium">Lieu de naissance</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ""} placeholder="Ex: Lubumbashi" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="student.birthDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="mb-2 font-medium">Date de naissance</FormLabel>
                            <FormControl>
                                <DateInput
                                    value={field.value ?? new Date()}
                                    onChange={field.onChange}
                                    placeholder="Sélectionner la date"
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

export interface QuickEnrollmentFormProps {
    classrooms?: { value: string, label: string }[]
    onSubmit?: (values: QuickEnrollmentFormData) => void;
    initialValues?: Partial<QuickEnrollmentFormData>;
}

export interface QuickEnrollmentFormHandle extends ImperativeFormHandle<QuickEnrollmentFormData> { }

export const QuickEnrollmentForm = React.forwardRef<
    QuickEnrollmentFormHandle,
    PropsWithChildren<QuickEnrollmentFormProps>
>(({ children, onSubmit, initialValues = {}, classrooms = [] }, ref) => {
    const form = useZodForm({
        schema: EnrolementQuickCreateSchema,
        defaultValues: { ...DEFAULT_QUICK_ENROLLMENT_VALUES, ...initialValues },
        onSubmit: (values) => onSubmit?.(values),
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form
                className="space-y-8"
                onSubmit={form.submit}
                aria-label="Formulaire d'inscription complète de l'élève"
            >
                {/* Section Affectation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <FormField
                        control={form.control}
                        name="classroomId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold text-base">Affectation en classe</FormLabel>
                                <FormControl>
                                    <Combobox
                                        {...field}
                                        options={classrooms}
                                        placeholder="Choisir une salle de classe"
                                        searchPlaceholder="Ex: 1ère Primaire..."
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    L'élève sera automatiquement inscrit dans cette promotion.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="isNewStudent"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="font-bold text-base">Provenance</FormLabel>
                                <FormControl>
                                    <StudentSeniorityStatusSelect
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Section Identité */}
                <StudentFields form={form} />

                {/* Actions (Slots) */}
                <div className="pt-6 border-t flex items-center justify-end gap-4">
                    {children}
                </div>
            </form>
        </Form>
    );
});

QuickEnrollmentForm.displayName = "QuickEnrollmentForm";