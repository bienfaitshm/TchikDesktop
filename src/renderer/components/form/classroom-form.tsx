import { forwardRef, useCallback, type PropsWithChildren } from "react";
import { SECTION, SECTION_TRANSLATIONS, getEnumKeyValueList} from "@/packages/@core/data-access/db";
import { ClassroomCreateSchema, type TClassroomCreate }  from "@/packages/@core/data-access/schema-validations"
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
import { useZodForm } from "@/packages/use-zod-form"
import { useFormImperativeHandle, type ImperativeFormHandle } from "./utils";
import { ButtonAi } from "../buttons/button-ai";

export * from "./utils";

export type ClassroomFormData = TClassroomCreate;

const DEFAULT_CLASSROOM_VALUES: ClassroomFormData = {
    identifier: "",
    shortIdentifier: "",
    schoolId: "",
    optionId: null,
    yearId: "",
    section: SECTION.SECONDARY,
};

const SECTION_SELECT_OPTIONS = getEnumKeyValueList(
    SECTION,
    SECTION_TRANSLATIONS
);

export interface ClassroomFormProps {
    onSubmit?: (value: ClassroomFormData) => void;
    initialValues?: Partial<ClassroomFormData>;
    options?: { label: string; value: string }[];
    onGenerateSuggestion?(optionId: string | string, name: string): { name: string, shortName: string }
}

export interface ClassroomFormHandle extends ImperativeFormHandle<ClassroomFormData> { }

interface SelectProps {
    options: { label: string; value: string }[];
    placeholder?: string;
}

/**
 * A reusable select component for handling options.
 */
function OptionsSelect({ options, placeholder }: SelectProps) {
    return (
        <>
            <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </>
    );
}

/**
 * Renders a form to manage classroom data.
 * @description This form is a controlled component with an imperative handle for
 * submitting and resetting the form from a parent component.
 */
export const ClassroomForm = forwardRef<
    ClassroomFormHandle,
    PropsWithChildren<ClassroomFormProps>
>(({ children, onSubmit, onGenerateSuggestion, initialValues = {}, options = [] }, ref) => {
    const form = useZodForm({
        schema: ClassroomCreateSchema,
        defaultValues: { ...DEFAULT_CLASSROOM_VALUES, ...initialValues },
        onSubmit,
    });

    useFormImperativeHandle(ref, form);

    const handleGenerate = useCallback(() => {
        const { identifier, optionId } = form.getValues();
        form.clearErrors(["identifier", "optionId"]);
        if (!identifier) {
            form.setError("identifier", { type: "required", message: "L'identifiant est requis pour générer une suggestion." });
            return;
        }

        if (!optionId) {
            form.setError("optionId", { type: "required", message: "L'option de suggestion est requise, Veuillez sélectionner une option." });
            return;
        }

        // 2. Logique de Génération (maintenant assurée d'avoir les valeurs)
        const result = onGenerateSuggestion?.(optionId, identifier);

        if (result) {
            form.setValue("identifier", result?.name);
            form.setValue("shortIdentifier", result?.shortName);
        }

        form.clearErrors(["identifier", "optionId"]);
    }, [form, onGenerateSuggestion]);
    return (
        <Form {...form}>
            <form onSubmit={form.submit} className="space-y-4">
                <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between">
                                <FormLabel>Nom complet</FormLabel>
                                <ButtonAi onClick={handleGenerate} />
                            </div>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                Saisissez le nom complet de la classe (ex. : 2e Électricité
                                Générale, 1er Humanités Scientifiques).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="shortIdentifier"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom abrégé</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription>
                                Saisissez le nom abrégé de la classe (ex. : 2e ELEC, 3e HSC, 1er
                                TCC).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <FormField
                            control={form.control}
                            name="optionId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Option</FormLabel>
                                    <Select
                                        onValueChange={(value) =>
                                            field.onChange(value === "null" ? null : value)
                                        }
                                        defaultValue={field.value ?? "null"}
                                    >
                                        <OptionsSelect
                                            options={[{ label: "Aucune options.", value: "null" }, ...options]}
                                            placeholder="Précisez l'option ici..."
                                        />
                                    </Select>
                                    <FormDescription>
                                        Précisez l'option ici.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div>
                        <FormField
                            control={form.control}
                            name="section"
                            render={({ field: { onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Section</FormLabel>
                                    <Select onValueChange={onChange} defaultValue={field.value}>
                                        <OptionsSelect
                                            options={SECTION_SELECT_OPTIONS}
                                            placeholder="Sélectionner la section ici..."
                                        />
                                    </Select>
                                    <FormDescription>Précisez la section ici.</FormDescription>
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

ClassroomForm.displayName = "ClassroomForm";