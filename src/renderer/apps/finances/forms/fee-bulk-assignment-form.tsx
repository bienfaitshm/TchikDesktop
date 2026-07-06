import React from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { SelectInput } from "@/renderer/components/form/fields/select-input";
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";
import { SearchOption } from "@/renderer/libs/queries/base";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";
import { z } from "zod";

// Schéma local ou partagé pour la validation du traitement par lot
export const FeeBulkAssignmentSchema = z.object({
  feeConfigId: z.string().min(1, "La grille tarifaire est obligatoire"),
  scheduleId: z.string().min(1, "La tranche d'échéance est obligatoire"),
  classroomId: z.string().optional().nullable(),
  optionId: z.string().optional().nullable(),
});

export type FeeBulkAssignmentData = z.infer<typeof FeeBulkAssignmentSchema>;

const DEFAULT_VALUES: Partial<FeeBulkAssignmentData> = {
  feeConfigId: "",
  scheduleId: "",
  classroomId: null,
  optionId: null,
};

type FeeBulkAssignmentProps = {
  feeConfigSearch: SearchOption;
  scheduleSearch: SearchOption;
  classroomSearch: SearchOption;
  optionSearch: SearchOption;
};

export const FeeBulkAssignmentForm: React.FC<
  BaseFormProps<FeeBulkAssignmentData> & FeeBulkAssignmentProps
> = ({
  formId,
  onSubmit,
  feeConfigSearch,
  scheduleSearch,
  classroomSearch,
  optionSearch,
  defaultValues,
}) => {
  const form = useZodForm<FeeBulkAssignmentData>({
    schema: FeeBulkAssignmentSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire d'assignation de masse"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="feeConfigId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Grille Tarifaire Source
                </FormLabel>
                <FormControl>
                  <ComboboxSearch
                    onChange={field.onChange}
                    value={field.value}
                    options={feeConfigSearch.options}
                    onSearchChange={feeConfigSearch.setSearchQuery}
                    isLoading={feeConfigSearch.isSearching}
                    search={feeConfigSearch.searchQuery}
                    searchPlaceholder="Rechercher une configuration..."
                    placeholder="Sélectionner la règle de frais..."
                  />
                </FormControl>
                <FormDescription>
                  Détermine le montant et la devise à appliquer.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Tranche / Échéance
                </FormLabel>
                <FormControl>
                  <ComboboxSearch
                    onChange={field.onChange}
                    value={field.value}
                    options={scheduleSearch.options}
                    onSearchChange={scheduleSearch.setSearchQuery}
                    isLoading={scheduleSearch.isSearching}
                    search={scheduleSearch.searchQuery}
                    searchPlaceholder="Rechercher une tranche..."
                    placeholder="Sélectionner l'échéance cible..."
                  />
                </FormControl>
                <FormDescription>
                  Assigne la dette à cette période temporelle.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="p-4 border rounded-xl bg-muted/20 space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Filtres de population (Laisser vide pour cibler tout
            l'établissement)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Cibler une classe
                  </FormLabel>
                  <FormControl>
                    <ComboboxSearch
                      onChange={(val) =>
                        field.onChange(val === "none" ? null : val)
                      }
                      value={field.value ?? "none"}
                      options={classroomSearch.options}
                      onSearchChange={classroomSearch.setSearchQuery}
                      isLoading={classroomSearch.isSearching}
                      search={classroomSearch.searchQuery}
                      searchPlaceholder="Rechercher une classe..."
                      placeholder="Toutes les classes..."
                    />
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
                    Cibler une option / section
                  </FormLabel>
                  <FormControl>
                    <ComboboxSearch
                      onChange={(val) =>
                        field.onChange(val === "none" ? null : val)
                      }
                      value={field.value ?? "none"}
                      options={optionSearch.options}
                      onSearchChange={optionSearch.setSearchQuery}
                      isLoading={optionSearch.isSearching}
                      search={optionSearch.searchQuery}
                      searchPlaceholder="Rechercher une option..."
                      placeholder="Toutes les options..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
};

FeeBulkAssignmentForm.displayName = "FeeBulkAssignmentForm";
