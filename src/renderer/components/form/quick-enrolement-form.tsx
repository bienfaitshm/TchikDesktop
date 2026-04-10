"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/renderer/components/ui/form"
import { USER_GENDER_ENUM, USER_ROLE_ENUM } from "@/packages/@core/data-access/db/enum"
import { EnrolementQuickCreateSchema, type TEnrolementQuickCreate } from "@/packages/@core/data-access/schema-validations"
import { Input } from "@/renderer/components/ui/input"
import { Combobox } from "@/renderer/components/ui/combobox"
import { DateInput } from "@/renderer/components/form/fields/date"
import { GenderInput } from "./fields/gender"
import { StudentSeniorityStatusSelect } from "./fields/student-seriority-statut"
import { BaseFormProps, useZodForm } from "./base-form"

export type QuickEnrollmentFormData = TEnrolementQuickCreate

/**
 * Valeurs par défaut stables
 */
export const DEFAULT_QUICK_ENROLLMENT_VALUES: Partial<QuickEnrollmentFormData> = {
    classroomId: "",
    isNewStudent: false,
    isInSystem: false,
    student: {
        lastName: "",
        middleName: "",
        firstName: "",
        role: USER_ROLE_ENUM.STUDENT,
        birthDate: new Date(),
        gender: USER_GENDER_ENUM.MALE,
        birthPlace: "Lubumbashi",
    },
}

/**
 * StudentFields - Sous-section du formulaire
 * Utilise useFormContext pour réduire le couplage.
 */
const StudentFields = () => {
    const { control, formState: { isSubmitting } } = useFormContext<QuickEnrollmentFormData>()

    return (
        <fieldset className="space-y-4 border-t pt-1" disabled={isSubmitting}>
            <legend className="px-1 text-md font-bold tracking-tight text-foreground">
                Identité de l'élève
            </legend>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                    control={control}
                    name="student.lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex: KABILA" autoComplete="family-name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="student.middleName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Postnom</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex: MUKALA" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="student.firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value!} placeholder="Ex: Jean" autoComplete="given-name" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField
                    control={control}
                    name="student.gender"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sexe</FormLabel>
                            <FormControl>
                                <GenderInput
                                    value={field.value}
                                    onChange={field.onChange}
                                    options={[
                                        { label: "Masculin", value: USER_GENDER_ENUM.MALE },
                                        { label: "Féminin", value: USER_GENDER_ENUM.FEMALE }
                                    ]}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="student.birthPlace"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lieu de naissance</FormLabel>
                            <FormControl>
                                <Input {...field} value={field.value!} placeholder="Ville ou Territoire" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="student.birthDate"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel className="mb-2">Date de naissance</FormLabel>
                            <FormControl>
                                <DateInput
                                    value={field.value!}
                                    onChange={field.onChange}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </fieldset>
    )
}

interface QuickEnrollmentFormProps {
    classrooms?: { value: string; label: string }[]
}

/**
 * QuickEnrollmentForm
 * Formulaire d'inscription rapide.
 */
export const QuickEnrollmentForm: React.FC<
    BaseFormProps<QuickEnrollmentFormData> & QuickEnrollmentFormProps
> = ({ formId, onSubmit, initialValues = DEFAULT_QUICK_ENROLLMENT_VALUES, classrooms = [] }) => {

    const form = useZodForm({
        schema: EnrolementQuickCreateSchema,
        initialValues: (initialValues || DEFAULT_QUICK_ENROLLMENT_VALUES) as QuickEnrollmentFormData,
        defaultValues: DEFAULT_QUICK_ENROLLMENT_VALUES,
        onSubmit,
    })

    const { isSubmitting } = form.formState

    return (
        <Form {...form}>
            <form
                id={formId}
                className="space-y-10"
                onSubmit={form.submit}
                aria-label="Inscription rapide"
            >
                {/* Section Affectation Académique */}
                <FormField
                    control={form.control}
                    name="classroomId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Classe de destination</FormLabel>
                            <FormControl>
                                <Combobox
                                    {...field}
                                    options={classrooms}
                                    placeholder="Sélectionner la classe"
                                    classname="lg:w-[850px] md:w-[600px]"
                                />
                            </FormControl>
                            <FormDescription>
                                L'élève sera assigné à cette classe pour l'année en cours.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <section className="w-full">
                    <FormField
                        control={form.control}
                        name="isNewStudent"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Statut d'inscription</FormLabel>
                                <FormControl>
                                    <StudentSeniorityStatusSelect
                                        value={field.value}
                                        onChangeValue={field.onChange}
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>

                {/* Champs d'identité (fieldset interne) */}
                <StudentFields />
            </form>
        </Form>
    )
}

QuickEnrollmentForm.displayName = "QuickEnrollmentForm"