import React, { PropsWithChildren } from "react";
import { useZodForm } from "@/packages/use-zod-form";
import { StudyYearSchema, type StudyYearAttributes } from "@/renderer/libs/schemas";
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
import { Input } from "@/renderer/components/ui/input";
import { DateInput } from "@/renderer/components/form/fields/date";

export * from "./utils"

export type StudyYearFormData = StudyYearAttributes

/**
 * @constant DEFAULT_STUDY_YEAR_FORM_VALUES
 * @description Default initial values for the study year form fields.
 * Ensures that form fields have a starting state, especially for date inputs.
 */
const DEFAULT_STUDY_YEAR_FORM_VALUES: StudyYearFormData = {
    yearName: "",
    schoolId: "",
    startDate: new Date(),
    endDate: new Date(),
};

export interface StudyYearFormProps {
    onSubmit?: (values: StudyYearFormData) => void;
    initialValues?: Partial<StudyYearFormData>;
}


export interface StudyYearFormHandle extends ImperativeFormHandle<StudyYearFormData> { }


export const StudyYearForm = React.forwardRef<
    StudyYearFormHandle,
    PropsWithChildren<StudyYearFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const form = useZodForm({
        schema: StudyYearSchema,
        defaultValues: { ...DEFAULT_STUDY_YEAR_FORM_VALUES, ...initialValues },
        onSubmit: (values) => {
            onSubmit?.(values);
        },
    });

    useFormImperativeHandle(ref, form);


    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={form.submit}>
                {/* Field for Year Name */}
                <FormField
                    control={form.control}
                    name="yearName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom de l'année scolaire</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Année scolaire 2025-2026" {...field} />
                            </FormControl>
                            <FormDescription>
                                Saisissez un nom unique pour cette année scolaire (par exemple, "Année scolaire 2025-2026").
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        {/* Field for Start Date */}
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date de début</FormLabel>
                                    <FormControl>
                                        <DateInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Sélectionner la date de début"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Sélectionnez la date de début de l'année scolaire.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </div>
                    <div>
                        {/* Field for End Date */}
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date de fin</FormLabel>
                                    <FormControl>
                                        <DateInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Sélectionner la date de fin"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Sélectionnez la date de fin de l'année scolaire.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                {children}
            </form>
        </Form>
    );
});

StudyYearForm.displayName = "StudyYearForm";