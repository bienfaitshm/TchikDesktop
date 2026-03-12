import React, { PropsWithChildren } from "react";
import { useZodForm } from "@/packages/use-zod-form";
import { STUDENT_STATUS } from "@/packages/@core/data-access/db";
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
import { Combobox } from "../ui/combobox";
import { StudentStatus } from "./fields/student-status";
import { StudentSeniorityStatusSelect } from "./fields/student-seriority-statut";

export * from "./utils";

export type EnrollmentFormData = TEnrolementQuickCreate;

const DEFAULT_QUICK_ENROLLMENT_VALUES: EnrollmentFormData = {
    classroomId: "",
    isNewStudent: false,
    schoolId: "",
    yearId: "",
    studentId: undefined,
    status: STUDENT_STATUS.EN_COURS
};

interface ClassroomOption {
    label: string;
    value: string;
}

export interface EnrollmentFormProps {
    classrooms?: ClassroomOption[];
    onSubmit?: (values: EnrollmentFormData) => void;
    initialValues?: Partial<EnrollmentFormData>;
}

export const EnrollmentForm = React.forwardRef<
    ImperativeFormHandle<EnrollmentFormData>,
    PropsWithChildren<EnrollmentFormProps>
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
                aria-label="Formulaire d'inscription rapide de l'élève"
            >
                {/* Section 1: Informations d'affectation */}
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 border-none p-0 m-0">
                    <legend className="sr-only">Détails de l'affectation</legend>
                    <FormField
                        control={form.control}
                        name="classroomId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="font-semibold text-base">Salle de classe cible</FormLabel>
                                <FormControl>
                                    <Combobox
                                        {...field}
                                        options={classrooms}
                                        placeholder="Sélectionner une classe..."
                                        searchPlaceholder="Rechercher (ex: 3ème...)"
                                        aria-required="true"
                                    />
                                </FormControl>
                                <FormDescription className="text-[0.8rem] leading-relaxed">
                                    Classe à laquelle l'élève sera rattaché pour l'année en cours.
                                </FormDescription>
                                <FormMessage className="font-medium" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="font-semibold text-base">État de l'inscription</FormLabel>
                                <FormControl>
                                    <StudentStatus {...field} />
                                </FormControl>
                                <FormDescription className="text-[0.8rem] leading-relaxed">
                                    Définit si l'élève est actif, en attente ou régularisé.
                                </FormDescription>
                                <FormMessage className="font-medium" />
                            </FormItem>
                        )}
                    />
                </fieldset>

                {/* Section 2: Profil de l'élève */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                    <FormField
                        control={form.control}
                        name="isNewStudent"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <div className="space-y-1">
                                    <FormLabel className="font-semibold text-base">Provenance de l'élève</FormLabel>
                                    <FormDescription className="text-[0.8rem]">
                                        Est-ce la première fois que cet élève s'inscrit dans cet établissement ?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <StudentSeniorityStatusSelect
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormMessage className="font-medium" />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Slot pour les boutons d'action */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    {children}
                </div>
            </form>
        </Form>
    );
});

EnrollmentForm.displayName = "EnrollmentForm";