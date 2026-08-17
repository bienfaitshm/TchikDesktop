import React from "react";
import {
  type DailyExchangeRateCreate,
  DailyExchangeRateCreateSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/renderer/components/ui/form";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";
import { Input } from "@/renderer/components/ui/input";
import { CURRENCY_ENUM } from "@/packages/@core/data-access/db/options";

const DEFAULT_VALUES = {
  currencyFrom: CURRENCY_ENUM.USD,
  currencyTo: CURRENCY_ENUM.CDF,
  schoolId: "",
  date: new Date(),
  rate: 0,
} satisfies DailyExchangeRateCreate;

type DailyExchangeSyncFormProps = Record<string, never>;

export const DailyExchangeSyncForm: React.FC<
  BaseFormProps<DailyExchangeRateCreate, DailyExchangeRateCreate> &
    DailyExchangeSyncFormProps
> = ({ defaultValues, onSubmit, formId }) => {
  const form = useZodForm<DailyExchangeRateCreate>({
    schema: DailyExchangeRateCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  const currencyTo = form.watch("currencyTo");

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire de synchronisation du taux de change"
      >
        <FormField
          control={form.control}
          name="rate"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="relative flex-1">
                  <Input
                    {...field}
                    type="number"
                    step="any"
                    onChange={(e) =>
                      field.onChange(e.target.valueAsNumber || 0)
                    }
                    className="w-full bg-background border border-border rounded-lg h-9 px-3 pr-12 text-sm font-mono focus:outline-hidden focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-muted-foreground select-none">
                    {currencyTo}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
