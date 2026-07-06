import React from "react";
import {
  FeeScheduleCreate,
  FeeScheduleCreateSchema,
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
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";
import { SearchOption } from "@/renderer/libs/queries/base";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";

const DEFAULT_VALUES: Partial<FeeScheduleCreate> = {
  installmentName: "",
  feeTypeId: "",
};

type FeeScheduleProps = {
  feeTypeSearch: SearchOption;
};

export const FeeScheduleForm: React.FC<
  BaseFormProps<FeeScheduleCreate> & FeeScheduleProps
> = ({ formId, onSubmit, feeTypeSearch, defaultValues }) => {
  const form = useZodForm<FeeScheduleCreate>({
    schema: FeeScheduleCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire Échéance de versement"
      >
        <FormField
          control={form.control}
          name="feeTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                Type de Frais Concerné
              </FormLabel>
              <FormControl>
                <ComboboxSearch
                  onChange={field.onChange}
                  value={field.value}
                  options={feeTypeSearch.options}
                  onSearchChange={feeTypeSearch.setSearchQuery}
                  isLoading={feeTypeSearch.isSearching}
                  search={feeTypeSearch.searchQuery}
                  searchPlaceholder="Rechercher un type de frais..."
                  placeholder="Sélectionner le type de frais parent..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="installmentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                Nom de la Tranche / Échéance
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Acompte Inscription, 1er Trimestre, Tranche Unique"
                />
              </FormControl>
              <FormDescription>
                Le nom du versement attendu de l'élève (affiché sur les reçus).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

FeeScheduleForm.displayName = "FeeScheduleForm";
