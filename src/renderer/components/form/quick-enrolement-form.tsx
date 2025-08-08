import React, { PropsWithChildren } from "react";
import { useControlledForm } from "@/camons/libs/forms";
import { QuickEnrollmentSchema, type QuickEnrollmentSchemaAttributes } from "@/renderer/libs/schemas";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/renderer/components/ui/select";
import { useFormImperativeHandle, type ImperativeFormHandle } from "./utils";
import { USER_GENDER, USER_ROLE } from "@/camons/constants/enum";
import { Input } from "@/renderer/components/ui/input";
import { GenderInput } from "./fields/gender";
import { Label } from "@/renderer/components/ui/label";
import { DatePickerInput } from "@/renderer/components/date-input";
import { RadioGroup, RadioGroupItem } from "@/renderer/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/renderer/utils";

// Exporte les utilitaires du formulaire pour les composants parents
export * from "./utils";

// Définition du type pour les données du formulaire
export type QuickEnrollmentFormData = QuickEnrollmentSchemaAttributes;

const DEFAULT_QUICK_ENROLLMENT_VALUES: QuickEnrollmentFormData = {
    classroomId: "145",
    isNewStudent: false,
    schoolId: "785",
    yearId: "785",
    isInSystem: false,
    studentId: undefined,
    student: {
        lastName: "",
        middleName: "",
        firstName: "",
        role: USER_ROLE.STUDENT,
        birthDate: new Date(),
        gender: USER_GENDER.MALE,
        birthPlace: "123",
    },
};

// Interface pour les options de classe
interface ClassroomOption {
    label: string;
    value: string;
}

interface ClassroomSelectProps {
    classrooms: ClassroomOption[];
    value: string;
    onChange(value: string): void;
}

const ClassroomSelect = React.forwardRef<any, ClassroomSelectProps>(
    ({ classrooms, value, onChange }, ref) => {
        return (
            <Select onValueChange={onChange} value={value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue ref={ref} placeholder="Sélectionnez la classe ici..." />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {classrooms.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }
);

ClassroomSelect.displayName = "ClassroomSelect";

// Composant pour les champs d'informations sur l'étudiant
const StudentFields: React.FC<{
    form: UseFormReturn<QuickEnrollmentFormData, any, QuickEnrollmentFormData>;
}> = ({ form }) => {
    return (
        <div className="space-y-5">
            <Label>Informations sur l'élève</Label>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                    control={form.control}
                    name="student.lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                                <Input {...field} />
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
                            <FormLabel>Postnom</FormLabel>
                            <FormControl>
                                <Input {...field} />
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
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                    control={form.control}
                    name="student.gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sexe</FormLabel>
                            <GenderInput {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="student.birthDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date de naissance</FormLabel>
                            <FormControl>
                                <DatePickerInput
                                    value={field.value ?? new Date()}
                                    onChange={field.onChange}
                                    placeholder="Sélectionner la date de naissance"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};

export interface QuickEnrollmentFormProps {
    classrooms?: ClassroomOption[];
    onSubmit?: (values: QuickEnrollmentFormData) => void;
    initialValues?: Partial<QuickEnrollmentFormData>;
}

export interface QuickEnrollmentFormHandle extends ImperativeFormHandle<QuickEnrollmentFormData> { }

export const QuickEnrollmentForm = React.forwardRef<
    QuickEnrollmentFormHandle,
    PropsWithChildren<QuickEnrollmentFormProps>
>(({ children, onSubmit, initialValues = {}, classrooms = [] }, ref) => {
    const [form, handleSubmit] = useControlledForm({
        schema: QuickEnrollmentSchema,
        defaultValues: { ...DEFAULT_QUICK_ENROLLMENT_VALUES, ...initialValues },
        onSubmit: (values) => {
            onSubmit?.(values);
        },
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <FormField
                    control={form.control}
                    name="classroomId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Classe</FormLabel>
                            <ClassroomSelect classrooms={classrooms} {...field} />
                            <FormDescription>
                                La classe (promotion) à laquelle l'élève sera affecté.
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
                            <FormLabel>Statut de l'élève</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={(value) => field.onChange(value === "true")}
                                    value={field.value ? "true" : "false"}
                                    className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0"
                                >
                                    <FormItem
                                        className={cn(
                                            "flex items-center space-x-3 rounded-lg border p-4",
                                            field.value && "border-primary"
                                        )}
                                    >
                                        <FormControl>
                                            <RadioGroupItem value="true" />
                                        </FormControl>
                                        <div className="space-y-1">
                                            <FormLabel className="font-semibold">Nouvel élève</FormLabel>
                                            <FormDescription>
                                                L'élève n'a jamais été inscrit dans cette école.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                    <FormItem
                                        className={cn(
                                            "flex items-center space-x-3 rounded-lg border p-4",
                                            !field.value && "border-primary"
                                        )}
                                    >
                                        <FormControl>
                                            <RadioGroupItem value="false" />
                                        </FormControl>
                                        <div className="space-y-1">
                                            <FormLabel className="font-semibold">Ancien élève</FormLabel>
                                            <FormDescription>
                                                L'élève a déjà été inscrit dans cette école.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <StudentFields form={form} />
                {children}
            </form>
        </Form>
    );
});

QuickEnrollmentForm.displayName = "QuickEnrollmentForm";