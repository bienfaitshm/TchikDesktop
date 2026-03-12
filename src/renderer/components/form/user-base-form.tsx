import React, { PropsWithChildren } from "react";
import { useZodForm } from "@/packages/use-zod-form";
import { UserCreateSchema, type TUserCreate } from "@/packages/@core/data-access/schema-validations";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/renderer/components/ui/form";
import { USER_GENDER, USER_ROLE } from "@/packages/@core/data-access/db";
import { Input } from "@/renderer/components/ui/input";
import { useFormImperativeHandle, type ImperativeFormHandle } from "./utils";
import { GenderInput } from "./fields/gender";
import { DateInput } from "./fields/date";

export * from "./utils";

export type UserCreateSchemaFormData = TUserCreate;

const DEFAULT_QUICK_ENROLLMENT_VALUES: UserCreateSchemaFormData = {
    lastName: "",
    middleName: "",
    firstName: "",
    role: USER_ROLE.STUDENT,
    birthDate: new Date(),
    gender: USER_GENDER.MALE,
    birthPlace: "",
};

export interface UserCreateSchemaFormProps {
    onSubmit?: (values: UserCreateSchemaFormData) => void;
    initialValues?: Partial<UserCreateSchemaFormData>;
}

export interface BaseUserFormHandle extends ImperativeFormHandle<UserCreateSchemaFormData> { }

/**
 * Formulaire de base pour les informations d'un utilisateur (Élève/Personnel).
 * Optimisé pour la saisie administrative rapide.
 */
export const BaseUserForm = React.forwardRef<
    BaseUserFormHandle,
    PropsWithChildren<UserCreateSchemaFormProps>
>(({ children, onSubmit, initialValues = {} }, ref) => {
    const form = useZodForm({
        schema: UserCreateSchema,
        defaultValues: { ...DEFAULT_QUICK_ENROLLMENT_VALUES, ...initialValues },
        onSubmit: (values) => {
            onSubmit?.(values);
        },
    });

    useFormImperativeHandle(ref, form);

    return (
        <Form {...form}>
            <form
                className="space-y-8"
                onSubmit={form.submit}
                aria-label="Informations d'identité"
            >
                <fieldset className="space-y-6">
                    <legend className="text-lg font-bold text-foreground mb-4">
                        Identité et État Civil
                    </legend>

                    {/* Ligne 1 : Les Noms */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">Nom</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Ex: KABANGE"
                                            autoComplete="family-name"
                                            className="h-11 uppercase"
                                        />
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
                                    <FormLabel className="font-semibold">Postnom</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Ex: MUKALA"
                                            className="h-11"
                                        />
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
                                    <FormLabel className="font-semibold">Prénom</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            value={field.value ?? ""}
                                            placeholder="Ex: Jean"
                                            autoComplete="given-name"
                                            className="h-11"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Ligne 2 : Sexe et Date de naissance */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-semibold">Sexe / Genre</FormLabel>
                                    <FormControl>
                                        <GenderInput {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="birthDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="mb-2 font-semibold">Date de naissance</FormLabel>
                                    <FormControl>
                                        <DateInput
                                            value={field.value ?? new Date()}
                                            onChange={field.onChange}
                                            placeholder="JJ/MM/AAAA"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Ligne 3 : Lieu de naissance */}
                    <FormField
                        control={form.control}
                        name="birthPlace"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Lieu de naissance</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        value={field.value ?? ""}
                                        placeholder="Ex: Lubumbashi, Haut-Katanga"
                                        autoComplete="address-level2"
                                        className="h-11"
                                    />
                                </FormControl>
                                <FormDescription className="text-xs">
                                    Précisez la ville et/ou la province.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>

                <div className="pt-6 border-t">
                    {children}
                </div>
            </form>
        </Form>
    );
});

BaseUserForm.displayName = "BaseUserFormHandle";