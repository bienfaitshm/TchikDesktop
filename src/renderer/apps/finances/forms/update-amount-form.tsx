import React from "react";
import {
  MarkStudentsAsProDeo,
  MarkStudentsAsProDeoSchema,
  UpdateAmountByAssignments,
  UpdateAmountByAssignmentsSchema,
  UpdateAmountByClassrooms,
  UpdateAmountByClassroomsSchema,
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

const DEFAULT_ASSIGNMENT_VALUES: Partial<UpdateAmountByAssignments> = {
  currency: CURRENCY_ENUM.CDF,
  assignmentIds: [],
  newTotalAmount: 0,
  scheduleIds: [],
  schoolId: "",
};

const DEFAULT_CLASSROOM_VALUES: Partial<UpdateAmountByClassrooms> = {
  currency: CURRENCY_ENUM.CDF,
  classroomIds: [],
  newTotalAmount: 0,
  scheduleIds: [],
  schoolId: "",
};

const DEFAULT_PRO_DEO_VALUES: Partial<MarkStudentsAsProDeo> = {
  enrollmentIds: [],
  assignmentIds: [],
  schoolId: "",
};

export type SharedAmountFormProps = {
  currencyOptions: { label: string; value: string }[];
  previousAmount?: number;
  previousCurrency?: string;
};

/**
 * Shared form fields component for currency and new total amount input.
 * @param control - React Hook Form control object.
 * @param currencyOptions - List of selectable currency options.
 * @param previousAmount - Optional previous amount to show as reference in description.
 * @returns Renders the form fields for currency and total amount.
 */
function AmountFields({
  control,
  currencyOptions,
  previousAmount,
}: {
  control: any;
  currencyOptions: { label: string; value: string }[];
  previousAmount?: number;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Devise</FormLabel>
            <FormControl>
              <SelectInput options={currencyOptions} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="newTotalAmount"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nouveau montant total</FormLabel>
            <FormControl>
              <Input
                type="number"
                min={0}
                step="any"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                placeholder="0"
              />
            </FormControl>
            <FormDescription>
              {previousAmount !== undefined
                ? `Ancien montant : ${previousAmount}`
                : "Saisissez le nouveau montant applicable."}
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

/**
 * Form component to update financial amounts by assignment IDs.
 * @param props - Base form props combined with shared amount options.
 * @returns Renders the assignment amount update form.
 */
export const UpdateAmountByAssignmentForm: React.FC<
  BaseFormProps<Partial<UpdateAmountByAssignments>, UpdateAmountByAssignments> &
    SharedAmountFormProps
> = ({
  formId,
  onSubmit,
  currencyOptions = [],
  defaultValues,
  previousAmount,
}) => {
  const form = useZodForm<UpdateAmountByAssignments>({
    schema: UpdateAmountByAssignmentsSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_ASSIGNMENT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire de modification de montant par affectation"
      >
        <AmountFields
          control={form.control}
          currencyOptions={currencyOptions}
          previousAmount={previousAmount}
        />
        <FormErrorView form={form} />
      </form>
    </Form>
  );
};

UpdateAmountByAssignmentForm.displayName = "UpdateAmountByAssignmentForm";

/**
 * Form component to update financial amounts by classroom IDs.
 * @param props - Base form props combined with shared amount options.
 * @returns Renders the classroom amount update form.
 */
export const UpdateAmountByClassroomForm: React.FC<
  BaseFormProps<Partial<UpdateAmountByClassrooms>, UpdateAmountByClassrooms> &
    SharedAmountFormProps
> = ({
  formId,
  onSubmit,
  currencyOptions = [],
  defaultValues,
  previousAmount,
}) => {
  const form = useZodForm<UpdateAmountByClassrooms>({
    schema: UpdateAmountByClassroomsSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_CLASSROOM_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire de modification de montant par classe"
      >
        <AmountFields
          control={form.control}
          currencyOptions={currencyOptions}
          previousAmount={previousAmount}
        />
        <FormErrorView form={form} />
      </form>
    </Form>
  );
};

UpdateAmountByClassroomForm.displayName = "UpdateAmountByClassroomForm";

/**
 * Form component to mark selected students as Pro Deo (granted exemption).
 * @param props - Base form props for Pro Deo schema payload.
 * @returns Renders the Pro Deo confirmation form.
 */
export const MarkStudentsAsProDeoForm: React.FC<
  BaseFormProps<Partial<MarkStudentsAsProDeo>, MarkStudentsAsProDeo>
> = ({ formId, onSubmit, defaultValues }) => {
  const form = useZodForm<MarkStudentsAsProDeo>({
    schema: MarkStudentsAsProDeoSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_PRO_DEO_VALUES),
    onSubmit,
  });

  const selectedEnrollmentsCount = form.watch("enrollmentIds")?.length || 0;
  const selectedAssignmentsCount = form.watch("assignmentIds")?.length || 0;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire d'attribution du statut Pro Deo"
      >
        <div className="p-4 rounded-md bg-muted/50 border space-y-2">
          <p className="text-sm font-medium">Résumé de l'exonération Pro Deo</p>
          <p className="text-xs text-muted-foreground">
            Élèves (Inscriptions) sélectionnés : {selectedEnrollmentsCount}
          </p>
          <p className="text-xs text-muted-foreground">
            Frais (Affectations) concernés : {selectedAssignmentsCount}
          </p>
        </div>

        <FormErrorView form={form} />
      </form>
    </Form>
  );
};

MarkStudentsAsProDeoForm.displayName = "MarkStudentsAsProDeoForm";
