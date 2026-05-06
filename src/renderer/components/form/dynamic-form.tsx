import React from "react";
import { Input } from "@/renderer/components/ui/input";
import { DynamicForm as DForm, FormFieldDef, InputComponents } from "@/packages/dynamic-form";
import { FieldValues } from "react-hook-form";
import { MultiSelect } from "@/renderer/components/form/fields/multi-select-input";
import { BaseFormProps } from "./base-form"
import { GenericComboBox } from "./fields/generic-combo-box";

/**
 * Adaptateur Combobox pour DynamicForm
 * Transforme les props standard du formulaire en props spécifiques au Combobox
 */
const SelectFieldAdapter = React.forwardRef<any, any>(({
    onChange,
    value,
    options = [],
    placeholder,
}, ref) => {
    return (
        <GenericComboBox
            ref={ref}
            value={value}
            onChangeValue={onChange}
            options={options}
            placeholder={placeholder || "Sélectionner une option..."}
            searchPlaceholder="Rechercher dans la liste..."
        />
    );
})

const formComponents: InputComponents = {
    TextField: Input,
    SelectField: SelectFieldAdapter,
    SelectArrayField: MultiSelect
};

type DynamicFormProps<T extends FieldValues> = BaseFormProps<T> & {
    fields?: FormFieldDef[]
}

export function DynamicForm({ formId, onSubmit, fields = [] }: DynamicFormProps<any>) {
    return (
        <DForm
            formId={formId}
            fields={fields}
            components={formComponents}
            onSubmit={(values) => onSubmit?.(values)}
        />
    )
}