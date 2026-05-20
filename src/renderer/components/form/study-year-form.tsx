import React, { useMemo } from "react";
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
import { Input } from "@/renderer/components/ui/input";
import { DateInput } from "@/renderer/components/form/fields/date";
import type { BaseFormProps } from "./base-form";
import { CalendarDays, AlertCircle } from "lucide-react";

export type StudyYearFormData = TStudyYearCreate;

const DEFAULT_VALUES: StudyYearFormData = {
    yearName: "",
    schoolId: "",
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
};

/**
 * Formulaire de configuration de l'année académique.
 * Focus : Précision temporelle, accessibilité WCAG et robustesse UX.
 */
export const StudyYearForm: React.FC<BaseFormProps<StudyYearFormData>> = ({
    formId,
    onSubmit,
    initialValues = {}
}) => {

    const mergedValues = useMemo(() => ({
        ...DEFAULT_VALUES,
        ...initialValues
    }), [initialValues]);

    const form = useZodForm({
        schema: StudyYearCreateSchema,
        defaultValues: mergedValues,
        onSubmit: async (values) => {
            try {
                await onSubmit?.(values);
            } catch (error) {
                form.setError("root", {
                    message: "Impossible d'enregistrer l'année. Vérifiez la cohérence des dates."
                });
            }
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form
                id={formId}
                className="space-y-8"
                onSubmit={form.submit}
                aria-label="Configuration de l'année scolaire"
                noValidate
            >
                {/* Section : Identification de la période */}
                <div>
                    <FormField
                        control={form.control}
                        name="yearName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 font-bold text-base">
                                    Désignation de l'année
                                    <span className="text-destructive" aria-hidden="true">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ex: 2025-2026"
                                        className="h-11 focus-visible:ring-primary"
                                        disabled={isSubmitting}
                                        aria-required="true"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Sera utilisé sur les bulletins et documents officiels.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Groupe Temporel : Calendrier Scolaire */}
                <fieldset aria-labelledby="period-legend" className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg border text-muted-foreground">
                    <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-2 flex items-center gap-2" id="period-legend">
                        <CalendarDays className="h-5 w-5  text-muted-foreground" />
                        <h3 className="font-semibold">Calendrier Scolaire</h3>
                    </legend>

                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="font-medium text-muted-foreground">Date d'ouverture</FormLabel>
                                <FormControl>
                                    <DateInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Date de rentrée"
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="font-medium text-muted-foreground">Date de clôture</FormLabel>
                                <FormControl>
                                    <DateInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Fin des cours"
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>
                {/* Alerte d'erreur globale */}
                {form.formState.errors.root && (
                    <div role="alert" className="flex items-center gap-2 p-3 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="h-4 w-4" />
                        {form.formState.errors.root.message}
                    </div>
                )}
            </form>
        </Form>
    );
};

StudyYearForm.displayName = "StudyYearForm";