import { type Control, type FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { getFormFieldName } from "@/renderer/components/form/generic-bulk-form";
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";

export type FeeScheduleFields = {
  installmentName: string;
  feeTypeId: string;
};

export type FeeScheduleBaseFormProps<
  TFieldValues extends FieldValues = FieldValues,
> = {
  feeTypeOptions?: { value: string; label: string }[];
  control: Control<TFieldValues>;
  prefixName?: `items.${number}.value` | string;
};

export const FeeScheduleBaseForm = <
  TFieldValues extends FieldValues = FieldValues,
>({
  feeTypeOptions = [],
  control,
  prefixName,
}: FeeScheduleBaseFormProps<TFieldValues>) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name={getFormFieldName<TFieldValues, keyof FeeScheduleFields>(
          "installmentName",
          prefixName,
        )}
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
      <FormField
        control={control}
        name={getFormFieldName<TFieldValues, keyof FeeScheduleFields>(
          "feeTypeId",
          prefixName,
        )}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold">
              Type de Frais Concerné
            </FormLabel>
            <FormControl>
              <ComboboxSearch
                onChange={field.onChange}
                value={field.value}
                options={feeTypeOptions}
                searchPlaceholder="Rechercher un type de frais..."
                placeholder="Sélectionner le type de frais parent..."
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

FeeScheduleBaseForm.displayName = "FeeScheduleBaseForm";
