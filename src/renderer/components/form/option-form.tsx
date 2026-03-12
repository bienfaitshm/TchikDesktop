import React, { PropsWithChildren } from "react";
import { useZodForm } from "@/packages/use-zod-form";
import { SECTION_OPTIONS, SECTION } from "@/packages/@core/data-access/db";
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
import { useFormImperativeHandle, type ImperativeFormHandle } from "./utils";

export * from "./utils";

export interface OptionFormProps {
    onSubmit?: (value: OptionFormData) => void;
    initialValues?: Partial<OptionFormData>;
}

export interface OptionFormHandle extends ImperativeFormHandle<OptionFormData> { }

export interface SectionSelectProps {
    options: { label: string; value: string }[];
    value?: string;
    onChangeValue(value: string): void;
}

export type OptionFormData = TOptionCreate;

const DEFAULT_OPTION_VALUES: OptionFormData = {
    optionName: "",
    optionShortName: "",
    section: SECTION.SECONDARY,
    schoolId: ""
};

/**
 * SectionSelect optimisé pour l'accessibilité
 */
export const SectionSelect: React.FC<SectionSelectProps> = ({
    onChangeValue,
    options,
    value,
}) => {
    return (
        <Select onValueChange={onChangeValue} value={value}>
            <FormControl>
                <SelectTrigger className="w-full" aria-label="Choisir une section">
                    <SelectValue placeholder="Choisir le niveau..." />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export const OptionForm = React.forwardRef<
    ImperativeFormHandle<OptionFormData>,
    PropsWithChildren<OptionFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const form = useZodForm({
        schema: OptionCreateSchema,
        defaultValues: { ...DEFAULT_OPTION_VALUES, ...initialValues },
        onSubmit: (value) => onSubmit?.(value),
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form
                className="space-y-6"
                onSubmit={form.submit}
                aria-label="Configuration de la filière d'étude"
            >
                {/* Champ Nom complet - Focus UX principal */}
                <FormField
                    control={form.control}
                    name="optionName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold text-base">Nom complet de l'option</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="Ex: Pédagogie Générale"
                                    className="h-11" // Plus facile à cliquer/taper
                                />
                            </FormControl>
                            <FormDescription className="text-xs leading-relaxed">
                                Utilisez le nom officiel de la filière tel qu'il doit apparaître sur les documents.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Nom abrégé */}
                    <FormField
                        control={form.control}
                        name="optionShortName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Code / Abréviation</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Ex: PEDA" maxLength={10} />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Format court (max 10 car.).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Section */}
                    <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Niveau d'enseignement</FormLabel>
                                <FormControl>
                                    <SectionSelect
                                        options={SECTION_OPTIONS}
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Primaire, Secondaire, etc.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4 flex flex-col gap-3">
                    {children}
                </div>
            </form>
        </Form>
    );
});

OptionForm.displayName = "OptionForm";