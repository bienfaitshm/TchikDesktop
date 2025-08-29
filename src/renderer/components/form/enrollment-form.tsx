import React, { PropsWithChildren } from "react";
import { useControlledForm } from "@/commons/libs/forms";
import { EnrollmentSchemaSchema, type EnrollmentSchemaAttributes } from "@/renderer/libs/schemas";
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
import { STUDENT_STATUS } from "@/commons/constants/enum";
import { StudentStatus } from "./fields/student-status";
import { StudentSeniorityStatusSelect } from "./fields/student-seriority-statut";

// Exporte les utilitaires du formulaire pour les composants parents
export * from "./utils";

// Définition du type pour les données du formulaire
export type EnrollmentFormData = EnrollmentSchemaAttributes;

const DEFAULT_QUICK_ENROLLMENT_VALUES: EnrollmentFormData = {
    classroomId: "",
    isNewStudent: false,
    schoolId: "",
    yearId: "",
    studentId: undefined,
    status: STUDENT_STATUS.EN_COURS
};

// Interface pour les options de classe
interface ClassroomOption {
    label: string;
    value: string;
}


export interface EnrollmentFormProps {
    classrooms?: ClassroomOption[];
    onSubmit?: (values: EnrollmentFormData) => void;
    initialValues?: Partial<EnrollmentFormData>;
}

export interface EnrollmentFormHandle extends ImperativeFormHandle<EnrollmentFormData> { }

export const EnrollmentForm = React.forwardRef<
    EnrollmentFormHandle,
    PropsWithChildren<EnrollmentFormProps>
>(({ children, onSubmit, initialValues = {}, classrooms = [] }, ref) => {
    const [form, handleSubmit] = useControlledForm({
        schema: EnrollmentSchemaSchema,
        defaultValues: { ...DEFAULT_QUICK_ENROLLMENT_VALUES, ...initialValues },
        onSubmit: (values) => {
            onSubmit?.(values);
        },
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-5">
                    <FormField
                        control={form.control}
                        name="classroomId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm">Classe</FormLabel>
                                <Combobox {...field}
                                    options={classrooms}
                                    placeholder="Choisir  une salle classe"
                                    searchPlaceholder="Chercher une salle de classe"
                                />
                                <FormDescription className="text-xs">
                                    Sélectionnez la classe (promotion) à laquelle cet élève sera affecté. Si vous effectuez un transfert, choisissez la nouvelle classe de l'élève.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm">Status de l'inscription</FormLabel>
                                <StudentStatus {...field} />
                                <FormDescription className="text-xs">
                                    Sélectionnez le statut actuel de l'élève. Vous pouvez mettre à jour cette information si l'élève change de statut (par exemple, en cas d'abandon ou d'exclusion).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                </div>

                <FormField
                    control={form.control}
                    name="isNewStudent"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel className="text-sm">Status de l'élève</FormLabel>
                            <FormControl>
                                <StudentSeniorityStatusSelect value={field.value} onChangeValue={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {children}
            </form>
        </Form>
    );
});

EnrollmentForm.displayName = "EnrollmentForm";