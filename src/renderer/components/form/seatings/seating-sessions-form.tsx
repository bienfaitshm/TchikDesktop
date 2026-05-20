import React from "react";
import { LucideCalendarDays, LucideGraduationCap, LucideType, LucideHistory } from "lucide-react";
import { SeatingSessionCreateSchema, TSeatingSessionCreate } from "@/packages/@core/data-access/schema-validations";
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

export type SessionFormData = TSeatingSessionCreate;

const DEFAULT_SESSION_VALUES: SessionFormData = {
    schoolId: "",
    sessionName: "",
    yearId: ""
};

export const SeatingSessionForm: React.FC<BaseFormProps<SessionFormData>> = ({
    formId,
    initialValues,
    onSubmit
}) => {
    const form = useZodForm({
        schema: SeatingSessionCreateSchema,
        initialValues,
        defaultValues: DEFAULT_SESSION_VALUES,
        onSubmit
    });

    const isSubmitting = form.formState.isSubmitting;

    return (
        <Form {...form}>
            <form
                id={formId}
                className="space-y-8"
                onSubmit={form.submit}
                aria-label="Configuration de la session d'examen"
                noValidate
            >
                {/* SECTION 1 : DÉTAILS DE LA SESSION */}
                <section className="space-y-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <LucideGraduationCap className="w-5 h-5 text-primary" />
                            <h3 className="text-lg font-semibold tracking-tight">Détails de l'Examen</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Identifiez formellement la période d'évaluation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Champ Nom de la Session */}
                        <FormField
                            control={form.control}
                            name="sessionName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-medium">
                                        Nom de la session
                                        <span className="ml-1 text-destructive" aria-hidden="true">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <LucideType className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <Input
                                                {...field}
                                                disabled={isSubmitting}
                                                placeholder="Ex: Examen 1er Semestre, Session de Rattrapage..."
                                                className="pl-10 h-11 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                                aria-required="true"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription className="text-[12px]">
                                        Ce nom figurera sur les listes de présence et les plans de table (ex: <strong>Examen 1er Semestre</strong>).
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>

                <Separator />

                {/* SECTION 2 : CONTEXTE TEMPOREL (Optionnel selon vos besoins réels) */}
                <section className="space-y-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                        <LucideHistory className="w-5 h-5" />
                        <h4 className="text-sm font-medium uppercase tracking-wide">Contexte</h4>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bordershadow-sm border-muted-foreground border">
                            <LucideCalendarDays className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Affectation à l'Année Scolaire</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                La session sera automatiquement liée à l'année en cours. Assurez-vous que les effectifs par classe sont à jour avant de générer le placement.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Feedback d'erreur globale */}
                {form.formState.errors.root && (
                    <div
                        role="alert"
                        className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg text-sm font-medium flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                        {form.formState.errors.root.message}
                    </div>
                )}
            </form>
        </Form>
    );
}

SeatingSessionForm.displayName = "SeatingSessionForm";