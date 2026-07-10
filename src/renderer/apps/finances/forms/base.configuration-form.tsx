import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { SelectInput } from "@/renderer/components/form/fields/select-input";
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";
import { SearchOption } from "@/renderer/libs/queries/base";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { getFormFieldName } from "@/renderer/components/form/generic-bulk-form";
import { useCallback } from "react";
import type { FeeConfiguration } from "@/packages/@core/data-access/schema-validations";

export type FeeConfigFields = FeeConfiguration;

type FeeConfigBaseFromProps<
  TFieldValues extends FieldValues = FeeConfigFields,
> = {
  currencyOptions: { label: string; value: string }[];
  sectionOptions: { label: string; value: string }[];
  feeTypeSearch: SearchOption;
  optionSearch: SearchOption;
  classroomSearch: SearchOption;
  form: UseFormReturn<TFieldValues>;
  prefixName?: `items.${number}.value` | string;
};

export const FeeConfigurationBaseForm = <
  TFieldValues extends FieldValues = FieldValues,
>({
  form,
  currencyOptions = [],
  sectionOptions = [],
  feeTypeSearch,
  optionSearch,
  classroomSearch,
  prefixName,
}: FeeConfigBaseFromProps<TFieldValues>) => {
  const getName = useCallback(
    (name: keyof FeeConfigFields) =>
      getFormFieldName<TFieldValues, keyof FeeConfigFields>(
        name,
        prefixName,
      ) as Path<TFieldValues>,
    [prefixName],
  );

  const handleExclusiveSelection = (
    selectedField: "section" | "optionId" | "classroomId",
    value: string | null,
    onChangeCallback: (val: string | null) => void,
  ) => {
    onChangeCallback(value);

    if (value) {
      const resetOptions = { shouldValidate: true, shouldDirty: true };

      if (selectedField !== "section")
        form.setValue(getName("section"), null as any, resetOptions);
      if (selectedField !== "optionId")
        form.setValue(getName("optionId"), null as any, resetOptions);
      if (selectedField !== "classroomId")
        form.setValue(getName("classroomId"), null as any, resetOptions);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name={getName("name")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom de la configuration</FormLabel>
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
          name={getName("feeTypeId")}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type de Frais Associé</FormLabel>
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
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">Les Frais Appliqués</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name={getName("totalAmount")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Montant Total (en centimes)</FormLabel>
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
            name={getName("currency")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Devise du Frais</FormLabel>
                <FormControl>
                  <SelectInput options={currencyOptions} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* SECTION EXCLUSIVITÉ DES CIBLES */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm text-muted-foreground">
            Cible d'application (Une seule obligatoire)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name={getName("section")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Par Section globale</FormLabel>
                <FormControl>
                  <SelectInput
                    options={[
                      { label: "Aucune", value: "none" },
                      ...sectionOptions,
                    ]}
                    value={field.value ?? "none"}
                    onChange={(val) => {
                      const actualVal = val === "none" ? null : val;
                      handleExclusiveSelection(
                        "section",
                        actualVal,
                        field.onChange,
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={getName("optionId")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Par Option / Filière</FormLabel>
                <FormControl>
                  <ComboboxSearch
                    value={field.value ?? "none"}
                    onChange={(val) => {
                      const actualVal = val === "none" ? null : val;
                      handleExclusiveSelection(
                        "optionId",
                        actualVal,
                        field.onChange,
                      );
                    }}
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
            name={getName("classroomId")}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Par Classe Spécifique</FormLabel>
                <FormControl>
                  <ComboboxSearch
                    value={field.value ?? "none"}
                    onChange={(val) => {
                      const actualVal = val === "none" ? null : val;
                      handleExclusiveSelection(
                        "classroomId",
                        actualVal,
                        field.onChange,
                      );
                    }}
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
        <div>
          <div className="text-xs text-muted-foreground space-y-1 list-disc pl-4 bg-muted/40 p-6 rounded-md border border-border/50">
            <p>
              <strong className="text-foreground">Section :</strong> Applique le
              frais à tous les élèves de la section entière (ex :{" "}
              <em>Primaire</em>).
            </p>
            <p>
              <strong className="text-foreground">Option / Filière :</strong>{" "}
              Cible uniquement une spécialité (ex :{" "}
              <em>Humanités Scientifiques</em>).
            </p>
            <p>
              <strong className="text-foreground">Classe :</strong> Restreint le
              frais à un groupe précis (ex : <em>1ère Année A</em>).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

FeeConfigurationBaseForm.displayName = "FeeConfigurationBaseForm";
