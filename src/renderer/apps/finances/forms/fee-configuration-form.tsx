import React from "react";
import {
  type FeeConfigurationCreate,
  type FeeConfigurationBulkCreate,
  FeeConfigurationCreateSchema,
} from "@/packages/@core/data-access/schema-validations";
import { Form } from "@/renderer/components/ui/form";
import { SearchOption } from "@/renderer/libs/queries/base";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";
import { FeeConfigurationBaseForm } from "./base";
import { GenericBulkForm } from "@/renderer/components/form/generic-bulk-form";

const DEFAULT_VALUES: Partial<FeeConfigurationCreate> = {
  name: "",
  totalAmount: 0,
  currency: "CDF",
  section: null,
  optionId: null,
  classroomId: null,
  feeTypeId: "",
};

export interface FeeConfigProps {
  currencyOptions: { label: string; value: string }[];
  sectionOptions: { label: string; value: string }[];
  feeTypeSearch: SearchOption;
  optionSearch: SearchOption;
  classroomSearch: SearchOption;
}

/**
 * Formulaire de création unitaire pour la Configuration des Frais
 */
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

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire de Configuration des Frais"
      >
        <FeeConfigurationBaseForm
          form={form}
          currencyOptions={currencyOptions}
          sectionOptions={sectionOptions}
          feeTypeSearch={feeTypeSearch}
          optionSearch={optionSearch}
          classroomSearch={classroomSearch}
        />
      </form>
    </Form>
  );
};

FeeConfigurationForm.displayName = "FeeConfigurationForm";

/**
 * Formulaire de création en masse (Bulk) pour la Configuration des Frais
 */
export const FeeConfigurationBulkForm: React.FC<
  BaseFormProps<Partial<FeeConfigurationCreate>, FeeConfigurationBulkCreate> &
    FeeConfigProps
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
  return (
    <GenericBulkForm
      formId={formId}
      itemSchema={FeeConfigurationCreateSchema}
      itemDefaultValues={mergeDefaultValues(defaultValues, DEFAULT_VALUES)}
      onSubmit={onSubmit}
      addButtonLabel="Ajouter une autre configuration"
      renderFields={({ namePrefix, form }) => (
        <FeeConfigurationBaseForm
          form={form}
          prefixName={namePrefix}
          currencyOptions={currencyOptions}
          sectionOptions={sectionOptions}
          feeTypeSearch={feeTypeSearch}
          optionSearch={optionSearch}
          classroomSearch={classroomSearch}
        />
      )}
    />
  );
};

FeeConfigurationBulkForm.displayName = "FeeConfigurationBulkForm";
