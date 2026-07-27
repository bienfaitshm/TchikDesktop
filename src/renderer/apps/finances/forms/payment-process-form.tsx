import React from "react";
import {
  type ProcessPaymentPayload,
  ProcessPaymentSchema,
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
import {
  CURRENCY_ENUM,
  PAYMENT_METHOD_ENUM,
} from "@/packages/@core/data-access/db/options";
import { formatCurrency } from "@/packages/currency";

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
 * Extends the payment validation schema by enforcing that the received amount does not exceed the remaining balance.
 * @param schema - Base payment validation schema.
 * @param totalAmount - Total amount expected for the assignment.
 * @param amountPaid - Amount already paid for the assignment.
 * @returns Refined Zod schema with upper-bound amount validation in French.
 */
export const schemaWithMaxAmount = (
  schema: typeof ProcessPaymentSchema,
  totalAmount?: number,
  amountPaid: number = 0,
) => {
  if (totalAmount === undefined) return schema;

  const remainingBalance = Math.max(0, totalAmount - amountPaid);

  return schema.refine(
    (data) => {
      const amountReceived = Number(data.amountReceived);
      if (isNaN(amountReceived) || amountReceived <= 0) {
        return false;
      }
      return amountReceived <= remainingBalance;
    },

    {
      message: `Le montant reçu ne peut pas dépasser le solde restant dû de ${formatCurrency(remainingBalance)}.`,
      path: ["amountReceived"],
    },
  );
};

export type PaymentProcessFormProps = {
  currencyOptions: { label: string; value: string }[];
  paymentMethodOptions: { label: string; value: string }[];
  totalAmount?: number;
  amountPaid?: number;
};

/**
 * Renders a form for entering and validating student payment details.
 * @param props - Form configuration props including options, balance thresholds, and callbacks.
 * @returns The rendered payment process form.
 */
export const PaymentProcessForm: React.FC<
  BaseFormProps<Partial<ProcessPaymentPayload>, ProcessPaymentPayload> &
    PaymentProcessFormProps
> = ({
  formId,
  onSubmit,
  totalAmount,
  amountPaid = 0,
  currencyOptions = [],
  paymentMethodOptions = [],
  defaultValues,
}) => {
  const form = useZodForm<ProcessPaymentPayload>({
    schema: schemaWithMaxAmount(ProcessPaymentSchema, totalAmount, amountPaid),
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  const currentCurrency = form.watch("currencyReceived");
  const currencyReceived = form.watch("currencyReceived");
  const remainingBalance =
    totalAmount !== undefined
      ? Math.max(0, totalAmount - amountPaid)
      : undefined;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-4"
        aria-label="Formulaire d'enregistrement du paiement"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-1">
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
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 font-mono pr-14 text-sm focus-visible:ring-1 focus-visible:ring-ring"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                      <span className="absolute right-3 font-mono text-xs font-semibold text-muted-foreground/70 select-none">
                        {currentCurrency}
                      </span>
                    </div>
                  </FormControl>
                  {remainingBalance !== undefined && (
                    <FormDescription className="text-[11px] text-muted-foreground">
                      Solde restant à payer :{" "}
                      <span className="font-mono font-medium">
                        {formatCurrency(remainingBalance, currencyReceived)}
                      </span>
                    </FormDescription>
                  )}
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
                    disabled
                    className="h-9 data-[size=default]:h-9 data-[size=sm]:h-8"
                  />
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>
        </div>

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
                  className="h-9 data-[size=default]:h-9 data-[size=sm]:h-8"
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
                    value={field.value ?? ""}
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
