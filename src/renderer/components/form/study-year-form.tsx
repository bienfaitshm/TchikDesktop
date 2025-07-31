import React, { PropsWithChildren } from "react";
import { useControlledForm } from "@/camons/libs/forms";
import { StudyYearSchema, type StudyYearAttributes } from "@/renderer/libs/schemas";
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
import { DatePickerInput } from "@/renderer/components/date-input";

export * from "./utils"

/**
 * @typedef {StudyYearAttributes} StudyYearFormData
 * @description Type alias for the data structure expected from the StudyYear form.
 * This aligns with the `StudyYearAttributes` type defined in your schema.
 * Note: `schoolId` is assumed to be handled externally or implicitly, as it's not a direct input field in this form.
 */
export type StudyYearFormData = StudyYearAttributes

/**
 * @constant DEFAULT_STUDY_YEAR_FORM_VALUES
 * @description Default initial values for the study year form fields.
 * Ensures that form fields have a starting state, especially for date inputs.
 */
const DEFAULT_STUDY_YEAR_FORM_VALUES: StudyYearFormData = {
    yearName: "",
    schoolId: "",
    startDate: new Date(),
    endDate: new Date(),
};

/**
 * @interface StudyYearFormProps
 * @description Props for the `StudyYearForm` component.
 * @property {(values: StudyYearFormData) => void} [onSubmit] - Optional callback function to be invoked when the form is
 * submitted and successfully validated. It receives the form data as `StudyYearFormData`.
 * @property {Partial<StudyYearFormData>} [initialValues] - Optional initial values to pre-fill the form fields.
 * These values will be merged with `DEFAULT_STUDY_YEAR_FORM_VALUES`.
 */
export interface StudyYearFormProps {
    onSubmit?: (values: StudyYearFormData) => void;
    initialValues?: Partial<StudyYearFormData>;
}

/**
 * @interface StudyYearFormHandle
 * @description Extends `FormHandleRef` to define the imperative handle for the `StudyYearForm` component.
 * This allows a parent component to programmatically interact with the form, such as
 * submitting it, resetting its fields, or accessing its current state.
 */
export interface StudyYearFormHandle extends ImperativeFormHandle<StudyYearFormData> { }

/**
 * @component StudyYearForm
 * @description A reusable form component for creating or editing study year details.
 * It integrates with `react-hook-form` and a Zod schema for validation.
 * The form supports controlled behavior and can be imperatively controlled by a parent
 * component via `React.forwardRef`. It also accepts additional child elements to be
 * rendered within the form (e.g., submit buttons).
 *
 * @param {PropsWithChildren<StudyYearFormProps>} props - The props for the component,
 * including `onSubmit`, `initialValues`, and `children`.
 * @param {React.Ref<StudyYearFormHandle>} ref - A ref forwarded from the parent component
 * to allow imperative control over the form.
 * @returns {JSX.Element} The rendered study year form.
 *
 * @example
 * ```tsx
 * import React from "react";
 * import { StudyYearForm, StudyYearFormHandle, StudyYearFormData } from './path/to/this/file';
 * import { Button } from "@/renderer/components/ui/button"; // Assuming shadcn button
 * import { toast } from "sonner"; // Assuming sonner for notifications
 *
 * function CreateStudyYearPage() {
 * const formRef = React.useRef<StudyYearFormHandle>(null);
 *
 * const handleFormSubmit = (data: StudyYearFormData) => {
 * console.log("Form Data Submitted:", data);
 * toast.success("Année scolaire enregistrée !", {
 * description: `Nom: ${data.yearName}, Début: ${data.startDate.toLocaleDateString()}, Fin: ${data.endDate.toLocaleDateString()}`,
 * });
 * // Simulate API call
 * // await myApiService.createStudyYear(data);
 * };
 *
 * return (
 * <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
 * <h2 className="text-2xl font-bold mb-6 text-center">Créer une Année Scolaire</h2>
 * <StudyYearForm ref={formRef} onSubmit={handleFormSubmit}>
 * <div className="flex justify-end mt-6">
 * <Button type="submit" onClick={() => formRef.current?.submit()}>
 * Soumettre l'Année Scolaire
 * </Button>
 * </div>
 * </StudyYearForm>
 * </div>
 * );
 * }
 * ```
 */
export const StudyYearForm = React.forwardRef<
    StudyYearFormHandle,
    PropsWithChildren<StudyYearFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const [form, handleSubmit] = useControlledForm({
        schema: StudyYearSchema,
        defaultValues: { ...DEFAULT_STUDY_YEAR_FORM_VALUES, ...initialValues },
        onSubmit: (values) => {
            onSubmit?.(values);
        },
    });

    useFormImperativeHandle(ref, form);


    return (
        <Form {...form}>
            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* Field for Year Name */}
                <FormField
                    control={form.control}
                    name="yearName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom de l'année scolaire</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Année scolaire 2025-2026" {...field} />
                            </FormControl>
                            <FormDescription>
                                Saisissez un nom unique pour cette année scolaire (par exemple, "Année scolaire 2025-2026").
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        {/* Field for Start Date */}
                        <FormField
                            control={form.control}
                            name="startDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date de début</FormLabel>
                                    <FormControl>
                                        <DatePickerInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Sélectionner la date de début"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Sélectionnez la date de début de l'année scolaire.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                    </div>
                    <div>
                        {/* Field for End Date */}
                        <FormField
                            control={form.control}
                            name="endDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date de fin</FormLabel>
                                    <FormControl>
                                        <DatePickerInput
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Sélectionner la date de fin"
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Sélectionnez la date de fin de l'année scolaire.
                                    </FormDescription>
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

StudyYearForm.displayName = "StudyYearForm";