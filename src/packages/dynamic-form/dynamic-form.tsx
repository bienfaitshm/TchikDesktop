import React, { useMemo, useCallback } from "react";
import {
    useForm,
    Controller,
    FieldValues,
    DefaultValues,
    Path,
    SubmitHandler
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormFieldDef } from "./type";
import { generateValidationSchema } from "./schema-generator";
import { cn } from "./utils";

export interface InputComponents {
    TextField: React.ComponentType<any>;
    SelectField?: React.ComponentType<any>;
}

interface DynamicFormProps<TFieldValues extends FieldValues = FieldValues> {
    formId?: string;
    fields: FormFieldDef[];
    onSubmit: SubmitHandler<TFieldValues>;
    className?: string;
    components: InputComponents;
}

const colSpanClasses: Record<number, string> = {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
    7: "col-span-7",
    8: "col-span-8",
    9: "col-span-9",
    10: "col-span-10",
    11: "col-span-11",
    12: "col-span-12",
};

export function DynamicForm<TFieldValues extends FieldValues = FieldValues>({
    formId,
    fields,
    onSubmit,
    className,
    components
}: DynamicFormProps<TFieldValues>) {

    const fieldItems = useMemo(() => fields.filter((i) => !i.hidden), [fields]);

    const validationSchema = useMemo(
        () => generateValidationSchema(fields),
        [fields]
    );

    const defaultValues = useMemo(() => {
        return fields.reduce((acc, field) => {
            if (field.defaultValue !== undefined) {
                acc[field.id as keyof DefaultValues<TFieldValues>] = field.defaultValue as any;
            }
            return acc;
        }, {} as DefaultValues<TFieldValues>);
    }, [fields]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(validationSchema),
        defaultValues,
    });

    const renderInput = useCallback(
        (field: FormFieldDef, rhfProps: any, errorId: string, descriptionId: string, hasError: boolean) => {
            const { TextField, SelectField } = components;

            const a11yProps = {
                id: field.id,
                "aria-invalid": hasError,
                "aria-describedby": [
                    field.helperText ? descriptionId : null,
                    hasError ? errorId : null,
                ].filter(Boolean).join(" ") || undefined,
            };

            if (field.type === "select" && SelectField) {
                return <SelectField {...rhfProps} {...a11yProps} options={field.options} />;
            }
            return <TextField {...rhfProps} {...a11yProps} type={field.type} />;
        },
        [components]
    );

    return (
        <form
            id={formId}
            onSubmit={handleSubmit(onSubmit as any)}
            className={cn("w-full space-y-6", className)}
            noValidate
        >
            <div className="grid grid-cols-12 gap-x-4 gap-y-6">
                {fieldItems.map((field) => {
                    const error = errors[field.id];
                    const errorId = `${field.id}-error`;
                    const descriptionId = `${field.id}-description`;
                    const safeColSpan = colSpanClasses[field.colSpan ?? 12] || "col-span-12";

                    return (
                        <div
                            key={field.id}
                            className={cn(
                                "flex w-full flex-col gap-2",
                                safeColSpan,
                                field.customClass
                            )}
                        >
                            {/* Label sémantique */}
                            <label
                                htmlFor={field.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                            >
                                {field.label}
                                {field.required && (
                                    <span className="ml-1 text-destructive" aria-hidden="true">*</span>
                                )}
                            </label>

                            <Controller
                                control={control}
                                name={field.id as Path<TFieldValues>}
                                render={({ field: rhfField }) =>
                                    renderInput(field, rhfField, errorId, descriptionId, !!error)
                                }
                            />

                            <div className="flex flex-col gap-1.5 empty:hidden">
                                {field.helperText && (
                                    <p id={descriptionId} className="text-sm text-muted-foreground">
                                        {field.helperText}
                                    </p>
                                )}

                                {error && (
                                    <p id={errorId} role="alert" className="text-sm font-medium text-destructive">
                                        {error.message?.toString()}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </form>
    );
}