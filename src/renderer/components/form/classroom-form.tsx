import { forwardRef, type PropsWithChildren } from "react";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
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
import { Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/renderer/components/ui/select";
import { ButtonAi } from "@/renderer/components/buttons/button-ai";
import { useFormImperativeHandle, type ImperativeFormHandle } from "./utils";

import { useClassroomForm, type ClassroomFormData, type TSuggestion } from "./classroom-form.utils"



/**
 * OptionsSelect optimisé avec support ARIA
 */
function OptionsSelect({ options, placeholder }: { options: { label: string; value: string }[], placeholder?: string }) {
    return (
        <>
            <FormControl>
                <SelectTrigger aria-label={placeholder}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </>
    );
}

export const ClassroomForm = forwardRef<
    ImperativeFormHandle<ClassroomFormData>,
    PropsWithChildren<{
        onSubmit?: (value: ClassroomFormData) => void;
        initialValues?: Partial<ClassroomFormData>;
        options?: { label: string; value: string }[];
        onGenerateSuggestion?(optionId: string, name: string): TSuggestion | null
    }>
>(({ children, onSubmit, onGenerateSuggestion, initialValues = {}, options = [] }, ref) => {
    const { form, handleGenerate, isGenerating } = useClassroomForm({ initialValues, onGenerateSuggestion, onSubmit })
    useFormImperativeHandle(ref, form)
    return (
        <Form {...form}>
            <form
                onSubmit={form.submit}
                className="space-y-6"
                aria-label="Formulaire de création de classe"
            >
                {/* Champ Identifiant avec Bouton AI intégré proprement */}
                <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                        <FormItem className="relative">
                            <div className="flex items-center justify-between mb-1">
                                <FormLabel className="font-semibold">Nom complet de la classe</FormLabel>
                                <ButtonAi
                                    type="button"
                                    disabled={isGenerating}
                                    onClick={handleGenerate}
                                    aria-busy={isGenerating}
                                    title="Générer une suggestion via IA"
                                />
                            </div>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        placeholder="Ex: 6ème Math-Physique"
                                        className={isGenerating ? "opacity-50" : ""}
                                    />
                                    {isGenerating && (
                                        <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription>
                                Ce nom apparaîtra sur les bulletins et les listes officielles.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="shortIdentifier"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Code / Nom abrégé</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Ex: 6MP" />
                            </FormControl>
                            <FormDescription>Utilisé pour les affichages compacts.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="optionId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Option / Filière</FormLabel>
                                <Select
                                    onValueChange={(val) => field.onChange(val === "none" ? null : val)}
                                    value={field.value ?? "none"}
                                >
                                    <OptionsSelect
                                        options={[{ label: "Tronc commun (Aucune option)", value: "none" }, ...options]}
                                        placeholder="Choisir une option..."
                                    />
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="section"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Niveau d'enseignement / Sections</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <OptionsSelect
                                        options={SECTION_OPTIONS}
                                        placeholder="Sélectionner le niveau..."
                                    />
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="pt-4 border-t">
                    {children}
                </div>
            </form>
        </Form>
    );
});

ClassroomForm.displayName = "ClassroomForm";
export { createSuggestion, type ClassroomFormData } from "./classroom-form.utils"