import React, { PropsWithChildren } from "react";
import { useZodForm } from "@/packages/use-zod-form";
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
import { useFormImperativeHandle, type ImperativeFormHandle } from "./utils";
import { Input } from "@/renderer/components/ui/input";

export * from "./utils"

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


export interface SchoolFormProps {
    onSubmit?: (value: SchoolFormData) => void;
    initialValues?: Partial<SchoolFormData>;
}


export interface SchoolFormHandle extends ImperativeFormHandle<SchoolFormData> { }


export interface SectionSelectProps {
    options: { label: string; value: string }[];
    value?: string;
    onChangeValue(value: string): void;
}


export const SchoolForm = React.forwardRef<
    SchoolFormHandle,
    PropsWithChildren<SchoolFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const form = useZodForm({
        schema: SchoolSchema,
        defaultValues: { ...DEFAULT_SCHOOL_VALUES, ...initialValues },
        onSubmit: (value) => {
            onSubmit?.(value);
        },
    });

    useFormImperativeHandle(ref, form);

    return (
        <div>
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.submit}>
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
                    {children}
                </form>
            </Form>
        </div>
    );
});

SchoolForm.displayName = "SchoolForm";
