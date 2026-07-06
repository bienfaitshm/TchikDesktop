import React, { useEffect } from "react";
import {
  FeeConfigurationCreate,
  FeeConfigurationCreateSchema,
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
import { SelectInput } from "@/renderer/components/form/fields/select-input";
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";
import { SearchOption } from "@/renderer/libs/queries/base";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";

const DEFAULT_VALUES: Partial<FeeConfigurationCreate> = {
  name: "",
  totalAmount: 0,
  currency: "CDF",
  section: null,
  optionId: null,
  classroomId: null,
  feeTypeId: "",
};

type FeeConfigProps = {
  currencyOptions: { label: string; value: string }[];
  sectionOptions: { label: string; value: string }[];
  feeTypeSearch: SearchOption;
  optionSearch: SearchOption;
  classroomSearch: SearchOption;
};

export const FeeConfigurationForm: React.FC<
  BaseFormProps<FeeConfigurationCreate> & FeeConfigProps
> = ({
  formId,
  onSubmit,
  currencyOptions = [],
  sectionOptions = [],
  feeTypeSearch,
  optionSearch,
  classroomSearch,
  defaultValues,
}) => {
  const form = useZodForm<FeeConfigurationCreate>({
    schema: FeeConfigurationCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  const section = form.watch("section");
  const optionId = form.watch("optionId");
  const classroomId = form.watch("classroomId");

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire de Configuration des Frais"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Nom de la configuration
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Ex: Minerval de base - Éléments du Primaire"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feeTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Type de Frais Associé
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
                    placeholder="Sélectionner le type de frais..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/30">
          <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Montant Total (en centimes)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="Ex: 15000 pour 150$"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Devise du Frais</FormLabel>
                <FormControl>
                  <SelectInput options={currencyOptions} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SECTION EXCLUSIVITÉ DES CIBLES */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            Cible d'application (Une seule obligatoire)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Par Section globale
                  </FormLabel>
                  <FormControl>
                    <SelectInput
                      options={[
                        { label: "Aucune (Null)", value: "none" },
                        ...sectionOptions,
                      ]}
                      value={field.value ?? "none"}
                      onChange={(val) => {
                        field.onChange(val === "none" ? null : val);
                        if (val !== "none") {
                          form.setValue("optionId", null);
                          form.setValue("classroomId", null);
                        }
                      }}
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
                    Par Option / Filière
                  </FormLabel>
                  <FormControl>
                    <ComboboxSearch
                      onChange={(val) => {
                        const actualVal = val === "none" ? null : val;
                        field.onChange(actualVal);
                        if (actualVal) {
                          form.setValue("section", null);
                          form.setValue("classroomId", null);
                        }
                      }}
                      value={field.value ?? "none"}
                      options={optionSearch.options}
                      onSearchChange={optionSearch.setSearchQuery}
                      isLoading={optionSearch.isSearching}
                      search={optionSearch.searchQuery}
                      searchPlaceholder="Rechercher une option..."
                      placeholder="Choisir une option..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Par Classe Spécifique
                  </FormLabel>
                  <FormControl>
                    <ComboboxSearch
                      onChange={(val) => {
                        const actualVal = val === "none" ? null : val;
                        field.onChange(actualVal);
                        if (actualVal) {
                          form.setValue("section", null);
                          form.setValue("optionId", null);
                        }
                      }}
                      value={field.value ?? "none"}
                      options={classroomSearch.options}
                      onSearchChange={classroomSearch.setSearchQuery}
                      isLoading={classroomSearch.isSearching}
                      search={classroomSearch.searchQuery}
                      searchPlaceholder="Rechercher une classe..."
                      placeholder="Choisir une classe..."
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

FeeConfigurationForm.displayName = "FeeConfigurationForm";
