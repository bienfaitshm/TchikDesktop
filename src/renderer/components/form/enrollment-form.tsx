import React, { useId } from "react";
import { STUDENT_STATUS_ENUM as STUDENT_STATUS } from "@/packages/@core/data-access/db/enum";
import { STUDENT_STATUS_OPTIONS } from "@/packages/@core/data-access/db/options"
import { EnrolementCreateSchema, type TEnrolementCreate } from "@/packages/@core/data-access/schema-validations";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/renderer/components/ui/form";
import { Combobox } from "@/renderer/components/ui/combobox";
import { StudentStatus } from "./fields/student-status";
import { StudentSeniorityStatusSelect } from "./fields/student-seriority-statut";
import { BaseFormProps, useZodForm } from "./base-form";

export type EnrollmentFormData = TEnrolementCreate;

const DEFAULT_VALUES: EnrollmentFormData = {
    classroomId: "",
    studentId: "",
    schoolId: "",
    yearId: "",
    isNewStudent: false,
    status: STUDENT_STATUS.EN_COURS
};

interface Option {
    label: string;
    value: string;
}

export interface EnrollmentFormProps {
    classrooms?: Option[];
    students?: Option[];
}

export const EnrollmentForm: React.FC<BaseFormProps<EnrollmentFormData> & EnrollmentFormProps> = ({
    formId,
    onSubmit,
    initialValues,
    classrooms = [],
    students = []
}) => {
    const form = useZodForm({
        schema: EnrolementCreateSchema,
        defaultValues: DEFAULT_VALUES,
        initialValues,
        onSubmit
    });


    const classDescId = useId();
    const statusDescId = useId();
    const seniorityDescId = useId();

    return (
        <Form {...form}>
            <form
                id={formId}
                className="space-y-8"
                onSubmit={form.submit}
                aria-label="Formulaire d'inscription rapide de l'élève"
            >
                {/* Section : Identification */}
                <fieldset className="space-y-6 border-none p-0 m-0">
                    <FormField
                        control={form.control}
                        name="studentId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Élève à inscrire</FormLabel>
                                <FormControl>
                                    <Combobox
                                        {...field}
                                        options={students}
                                        placeholder="Rechercher un élève..."
                                        searchPlaceholder="Saisissez le nom ou matricule..."
                                        aria-required="true"
                                        classname="lg:w-[850px] md:w-[600px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>

                {/* Section : Paramètres de l'inscription */}
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 border-none p-0 m-0">
                    <legend className="sr-only">Détails de la classe et du statut</legend>

                    <FormField
                        control={form.control}
                        name="classroomId"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Classe de destination</FormLabel>
                                <FormControl>
                                    <Combobox
                                        {...field}
                                        options={classrooms}
                                        placeholder="Choisir une classe..."
                                        aria-describedby={classDescId}
                                        aria-required="true"
                                    />
                                </FormControl>
                                <FormDescription id={classDescId} className="text-xs">
                                    Affectation pour l'année scolaire en cours.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Statut du dossier</FormLabel>
                                <FormControl>
                                    <StudentStatus
                                        {...field}
                                        aria-describedby={statusDescId}
                                        options={STUDENT_STATUS_OPTIONS}
                                    />
                                </FormControl>
                                <FormDescription id={statusDescId} className="text-xs">
                                    Niveau de validation administrative.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>

                {/* Section : Historique / Provenance */}
                <fieldset>
                    <legend className="sr-only">Ancienneté de l'élève</legend>
                    <FormField
                        control={form.control}
                        name="isNewStudent"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <div className="space-y-1">
                                    <FormLabel>Profil d'admission</FormLabel>
                                    <FormDescription id={seniorityDescId} className="text-xs">
                                        Indiquez si l'élève est un nouveau venu dans l'établissement.
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <StudentSeniorityStatusSelect
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                        aria-describedby={seniorityDescId}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>
            </form>
        </Form>
    );
};

EnrollmentForm.displayName = "EnrollmentForm";