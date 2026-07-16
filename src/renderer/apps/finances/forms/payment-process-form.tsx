import React from "react";
import {
  type ProcessPaymentPayload,
  ProcessPaymentSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  Form,
  FormControl,
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
import {
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";

const DEFAULT_VALUES: Partial<ProcessPaymentPayload> = {
  amountReceived: 0,
  assignmentId: "",
  currencyReceived: CURRENCY_ENUM.CDF,
  paymentMethod: PAYMENT_METHOD_ENUM.CASH,
  schoolId: "",
  yearId: "",
  transactionReference: "",
};

/**
 * Ajoute une règle : le montant reçu ne doit pas dépasser le total attendu.
 * @param schema - le schéma de base
 * @param maxAmount - montant maximum autorisé (en centimes). Si undefined, pas de limite.
 * @returns le schéma enrichi de la règle de dépassement
 */
export const schemaWithMaxAmount = (
  schema: typeof ProcessPaymentSchema,
  maxAmount?: number,
) => {
  if (maxAmount === undefined) return schema;

  return schema.refine(
    (data) => {
      const { amountReceived } = data;
      if (typeof amountReceived !== "number" || isNaN(amountReceived)) {
        return false;
      }
      return amountReceived <= maxAmount;
    },
    {
      message: `Le montant reçu ne peut pas dépasser la somme a payer, la somme est de ${maxAmount} que l'eleve doit payer.`,
      path: ["amountReceived"],
    },
  );
};

type PaymentProcessFormProps = {
  currencyOptions: { label: string; value: string }[];
  paymentMethodOptions: { label: string; value: string }[];
  totalAmount?: number;
};

export const PaymentProcessForm: React.FC<
  BaseFormProps<Partial<ProcessPaymentPayload>, ProcessPaymentPayload> &
    PaymentProcessFormProps
> = ({
  formId,
  onSubmit,
  totalAmount,
  currencyOptions = [],
  paymentMethodOptions = [],
  defaultValues,
}) => {
  const form = useZodForm<ProcessPaymentPayload>({
    schema: schemaWithMaxAmount(ProcessPaymentSchema, totalAmount),
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  const currentCurrency = form.watch("currencyReceived");
  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-4"
        aria-label="Formulaire d'enregistrement de paiement"
      >
        {/* Ligne 1 : Montant & Devise (Idéal pour la gestion multi-devise Big Tech) */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="amountReceived"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-muted-foreground">
                    Montant reçu
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-9 font-mono pr-14 text-sm focus-visible:ring-1 focus-visible:ring-ring"
                        {...field}
                      />
                      <span className="absolute right-3 font-mono text-xs font-semibold text-muted-foreground/70 select-none">
                        {currentCurrency}
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              control={form.control}
              name="currencyReceived"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium text-muted-foreground">
                    Devise
                  </FormLabel>
                  <SelectInput
                    {...field}
                    placeholder="Devise"
                    options={currencyOptions}
                    className="h-9"
                  />
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Ligne 2 : Mode de paiement & Référence (Densifié) */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Mode de règlement
                </FormLabel>
                <SelectInput
                  {...field}
                  placeholder="Sélectionner le mode"
                  options={paymentMethodOptions}
                  className="h-9"
                />
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transactionReference"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Référence (Optionnel)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="N° reçu, bordereau..."
                    className="h-9 text-xs focus-visible:ring-1 focus-visible:ring-ring"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

PaymentProcessForm.displayName = "PaymentProcessForm";
