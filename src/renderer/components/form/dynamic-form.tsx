import React from "react";
import { Input } from "@/renderer/components/ui/input";
import { Combobox } from "@/renderer/components/ui/combobox"
import { DynamicForm as DForm, FormFieldDef, InputComponents } from "@/packages/dynamic-form";
import { FieldValues } from "react-hook-form";
import { FilterCheckboxInput } from "@/renderer/components/form/fields/filter-checkbox-input";
import { BaseFormProps } from "./base-form"

/**
 * Adaptateur Combobox pour DynamicForm
 * Transforme les props standard du formulaire en props spécifiques au Combobox
 */
const SelectFieldAdapter = React.forwardRef<any, any>(({
    onChange,
    value,
    options = [],
    placeholder,
    disabled
}, ref) => {
    return (
        <Combobox
            ref={ref}
            value={value}
            onChange={onChange}
            options={options}
            placeholder={placeholder || "Sélectionner une option..."}
            searchPlaceholder="Rechercher dans la liste..."
            disable={disabled}
        />
    );
})

const formComponents: InputComponents = {
    TextField: Input,
    SelectField: SelectFieldAdapter,
    SelectArrayField: FilterCheckboxInput
};

type DynamicFormProps<T extends FieldValues> = BaseFormProps<T> & {
    fields?: FormFieldDef[]
}

export function DynamicForm<T extends FieldValues>({ formId, onSubmit, fields = [] }: DynamicFormProps<T>) {
    return (
        <DForm
            formId={formId}
            fields={fields}
            components={formComponents}
            onSubmit={(values) => onSubmit?.(values, {
                reset() {

                },
            })}
        />
    )
}