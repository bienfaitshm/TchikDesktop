import React, { PropsWithChildren } from "react";
import { useControlledForm } from "@/commons/libs/forms";
import { BaseUserSchema, type BaseUserSchemaAttributes } from "@/renderer/libs/schemas";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/renderer/components/ui/form";
import { useFormImperativeHandle, type ImperativeFormHandle } from "./utils";
import { USER_GENDER, USER_ROLE } from "@/commons/constants/enum";
import { Input } from "@/renderer/components/ui/input";
import { GenderInput } from "./fields/gender";
import { Label } from "@/renderer/components/ui/label";
import { DatePickerInput } from "@/renderer/components/date-input";
import { DateInput } from "./fields/date";


// Exporte les utilitaires du formulaire pour les composants parents
export * from "./utils";

export type BaseUserSchemaFormData = BaseUserSchemaAttributes;

const DEFAULT_QUICK_ENROLLMENT_VALUES: BaseUserSchemaFormData = {
    lastName: "",
    middleName: "",
    firstName: "",
    role: USER_ROLE.STUDENT,
    birthDate: new Date(),
    gender: USER_GENDER.MALE,
    birthPlace: "",
};





export interface BaseUserSchemaFormProps {
    onSubmit?: (values: BaseUserSchemaFormData) => void;
    initialValues?: Partial<BaseUserSchemaFormData>;
}

export interface BaseUserSchemaFormHandle extends ImperativeFormHandle<BaseUserSchemaFormData> { }

export const BaseUserSchemaForm = React.forwardRef<
    BaseUserSchemaFormHandle,
    PropsWithChildren<BaseUserSchemaFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const [form, handleSubmit] = useControlledForm({
        schema: BaseUserSchema,
        defaultValues: { ...DEFAULT_QUICK_ENROLLMENT_VALUES, ...initialValues },
        onSubmit: (values) => {
            onSubmit?.(values);
        },
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                    <Label>Informations sur l'élève</Label>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="middleName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Postnom</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prénom</FormLabel>
                                    <FormControl>
                                        <Input {...field} value={field.value ?? ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sexe</FormLabel>
                                    <GenderInput {...field} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mt-1 mb-1">Date de naissance</FormLabel>
                                    <FormControl>
                                        <div className="w-full">
                                            <DateInput
                                                value={field.value ?? new Date()}
                                                onChange={field.onChange}
                                                placeholder="Sélectionner la date de naissance"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="birthPlace"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Lieu de naissance</FormLabel>
                                <FormControl>
                                    <Input {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {children}
            </form>
        </Form>
    );
});

BaseUserSchemaForm.displayName = "BaseUserSchemaForm";