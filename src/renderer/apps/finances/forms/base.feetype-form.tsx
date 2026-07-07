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
import { SelectInput } from "@/renderer/components/form/fields/select-input";
import { getFormFieldName } from "@/renderer/components/form/generic-bulk-form";

export type FeeTypeFields = {
  name: string;
  walletId: string;
};

export type FeeTypeBaseFormProps<
  TFieldValues extends FieldValues = FieldValues,
> = {
  walletsOptions?: { value: string; label: string }[];
  control: Control<TFieldValues>;
  prefixName?: `items.${number}.value` | string;
};

export const FeeTypeBaseForm = <
  TFieldValues extends FieldValues = FieldValues,
>({
  walletsOptions = [],
  control,
  prefixName,
}: FeeTypeBaseFormProps<TFieldValues>) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      <FormField
        control={control}
        name={getFormFieldName<TFieldValues, keyof FeeTypeFields>(
          "name",
          prefixName,
        )}
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
        control={control}
        name={getFormFieldName<TFieldValues, keyof FeeTypeFields>(
          "walletId",
          prefixName,
        )}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold">
              Portefeuille / Caisse de Destination
            </FormLabel>
            <FormControl>
              <SelectInput
                {...field}
                options={walletsOptions}
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
    </div>
  );
};

FeeTypeBaseForm.displayName = "FeeTypeBaseForm";
