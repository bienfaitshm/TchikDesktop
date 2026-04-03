import React from "react";
import { LucideLayoutGrid, LucideSchool, LucideType, LucideInfo } from "lucide-react";
import { LocalRoomCreateSchema, TLocalRoomCreate } from "@/packages/@core/data-access/schema-validations";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { Separator } from "@/renderer/components/ui/separator";
import { BaseFormProps, useZodForm } from "@/renderer/components/form/base-form";

export type LocalFormData = TLocalRoomCreate;

const DEFAULT_ROOM_VALUES: LocalFormData = {
    name: "",
    schoolId: "",
    maxCapacity: 50,
    totalColumns: 0,
    totalRows: 0,
};

export const LocalRoomForm: React.FC<BaseFormProps<LocalFormData>> = ({
    formId,
    initialValues,
    onSubmit
}) => {
    const form = useZodForm({
        schema: LocalRoomCreateSchema,
        initialValues,
        defaultValues: DEFAULT_ROOM_VALUES,
        onSubmit
    });

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form
                id={formId}
                className="space-y-10"
                onSubmit={form.submit}
                aria-label="Configuration de la salle de classe"
                noValidate
            >
                {/* SECTION 1 : IDENTIFICATION */}
                <section className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <LucideSchool className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold tracking-tight">Identification</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Définissez comment la salle sera reconnue dans l'établissement.</p>
                    </div>

                    {/* Champ Nom de la salle mis à jour */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-medium">
                                    Désignation de la salle
                                    <span className="ml-1 text-destructive" aria-hidden="true">*</span>
                                </FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <LucideType className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            {...field}
                                            disabled={isSubmitting}
                                            placeholder="Ex: Local 1, Local 2, Salle A..."
                                            className="pl-10 h-11 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                            aria-required="true"
                                        />
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Saisissez le nom usuel utilisé dans l'établissement (ex: <strong>Local 1</strong>).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </section>

                <Separator />

                {/* SECTION 2 : CONFIGURATION PHYSIQUE */}
                <section className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <LucideLayoutGrid className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold tracking-tight">Configuration Physique</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Paramétrez la capacité d'accueil et la disposition des places.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {/* Capacité Maximale */}
                        <FormField
                            control={form.control}
                            name="maxCapacity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel >
                                        Capacité
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            disabled={isSubmitting}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[11px] leading-tight">
                                        Nombre total d'élèves autorisés.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Rangées */}
                        <FormField
                            control={form.control}
                            name="totalRows"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de Rangs</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            disabled={isSubmitting}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[11px] leading-tight">
                                        Disposition verticale des bancs/tables.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Colonnes */}
                        <FormField
                            control={form.control}
                            name="totalColumns"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Colonnes</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="number"
                                            disabled={isSubmitting}
                                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                        />
                                    </FormControl>
                                    <FormDescription className="text-[11px] leading-tight">
                                        Nombre de places par rangée.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex items-start gap-2 p-3">
                        <LucideInfo className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-[12px] text-blue-700 leading-relaxed">
                            <strong>Note :</strong> La multiplication des rangs et colonnes définit la grille visuelle pour le placement lors des examens.
                        </p>
                    </div>
                </section>

                {/* Feedback d'erreur globale */}
                {form.formState.errors.root && (
                    <div
                        role="alert"
                        className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-1"
                    >
                        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                        {form.formState.errors.root.message}
                    </div>
                )}
            </form>
        </Form>
    );
}

LocalRoomForm.displayName = "LocalRoomForm";