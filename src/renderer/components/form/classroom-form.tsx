import React from "react";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import {
  ClassroomCreate,
  ClassroomCreateSchema,
} from "@/packages/@core/data-access/schema-validations";
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
import { ButtonAi } from "@/renderer/components/buttons/button-ai";
import { SelectInput } from "@/renderer/components/form/fields/select-input";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";
import { UseZodFormReturn } from "@/packages/use-zod-form";
import { z } from "zod";
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";
import { SearchOption } from "@/renderer/libs/queries/base";

const DEFAULT_VALUES: Partial<ClassroomCreate> = {
  identifier: "",
  shortIdentifier: "",
  schoolId: "",
  section: SECTION_ENUM.SECONDARY,
  yearId: "",
};

type ClassroomProps = {
  searchOption?: SearchOption;
  sectionOptions?: { label: string; value: string }[];
  onGenerateSuggestion?(
    form: UseZodFormReturn<z.ZodType<ClassroomCreate>>,
  ): void;
  isGenerating?: boolean;
};

export const ClassroomForm: React.FC<
  BaseFormProps<ClassroomCreate> & ClassroomProps
> = ({
  formId,
  onSubmit,
  onGenerateSuggestion,
  searchOption,
  sectionOptions = [],
  defaultValues,
  isGenerating,
}) => {
  const form = useZodForm<ClassroomCreate>({
    schema: ClassroomCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire de création de classe"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="section"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Niveau d'enseignement / Sections
                </FormLabel>
                <FormControl>
                  <SelectInput options={sectionOptions} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="optionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Option / Filière
                </FormLabel>
                <FormControl>
                  <ComboboxSearch
                    onChange={(val) =>
                      field.onChange(val === "none" ? null : val)
                    }
                    value={field.value ?? "none"}
                    options={searchOption?.options}
                    onSearchChange={searchOption?.setSearchQuery}
                    isLoading={searchOption?.isSearching}
                    search={searchOption?.searchQuery}
                    searchPlaceholder="Recherer une options... Ex. HP"
                    placeholder="Choisir une option..."
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Champ Identifiant avec Bouton AI intégré proprement */}
        <FormField
          control={form.control}
          name="identifier"
          render={({ field }) => (
            <FormItem className="relative">
              <div className="flex items-center justify-between mb-1">
                <FormLabel className="font-semibold">
                  Nom complet de la classe
                </FormLabel>
                <ButtonAi
                  type="button"
                  disabled={isGenerating}
                  onClick={() => onGenerateSuggestion?.(form)}
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
              <FormDescription>
                Utilisé pour les affichages compacts.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

ClassroomForm.displayName = "ClassroomForm";
