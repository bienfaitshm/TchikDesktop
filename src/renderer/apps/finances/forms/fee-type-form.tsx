import React from "react";
import {
  type FeeTypeCreate,
  type FeeTypeBulkCreate,
  FeeTypeCreateSchema,
} from "@/packages/@core/data-access/schema-validations";
import { Form } from "@/renderer/components/ui/form";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";

import { FeeTypeBaseForm } from "./base";
import { GenericBulkForm } from "@/renderer/components/form/generic-bulk-form";

const DEFAULT_VALUES = {
  name: "",
  walletId: "",
  yearId: "",
  schoolId: "",
} satisfies FeeTypeCreate;

interface FeeTypeProps {
  walletsOptions?: { value: string; label: string }[];
}

/**
 * Formulaire de création unitaire
 */
export const FeeTypeForm: React.FC<
  BaseFormProps<FeeTypeCreate, FeeTypeCreate> & FeeTypeProps
> = ({ formId, onSubmit, walletsOptions, defaultValues }) => {
  const form = useZodForm<FeeTypeCreate>({
    schema: FeeTypeCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire Type de Frais"
      >
        <FeeTypeBaseForm
          control={form.control}
          walletsOptions={walletsOptions}
        />
      </form>
    </Form>
  );
};

FeeTypeForm.displayName = "FeeTypeForm";

/**
 * Formulaire de création en masse
 */
export const FeeTypeBulkForm: React.FC<
  BaseFormProps<FeeTypeCreate, FeeTypeBulkCreate> & FeeTypeProps
> = ({ formId, onSubmit, walletsOptions, defaultValues }) => {
  console.log("Default", defaultValues, walletsOptions);
  return (
    <GenericBulkForm
      formId={formId}
      itemSchema={FeeTypeCreateSchema}
      itemDefaultValues={mergeDefaultValues(defaultValues, DEFAULT_VALUES)}
      onSubmit={onSubmit}
      addButtonLabel="Ajouter un autre type de frais"
      renderFields={({ namePrefix, control }) => (
        <FeeTypeBaseForm
          control={control}
          prefixName={namePrefix}
          walletsOptions={walletsOptions}
        />
      )}
    />
  );
};

FeeTypeBulkForm.displayName = "FeeTypeBulkForm";
