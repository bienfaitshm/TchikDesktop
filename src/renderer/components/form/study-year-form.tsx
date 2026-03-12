import React, { PropsWithChildren } from "react";
import { useZodForm } from "@/packages/use-zod-form";
import { StudyYearCreateSchema, type TStudyYearCreate } from "@/packages/@core/data-access/schema-validations";
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

export type StudyYearFormData = TStudyYearCreate

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

/**
 * Formulaire de configuration de l'année académique.
 * Optimisé pour la précision des données temporelles et l'accessibilité.
 */
export const StudyYearForm = React.forwardRef<
    StudyYearFormHandle,
    PropsWithChildren<StudyYearFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const form = useZodForm({
        schema: StudyYearCreateSchema,
        defaultValues: { ...DEFAULT_STUDY_YEAR_FORM_VALUES, ...initialValues },
        onSubmit: (values) => {
            onSubmit?.(values);
        },
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form
                className="space-y-6"
                onSubmit={form.submit}
                aria-label="Configuration de l'année scolaire"
            >
                {/* Libellé de l'année */}
                <FormField
                    control={form.control}
                    name="yearName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base">Désignation de l'année</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: 2025-2026"
                                    className="h-11"
                                    {...field}
                                    aria-required="true"
                                />
                            </FormControl>
                            <FormDescription className="text-xs">
                                Utilisez un nom distinctif pour identifier cette période académique.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Groupe Temporel : Début et Fin */}
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 border-none p-0 m-0">
                    <legend className="sr-only">Période scolaire</legend>

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="font-semibold">Date d'ouverture</FormLabel>
                                <FormControl>
                                    <DateInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Début des cours"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Date officielle de la rentrée.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="font-semibold">Date de clôture</FormLabel>
                                <FormControl>
                                    <DateInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Fin de l'année"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Date de fin des activités scolaires.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>

                <div className="pt-4 border-t flex justify-end">
                    {children}
                </div>
            </form>
        </Form>
    );
});

StudyYearForm.displayName = "StudyYearForm";