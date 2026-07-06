import React from "react";
import {
  FeeTypeCreate,
  FeeTypeCreateSchema,
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

const DEFAULT_VALUES: Partial<FeeTypeCreate> = {
  name: "",
  walletId: "",
  yearId: "",
  schoolId: "",
};

type FeeTypeProps = {
  walletSearch: SearchOption;
};

export const FeeTypeForm: React.FC<
  BaseFormProps<FeeTypeCreate> & FeeTypeProps
> = ({ formId, onSubmit, walletSearch, defaultValues }) => {
  const form = useZodForm<FeeTypeCreate>({
    schema: FeeTypeCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire Type de Frais"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                Libellé du Type de Frais
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Minerval, Frais d'Inscription, Transports"
                />
              </FormControl>
              <FormDescription>
                Le nom général désignant cette catégorie de frais scolaires.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="walletId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                Portefeuille / Caisse de Destination
              </FormLabel>
              <FormControl>
                <ComboboxSearch
                  onChange={field.onChange}
                  value={field.value}
                  options={walletSearch.options}
                  onSearchChange={walletSearch.setSearchQuery}
                  isLoading={walletSearch.isSearching}
                  search={walletSearch.searchQuery}
                  searchPlaceholder="Rechercher une caisse..."
                  placeholder="Sélectionner le portefeuille de destination..."
                />
              </FormControl>
              <FormDescription>
                Les encaissements liés à ce frais impacteront le solde de cette
                caisse.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

FeeTypeForm.displayName = "FeeTypeForm";
