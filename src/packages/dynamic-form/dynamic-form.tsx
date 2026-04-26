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

interface DynamicFormProps<TFieldValues extends FieldValues = FieldValues> {
    formId?: string;
    fields: FormFieldDef[];
    onSubmit: SubmitHandler<TFieldValues>;
    className?: string;
    components: {
        TextField: React.ComponentType<any>;
        SelectField?: React.ComponentType<any>;
    };
}

export function DynamicForm<TFieldValues extends FieldValues = FieldValues>({
    formId,
    fields,
    onSubmit,
    className,
    components
}: DynamicFormProps<TFieldValues>) {
    const fieldItems = useMemo(() => fields.filter(i => !i.hidden), [fields])
    const validationSchema = useMemo(
        () => generateValidationSchema(fields),
        [fields]
    );

    const defaultValues = useMemo(() => {
        return fields.reduce((acc, field) => {
            if (field.defaultValue !== undefined) {
                acc[field.id] = field.defaultValue;
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

    const renderInput = useCallback((field: FormFieldDef, rhfProps: any) => {
        const { TextField, SelectField } = components;
        if (field.type === "select" && SelectField) {
            return <SelectField {...rhfProps} options={field.options} />;
        }
        return <TextField {...rhfProps} type={field.type} />;
    }, [components]);

    return (
        <form
            id={formId}
            onSubmit={handleSubmit(onSubmit as any)}
            className={cn("space-y-6", className)}
            noValidate
        >
            <div className="grid grid-cols-12 gap-4">
                {fieldItems.map((field) => {
                    const error = errors[field.id];
                    const errorId = `${field.id}-error`;
                    const descriptionId = `${field.id}-description`;

                    return (
                        <div
                            key={field.id}
                            className={cn(
                                "flex flex-col gap-1.5",
                                field.colSpan ? `col-span-${field.colSpan}` : "col-span-12",
                                field.customClass
                            )}
                        >
                            {/* Label sémantique */}
                            <label
                                htmlFor={field.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {field.label}
                                {field.required && <span className="ml-1 text-destructive text-red-500">*</span>}
                            </label>

                            <Controller
                                control={control}
                                name={field.id as Path<TFieldValues>}
                                render={({ field: rhfField }) => renderInput(field, rhfField)}
                            />

                            {field.helperText && (
                                <p id={descriptionId} className="text-xs text-muted-foreground text-gray-500">
                                    {field.helperText}
                                </p>
                            )}

                            {error && (
                                <p id={errorId} role="alert" className="text-xs font-medium text-red-500">
                                    {error.message?.toString()}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </form>
    );
}