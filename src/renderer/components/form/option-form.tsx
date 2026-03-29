import React, { useMemo } from "react";
import { useZodForm } from "@/packages/use-zod-form";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { SECTION } from "@/packages/@core/data-access/db/enum";
import { OptionCreateSchema, type TOptionCreate } from "@/packages/@core/data-access/schema-validations";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/renderer/components/ui/select";
import { Layers, Hash, GraduationCap } from "lucide-react";
import { BaseFormProps } from "./base-form";

export type OptionFormData = TOptionCreate;

const DEFAULT_OPTION_VALUES: OptionFormData = {
    optionName: "",
    optionShortName: "",
    section: SECTION.SECONDARY,
    schoolId: ""
};

/**
 * SectionSelect : Composant atomique optimisé pour l'accessibilité.
 * Utilise les patterns de Radix UI pour la gestion du focus.
 */
interface SectionSelectProps {
    options: { label: string; value: string }[];
    value?: string;
    onChangeValue(value: string): void;
    disabled?: boolean;
}

export const SectionSelect: React.FC<SectionSelectProps> = ({
    onChangeValue,
    options,
    value,
    disabled
}) => (
    <Select onValueChange={onChangeValue} value={value} disabled={disabled}>
        <FormControl>
            <SelectTrigger
                className="w-full h-11"
                aria-label="Sélectionner le niveau d'enseignement"
            >
                <SelectValue placeholder="Choisir le niveau..." />
            </SelectTrigger>
        </FormControl>
        <SelectContent>
            {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                    {option.label}
                </SelectItem>
            ))}
        </SelectContent>
    </Select>
);

export const OptionForm: React.FC<BaseFormProps<OptionFormData>> = ({
    formId,
    initialValues,
    onSubmit
}) => {

    const mergedValues = useMemo(() => ({
        ...DEFAULT_OPTION_VALUES,
        ...initialValues
    }), [initialValues]);

    const form = useZodForm({
        schema: OptionCreateSchema,
        defaultValues: mergedValues,
        onSubmit: async (values) => {
            await onSubmit?.(values);
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form
                id={formId}
                className="space-y-8"
                onSubmit={form.submit}
                aria-label="Configuration de la filière d'étude"
                noValidate
            >
                {/* Section : Identification de l'Option */}
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="optionName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2 font-bold text-base">
                                    Nom de l'option / filière
                                    <span className="text-destructive" aria-hidden="true">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        disabled={isSubmitting}
                                        placeholder="Ex: Pédagogie Générale ou Commerciale & Gestion"
                                        className="h-11 focus-visible:ring-primary/50"
                                        aria-required="true"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Le libellé complet tel qu'il apparaîtra sur les titres scolaires.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Nom abrégé / Code */}
                        <FormField
                            control={form.control}
                            name="optionShortName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 font-semibold">
                                        Code (Abréviation)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isSubmitting}
                                            placeholder="Ex: HSC"
                                            maxLength={10}
                                            className="uppercase font-mono"
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[11px] leading-tight">
                                        Utilisé pour les tableaux compacts (Max 10 car.).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Section / Niveau */}
                        <FormField
                            control={form.control}
                            name="section"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2 font-semibold">
                                        Section
                                    </FormLabel>
                                    <FormControl>
                                        <SectionSelect
                                            options={SECTION_OPTIONS}
                                            value={field.value}
                                            onChangeValue={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[11px] leading-tight">
                                        Niveau d'enseignement attaché.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Feedback d'erreur globale */}
                {form.formState.errors.root && (
                    <div role="alert" className="p-3 text-red-600 border rounded-md text-sm font-medium animate-in fade-in zoom-in duration-200">
                        {form.formState.errors.root.message}
                    </div>
                )}
            </form>
        </Form>
    );
}

OptionForm.displayName = "OptionForm";