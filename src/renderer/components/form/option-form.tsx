import React, { PropsWithChildren } from "react"
import { useControlledForm } from "@/camons/libs/forms"
import { SECTION, SECTION_TRANSLATIONS } from "@/camons/constants/enum"
import { OptionSchema, type OptionAttributes } from "@/renderer/libs/schemas"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/renderer/components/ui/form"
import { mergeDefaultValue, useImperativeHandleForm, type FormRef } from "./utils"
import { Input } from "../ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/renderer/components/ui/select"
import { getEnumKeyValueList } from "@/camons/utils"

export { useFormRef } from "./utils"

const schema = OptionSchema
export type ValueType = OptionAttributes

const DEFAULT_VALUE: ValueType = {
    optionName: "",
    optionShortName: "",
    section: SECTION.SECONDARY
}

const SECTION_OPTIONS = getEnumKeyValueList(SECTION, SECTION_TRANSLATIONS)
export interface OptionFormProps {
    onSubmit?(value: ValueType): void,
    initialValues?: Partial<ValueType>
}

export interface OptionFormRef extends FormRef {

}


export interface SectionInputProps {
    options: { label: string; value: string }[],
    value?: string;
    onChangeValue(value: string): void
}
export const SectionInput: React.FC<SectionInputProps> = ({ onChangeValue, options, value }) => {
    return (
        <Select onValueChange={onChangeValue} defaultValue={value}>
            <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Selectioner la section ici..." />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {options.map(option => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}


export const OptionForm = React.forwardRef<OptionFormRef, PropsWithChildren<OptionFormProps>>(({ children, onSubmit, initialValues = {} }, ref) => {
    const [form, handleSubmit] = useControlledForm({
        schema,
        defaultValues: mergeDefaultValue(DEFAULT_VALUE, initialValues),
        onSubmit(value) {
            onSubmit?.(value)
        }
    })

    useImperativeHandleForm(ref, form)

    return (
        <div>
            <Form {...form}>
                <form className="space-y-4" onSubmit={handleSubmit}>
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

                    <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section</FormLabel>
                                <FormControl>
                                    <SectionInput
                                        options={SECTION_OPTIONS}
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Precisez la section ici.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {children}
                </form>
            </Form>
        </div>
    )
})

OptionForm.displayName = "OptionForm"