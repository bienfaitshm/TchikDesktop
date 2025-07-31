import React, { PropsWithChildren } from "react";
import { useControlledForm } from "@/camons/libs/forms";
import { SchoolSchema, type SchoolAttributes } from "@/renderer/libs/schemas";
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


export { useFormRef } from "./utils";

/**
 * @typedef {SchoolAttributes} SchoolFormData
 * @description Type alias for the data structure representing a school's attributes.
 * This is derived from the `SchoolAttributes` type in your schema.
 */
export type SchoolFormData = SchoolAttributes;

/**
 * @constant DEFAULT_SCHOOL_VALUES
 * @description Default initial values for the school form fields.
 */
const DEFAULT_SCHOOL_VALUES: SchoolFormData = {
    name: "",
    adress: "",
    town: "Lubumbashi",
    logo: undefined
};


/**
 * @interface SchoolFormProps
 * @description Props for the `SchoolForm` component.
 * @property {(value: SchoolFormData) => void} [onSubmit] - Optional callback function to be called when the form is submitted and validated successfully.
 * @property {Partial<SchoolFormData>} [initialValues] - Optional initial values to pre-fill the form. These will merge with `DEFAULT_SCHOOL_VALUES`.
 */
export interface SchoolFormProps {
    onSubmit?: (value: SchoolFormData) => void;
    initialValues?: Partial<SchoolFormData>;
}

/**
 * @interface SchoolFormHandle
 * @description Extends `FormRef` to define the imperative handle for the `SchoolForm` component.
 * This allows a parent component to programmatically submit, reset, or access form state.
 */
export interface SchoolFormHandle extends FormRef { }

/**
 * @interface SectionSelectProps
 * @description Props for the `SectionSelect` component.
 * @property {{ label: string; value: string }[]} options - An array of objects, each with a `label` and `value`, to populate the select dropdown.
 * @property {string} [value] - The currently selected value for the input.
 * @property {(value: string) => void} onChangeValue - Callback function triggered when the select value changes.
 * @deprecated This interface seems unrelated to SchoolForm and might be a leftover from a previous context. Consider removing if not used.
 */
export interface SectionSelectProps {
    options: { label: string; value: string }[];
    value?: string;
    onChangeValue(value: string): void;
}


/**
 * @component SchoolForm
 * @description A reusable form component for managing school attributes (name, address, town, logo).
 * It leverages `react-hook-form` via `useControlledForm` for state management and validation
 * against `SchoolSchema`. It exposes imperative methods (like `submit`, `reset`) through a ref.
 * @param {React.ForwardedRef<SchoolFormHandle>} ref - A ref to imperatively control the form.
 * @param {PropsWithChildren<SchoolFormProps>} { children, onSubmit, initialValues } - Props for the component.
 * `children` can be used to render additional form elements or submission buttons.
 * `onSubmit` is called with validated form data. `initialValues` can pre-fill the form.
 * @returns {JSX.Element} The rendered school form.
 *
 * @example
 * ```tsx
 * import { useFormRef } from "@/path/to/this/file";
 * import { FormDialog } from "@/path/to/your/FormDialog";
 *
 * const MySchoolManagement = () => {
 * const SchoolFormRef = useFormRef<SchoolFormHandle>();
 * const dialogRef = FormDialog.useFormDialogRef();
 *
 * const handleFormSubmit = (data: SchoolFormData) => {
 * console.log("Form submitted with data:", data);
 * dialogRef.current?.closeDialog(); // Close dialog after successful submission
 * };
 *
 * const handleOpenEdit = (initialData: SchoolFormData) => {
 * SchoolFormRef.current?.reset(initialData); // Reset form with initial data for editing
 * dialogRef.current?.openDialog();
 * };
 *
 * return (
 * <>
 * <button onClick={() => dialogRef.current?.openDialog()}>Create New School</button>
 * <FormDialog.Root ref={dialogRef}>
 * <FormDialog.Header>
 * <FormDialog.Title>School Details</FormDialog.Title>
 * </FormDialog.Header>
 * <FormDialog.Content>
 * <FormDialog.FormWrapper>
 * <SchoolForm ref={SchoolFormRef} onSubmit={handleFormSubmit}>
 * <div className="pt-6">
 * <FormDialog.SubmitButton asChild>
 * <button type="submit">Save School</button>
 * </FormDialog.SubmitButton>
 * </div>
 * </SchoolForm>
 * </FormDialog.FormWrapper>
 * </FormDialog.Content>
 * </FormDialog.Root>
 *
 * <button onClick={() => handleOpenEdit({ name: "My School", adress: "123 Main St", town: "Anytown" })}>
 * Edit Existing School
 * </button>
 * </>
 * );
 * };
 * ```
 */
export const SchoolForm = React.forwardRef<
    SchoolFormHandle,
    PropsWithChildren<SchoolFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const [form, handleSubmit] = useControlledForm({
        schema: SchoolSchema,
        defaultValues: { ...DEFAULT_SCHOOL_VALUES, ...initialValues },
        onSubmit: (value) => {
            onSubmit?.(value); // Trigger the prop onSubmit callback
        },
    });

    useImperativeHandleForm(ref, form);
    return (
        <div>
            <Form {...form}>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* School Name Field */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom complet</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Saisissez le nom complet de l’école.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* School Town Field */}
                    <FormField
                        control={form.control}
                        name="town"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Ville</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Saisissez la ville où se trouve l'école.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* School Adress Field */}
                    <FormField
                        control={form.control}
                        name="adress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adresse</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Saisissez l'adresse physique de l'école.
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

SchoolForm.displayName = "SchoolForm";
