import { forwardRef, type PropsWithChildren } from "react";
import { useControlledForm } from "@/camons/libs/forms";
import { SECTION, SECTION_TRANSLATIONS } from "@/camons/constants/enum";
import { type ClassAttributes, ClassSchema } from "@/renderer/libs/schemas";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/renderer/components/ui/select";
import { getEnumKeyValueList } from "@/camons/utils";

export * from "./utils";

export type ClassroomFormData = ClassAttributes;

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
>(({ children, onSubmit, initialValues = {}, options = [] }, ref) => {
    const [form, handleSubmit] = useControlledForm({
        schema: ClassSchema,
        defaultValues: { ...DEFAULT_CLASSROOM_VALUES, ...initialValues },
        onSubmit,
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom complet</FormLabel>
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

                {children}
            </form>
        </Form>
    );
});

ClassroomForm.displayName = "ClassroomForm";