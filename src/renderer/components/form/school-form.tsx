import React, { PropsWithChildren } from "react";
import { useZodForm } from "@/packages/use-zod-form";
import { SchoolCreateSchema, type TSchoolCreate } from "@/packages/@core/data-access/schema-validations";
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

export type SchoolFormData = TSchoolCreate;

const DEFAULT_SCHOOL_VALUES: SchoolFormData = {
    name: "",
    adress: "",
    town: "Lubumbashi",
    logo: undefined
};

export interface SchoolFormProps {
    onSubmit?: (value: SchoolFormData) => void;
    initialValues?: Partial<SchoolFormData>;
}

export interface SchoolFormHandle extends ImperativeFormHandle<SchoolFormData> { }

/**
 * Formulaire de configuration de l'établissement scolaire.
 * Optimisé pour l'accessibilité (WCAG) et l'expérience utilisateur.
 */
export const SchoolForm = React.forwardRef<
    SchoolFormHandle,
    PropsWithChildren<SchoolFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const form = useZodForm({
        schema: SchoolCreateSchema,
        defaultValues: { ...DEFAULT_SCHOOL_VALUES, ...initialValues },
        onSubmit: (value) => {
            onSubmit?.(value);
        },
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form
                className="space-y-6"
                onSubmit={form.submit}
                aria-label="Formulaire de configuration de l'établissement"
            >
                {/* Section : Identité de l'établissement */}
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base">Nom officiel de l'école</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Ex: Complexe Scolaire MASOMO"
                                    autoComplete="organization"
                                    className="h-11"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Saisissez le nom complet tel qu'il doit apparaître sur les entêtes officiels.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Section : Localisation Géographique */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    />
                                </FormControl>
                                <FormDescription>
                                    La ville ou la commune de résidence.
                                </FormDescription>
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
                                    />
                                </FormControl>
                                <FormDescription>
                                    Numéro, avenue, quartier et commune.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Slot pour les actions (Boutons de sauvegarde, etc.) */}
                <div className="pt-4 border-t flex justify-end">
                    {children}
                </div>
            </form>
        </Form>
    );
});

SchoolForm.displayName = "SchoolForm";
export * from "./utils";