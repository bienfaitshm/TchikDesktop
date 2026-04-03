import { useMemo } from 'react';
import { UseFormReturn, DefaultValues } from 'react-hook-form';
import { FieldValues } from 'react-hook-form';
import { ZodSchema } from 'zod';
import { useZodForm as useForm } from "@/packages/use-zod-form";

export type BaseFormProps<T extends FieldValues> = {
    formId?: string;
    initialValues?: DefaultValues<T>;
    onSubmit?: (data: T, helpers: { reset: () => void }) => void | Promise<void>;
};


export function createSubmitHandler<T extends FieldValues>(
    form: UseFormReturn<T>,
    onSubmit?: BaseFormProps<T>["onSubmit"]
) {
    return async (values: T) => {
        if (onSubmit) {
            await onSubmit(values, { reset: () => form.reset() });
        }
    };
}

export interface UseZodFormConfig<T extends FieldValues> {
    schema: ZodSchema<T>;
    defaultValues: DefaultValues<T>;
    initialValues?: Partial<T>;
    onSubmit?: (data: T, helpers: { reset: (values?: T) => void }) => void | Promise<void>;
}

export function useZodForm<T extends FieldValues>({
    schema,
    defaultValues,
    initialValues,
    onSubmit
}: UseZodFormConfig<T>) {

    const mergedDefaultValues = useMemo(() => ({
        ...defaultValues,
        ...initialValues
    }), [initialValues, defaultValues]);

    const form = useForm({
        schema,
        defaultValues: mergedDefaultValues as DefaultValues<T>,
    });

    const submit = form.handleSubmit(async (values) => {
        if (onSubmit) {
            await onSubmit(values, {
                reset: (nextValues) => {
                    console.log("Reset form....")
                    form.reset(nextValues ?? mergedDefaultValues)
                }
            });
        }
    });

    return {
        ...form,
        submit,
        isSubmitting: form.formState.isSubmitting,
    };
}