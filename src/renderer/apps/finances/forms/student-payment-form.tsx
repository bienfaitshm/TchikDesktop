import React from "react";
import {
  StudentPaymentCreate,
  StudentPaymentCreateSchema,
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

const DEFAULT_VALUES: Partial<StudentPaymentCreate> = {
  assignmentId: "",
  amountReceived: 0,
  currencyReceived: "USD",
  appliedExchangeRate: 2850000000,
  amountConverted: 0,
  paymentMethod: "CASH",
  transactionReference: "",
};

type StudentPaymentProps = {
  currencyOptions: { label: string; value: string }[];
  paymentMethodOptions: { label: string; value: string }[];
  assignmentSearch: SearchOption; // Dette rattachée
};

export const StudentPaymentForm: React.FC<
  BaseFormProps<StudentPaymentCreate> & StudentPaymentProps
> = ({
  formId,
  onSubmit,
  currencyOptions = [],
  paymentMethodOptions = [],
  assignmentSearch,
  defaultValues,
}) => {
  const form = useZodForm<StudentPaymentCreate>({
    schema: StudentPaymentCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  // Calcul automatique du montant converti en arrière-plan à des fins d'affichage indicatif
  const amountReceived = form.watch("amountReceived");
  const appliedExchangeRate = form.watch("appliedExchangeRate");

  React.useEffect(() => {
    if (amountReceived && appliedExchangeRate) {
      // Formule de conversion comptable (Exemple simplifié : adapter selon devise pivot)
      const numericRate = appliedExchangeRate / 1000000;
      const converted = Math.round(amountReceived * numericRate);
      form.setValue("amountConverted", converted);
    }
  }, [amountReceived, appliedExchangeRate, form]);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire de Caisse (Encaissement)"
      >
        <FormField
          control={form.control}
          name="assignmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                Sélection de la Ligne de Dette de l'Élève
              </FormLabel>
              <FormControl>
                <ComboboxSearch
                  onChange={field.onChange}
                  value={field.value}
                  options={assignmentSearch.options}
                  onSearchChange={assignmentSearch.setSearchQuery}
                  isLoading={assignmentSearch.isSearching}
                  search={assignmentSearch.searchQuery}
                  searchPlaceholder="Rechercher par nom de l'élève ou frais..."
                  placeholder="Sélectionner la ligne d'échéance exigible..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border rounded-xl bg-accent/20">
          <FormField
            control={form.control}
            name="amountReceived"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Montant Reçu Physique
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="Ex: 5000 pour 50$"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currencyReceived"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">Devise Physique</FormLabel>
                <FormControl>
                  <SelectInput options={currencyOptions} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="appliedExchangeRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Taux Appliqué (x 1 000 000)
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="Ex: 2850000000 pour 2850"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Moyen de Règlement
                </FormLabel>
                <FormControl>
                  <SelectInput options={paymentMethodOptions} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transactionReference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Référence Borderau / ID Mobile Money
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Ex: MPESA-98765-XYZ, FT23190..."
                  />
                </FormControl>
                <FormDescription>
                  Laisser vide si paiement en espèces (CASH).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Champ masqué ou en lecture seule poussé en DB pour l'écriture de la valeur convertie */}
        <FormField
          control={form.control}
          name="amountConverted"
          render={({ field }) => <input type="hidden" {...field} />}
        />
      </form>
    </Form>
  );
};

StudentPaymentForm.displayName = "StudentPaymentForm";
