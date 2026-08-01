import React from "react";
import {
  WalletCreate,
  WalletCreateSchema,
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
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";
import { CURRENCY_ENUM } from "@/packages/@core/data-access/db/options";
import { FormErrorView } from "@/renderer/components/form/form-error-view";

const DEFAULT_VALUES: Partial<WalletCreate> = {
  name: "",
  currency: CURRENCY_ENUM.CDF,
  currentBalance: 0,
  schoolId: "",
};

type WalletProps = {
  currencyOptions: { label: string; value: string }[];
};

export const WalletForm: React.FC<
  BaseFormProps<Partial<WalletCreate>, WalletCreate> & WalletProps
> = ({ formId, onSubmit, currencyOptions = [], defaultValues }) => {
  const form = useZodForm<WalletCreate>({
    schema: WalletCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire Portefeuille"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du Portefeuille / Caisse</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Caisse Principale, Caisse minerval CDF"
                />
              </FormControl>
              <FormDescription>
                Donnez un nom clair pour identifier où vont les fonds.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Devise Pivot</FormLabel>
                <FormControl>
                  <SelectInput options={currencyOptions} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currentBalance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Solde Initial (en centimes)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="0"
                    disabled={!!defaultValues}
                  />
                </FormControl>
                <FormDescription>
                  Ex: Écrire 1000 pour 10,00 $ ou 10,00 FC.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Feedback d'erreur globale */}
        <FormErrorView form={form} />
      </form>
    </Form>
  );
};

WalletForm.displayName = "WalletForm";
