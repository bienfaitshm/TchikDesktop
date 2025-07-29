import React, { PropsWithChildren } from "react"
import { useControlledForm } from "@/camons/libs/forms"
import { SECTION, SECTION_TRANSLATIONS } from "@/camons/constants/enum"
import { OptionSchema, type OptionAttributes } from "@/renderer/libs/schemas"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/renderer/components/ui/form"
import { mergeDefaultValue, useImperativeHandleForm, type FormRef } from "./utils"
import { Input } from "../ui/input"

export { useFormRef } from "./utils"

const schema = OptionSchema
export type ValueType = OptionAttributes

const DEFAULT_VALUE: ValueType = {
    optionName: "",
    optionShortName: "",
    section: SECTION.SECONDARY
}

export interface OptionFormProps {
    onSubmit?(value: ValueType): void,
    initialValues?: Partial<ValueType>
}

export interface OptionFormRef extends FormRef {

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
                <form onSubmit={handleSubmit}>
                    <FormField
                        control={form.control}
                        name="optionName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>le nom le plus detaillee de l&apos;option (ex: Electricite Generale, Humanite scientifique )</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="optionShortName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nom Court</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>le nom le plus cours de l&apos;option (ex: ELEC, HSC, TCC...)</FormDescription>
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