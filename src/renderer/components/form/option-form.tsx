import React, { PropsWithChildren } from "react";
import { useControlledForm } from "@/camons/libs/forms";
import { SECTION, SECTION_TRANSLATIONS } from "@/camons/constants/enum";
import { OptionSchema, type OptionAttributes } from "@/renderer/libs/schemas";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/renderer/components/ui/form";
import { useImperativeHandleForm, type FormRef } from "./utils"; // Assuming utils contains FormRef and useImperativeHandleForm
import { Input } from "@/renderer/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/renderer/components/ui/select";
import { getEnumKeyValueList } from "@/camons/utils";

export { useFormRef } from "./utils";

/**
 * @typedef {OptionAttributes} OptionFormData
 * @description Type alias for the data structure representing an option's attributes.
 * This is derived from the `OptionAttributes` type in your schema.
 */
export type OptionFormData = OptionAttributes;

/**
 * @constant DEFAULT_OPTION_VALUES
 * @description Default initial values for the option form fields.
 */
const DEFAULT_OPTION_VALUES: OptionFormData = {
    optionName: "",
    optionShortName: "",
    section: SECTION.SECONDARY,
};

/**
 * @constant SECTION_SELECT_OPTIONS
 * @description Prepared list of options for the section select input,
 * mapping enum values to their translated labels.
 */
const SECTION_SELECT_OPTIONS = getEnumKeyValueList(SECTION, SECTION_TRANSLATIONS);

/**
 * @interface OptionFormProps
 * @description Props for the `OptionForm` component.
 * @property {(value: OptionFormData) => void} [onSubmit] - Optional callback function to be called when the form is submitted and validated successfully.
 * @property {Partial<OptionFormData>} [initialValues] - Optional initial values to pre-fill the form. These will merge with `DEFAULT_OPTION_VALUES`.
 */
export interface OptionFormProps {
    onSubmit?: (value: OptionFormData) => void;
    initialValues?: Partial<OptionFormData>;
}

/**
 * @interface OptionFormHandle
 * @description Extends `FormRef` to define the imperative handle for the `OptionForm` component.
 * This allows a parent component to programmatically submit, reset, or access form state.
 */
export interface OptionFormHandle extends FormRef { }

/**
 * @interface SectionSelectProps
 * @description Props for the `SectionSelect` component.
 * @property {{ label: string; value: string }[]} options - An array of objects, each with a `label` and `value`, to populate the select dropdown.
 * @property {string} [value] - The currently selected value for the input.
 * @property {(value: string) => void} onChangeValue - Callback function triggered when the select value changes.
 */
export interface SectionSelectProps {
    options: { label: string; value: string }[];
    value?: string;
    onChangeValue(value: string): void;
}

/**
 * @component SectionSelect
 * @description A controlled select input component specifically designed for choosing a section.
 * It integrates with Radix UI's `Select` component.
 * @param {SectionSelectProps} { onChangeValue, options, value } - Props for the component.
 * @returns {JSX.Element} The rendered section select input.
 *
 * @example
 * ```tsx
 * // Inside a form field:
 * <SectionSelect
 * options={[{ label: "Primary", value: "PRIMARY" }, { label: "Secondary", value: "SECONDARY" }]}
 * value={field.value}
 * onChangeValue={field.onChange}
 * />
 * ```
 */
export const SectionSelect: React.FC<SectionSelectProps> = ({
    onChangeValue,
    options,
    value,
}) => {
    return (
        <Select onValueChange={onChangeValue} defaultValue={value}>
            <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la section ici..." />
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

/**
 * @component OptionForm
 * @description A reusable form component for managing option attributes (name, short name, section).
 * It leverages `react-hook-form` via `useControlledForm` for state management and validation
 * against `OptionSchema`. It exposes imperative methods (like `submit`, `reset`) through a ref.
 * @param {React.ForwardedRef<OptionFormHandle>} ref - A ref to imperatively control the form.
 * @param {PropsWithChildren<OptionFormProps>} { children, onSubmit, initialValues } - Props for the component.
 * `children` can be used to render additional form elements or submission buttons.
 * `onSubmit` is called with validated form data. `initialValues` can pre-fill the form.
 * @returns {JSX.Element} The rendered option form.
 *
 * @example
 * ```tsx
 * import { useFormRef } from "@/path/to/this/file";
 * import { FormDialog } from "@/path/to/your/FormDialog";
 *
 * const MyOptionManagement = () => {
 * const optionFormRef = useFormRef<OptionFormHandle>();
 * const dialogRef = FormDialog.useFormDialogRef();
 *
 * const handleFormSubmit = (data: OptionFormData) => {
 * console.log("Form submitted with data:", data);
 * dialogRef.current?.closeDialog(); // Close dialog after successful submission
 * };
 *
 * const handleOpenEdit = (initialData: OptionFormData) => {
 * optionFormRef.current?.reset(initialData); // Reset form with initial data for editing
 * dialogRef.current?.openDialog();
 * };
 *
 * return (
 * <>
 * <button onClick={() => dialogRef.current?.openDialog()}>Create New Option</button>
 * <FormDialog.Root ref={dialogRef}>
 * <FormDialog.Header>
 * <FormDialog.Title>Option Details</FormDialog.Title>
 * </FormDialog.Header>
 * <FormDialog.Content>
 * <FormDialog.FormWrapper>
 * <OptionForm ref={optionFormRef} onSubmit={handleFormSubmit}>
 * <div className="pt-6">
 * <FormDialog.SubmitButton asChild>
 * <button type="submit">Save Option</button>
 * </FormDialog.SubmitButton>
 * </div>
 * </OptionForm>
 * </FormDialog.FormWrapper>
 * </FormDialog.Content>
 * </FormDialog.Root>
 *
 * <button onClick={() => handleOpenEdit({ optionName: "Existing Opt", optionShortName: "EO", section: SECTION.PRIMARY })}>
 * Edit Existing Option
 * </button>
 * </>
 * );
 * };
 * ```
 */
export const OptionForm = React.forwardRef<
    OptionFormHandle,
    PropsWithChildren<OptionFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const [form, handleSubmit] = useControlledForm({
        schema: OptionSchema, // Use the Zod schema for validation
        defaultValues: { ...DEFAULT_OPTION_VALUES, ...initialValues }, // Merge defaults with any provided initial values
        onSubmit: (value) => {
            onSubmit?.(value); // Trigger the prop onSubmit callback
        },
    });

    // Expose react-hook-form's methods imperatively via the ref
    useImperativeHandleForm(ref, form);

    return (
        <div>
            <Form {...form}> {/* Pass the form instance from useControlledForm */}
                <form className="space-y-4" onSubmit={handleSubmit}> {/* Use the handleSubmit from useControlledForm */}
                    {/* Option Name Field */}
                    <FormField
                        control={form.control}
                        name="optionName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom complet</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Saisissez le nom complet de l’option (ex. : Électricité Générale, Humanités Scientifiques).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Option Short Name Field */}
                    <FormField
                        control={form.control}
                        name="optionShortName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom abrégé</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Saisissez le nom abrégé de l’option (ex. : ELEC, HSC, TCC).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Section Select Field */}
                    <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section</FormLabel>
                                <FormControl>
                                    <SectionSelect
                                        options={SECTION_SELECT_OPTIONS}
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Précisez la section ici.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {children} {/* Render any additional children passed to the form */}
                </form>
            </Form>
        </div>
    );
});

OptionForm.displayName = "OptionForm";