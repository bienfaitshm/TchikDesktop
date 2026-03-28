import React, { useMemo } from "react";
import { useZodForm } from "@/packages/use-zod-form";
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
import { SchoolCreateSchema, type TSchoolCreate } from "@/packages/@core/data-access/schema-validations";
import { BaseFormProps } from "./base-form";
import { Loader2 } from "lucide-react";

export type SchoolFormData = TSchoolCreate;

const DEFAULT_SCHOOL_VALUES: SchoolFormData = {
    name: "",
    adress: "",
    town: "Lubumbashi",
    logo: undefined
};

/**
 * Formulaire de configuration de l'établissement scolaire.
 */
export const SchoolForm: React.FC<BaseFormProps<SchoolFormData>> = ({
    formId,
    onSubmit,
    initialValues = {}
}) => {

    const mergedDefaultValues = useMemo(() => ({
        ...DEFAULT_SCHOOL_VALUES,
        ...initialValues
    }), [initialValues]);

    const form = useZodForm({
        schema: SchoolCreateSchema,
        defaultValues: mergedDefaultValues,
        onSubmit: async (values) => {
            try {
                await onSubmit?.(values);
            } catch (error) {
                form.setError("root", { message: "Une erreur est survenue lors de l'enregistrement." });
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
                aria-label="Configuration de l'établissement scolaire"
                noValidate
            >
                {/* Section : Informations Générales */}
                <section className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-1 font-bold text-muted-foreground">
                                    Nom officiel de l'école
                                    <span className="text-destructive" aria-hidden="true">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Ex: Complexe Scolaire MASOMO"
                                        autoComplete="organization"
                                        className="h-11 focus-visible:ring-primary/50"
                                        disabled={isSubmitting}
                                        aria-required="true"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Saisissez le nom complet tel qu'il doit apparaître sur les bulletins et rapports.
                                </FormDescription>
                                <FormMessage className="font-medium" />
                            </FormItem>
                        )}
                    />
                </section>

                {/* Section : Localisation avec Fieldset pour l'accessibilité */}
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-lg border text-muted-foreground">
                    <legend className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 px-2">
                        Localisation Géographique
                    </legend>

                    <FormField
                        control={form.control}
                        name="town"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Ville</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Ex: Lubumbashi"
                                        autoComplete="address-level2"
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="adress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Adresse physique</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Ex: 12, Avenue des Écoles, Q/Golf"
                                        autoComplete="street-address"
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>

                {/* Gestion des erreurs globales (Root) */}
                {form.formState.errors.root && (
                    <div role="alert" className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
                        {form.formState.errors.root.message}
                    </div>
                )}

                {/* Optionnel : Indicateur visuel de chargement si le bouton est à l'extérieur */}
                {isSubmitting && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse" aria-live="polite">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Traitement en cours...
                    </div>
                )}
            </form>
        </Form>
    );
};

SchoolForm.displayName = "SchoolForm";