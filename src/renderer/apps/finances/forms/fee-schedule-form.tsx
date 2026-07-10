import React from "react";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";
import {
  type FeeScheduleCreate,
  type FeeScheduleBulkCreate,
  FeeScheduleCreateSchema,
} from "@/packages/@core/data-access/schema-validations";
import { Form } from "@/renderer/components/ui/form";

import { FeeScheduleBaseForm } from "./base";
import { GenericBulkForm } from "@/renderer/components/form/generic-bulk-form";

const DEFAULT_VALUES = {
  feeTypeId: "",
  installmentName: "",
} satisfies FeeScheduleCreate;

interface FeeTypeProps {
  feeTypeOptions?: { value: string; label: string }[];
}

/**
 * Formulaire de création unitaire
 */
export const FeeScheduleForm: React.FC<
  BaseFormProps<FeeScheduleCreate, FeeScheduleCreate> & FeeTypeProps
> = ({ formId, onSubmit, feeTypeOptions, defaultValues }) => {
  const form = useZodForm<FeeScheduleCreate>({
    schema: FeeScheduleCreateSchema,
    defaultValues: mergeDefaultValues<FeeScheduleCreate>(
      defaultValues,
      DEFAULT_VALUES,
    ),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire des échéances"
      >
        <FeeScheduleBaseForm
          control={form.control}
          feeTypeOptions={feeTypeOptions}
        />
        {/* Feedback d'erreur globale */}
        {form.formState.errors.root && (
          <div
            role="alert"
            className="p-3 text-red-600 border rounded-md text-sm font-medium animate-in fade-in zoom-in duration-200"
          >
            {form.formState.errors.root.message}
          </div>
        )}
      </form>
    </Form>
  );
};

FeeScheduleForm.displayName = "FeeScheduleForm";

/**
 * Formulaire de création en masse
 */
export const FeeScheduleBulkForm: React.FC<
  BaseFormProps<FeeScheduleCreate, FeeScheduleBulkCreate> & FeeTypeProps
> = ({ formId, onSubmit, feeTypeOptions, defaultValues }) => {
  return (
    <GenericBulkForm
      formId={formId}
      // 🌟 CORRECTION ICI : On passe le schéma UNITAIRE.
      // GenericBulkForm se charge déjà d'exécuter createBulkCreateSchema(itemSchema)
      itemSchema={FeeScheduleCreateSchema}
      itemDefaultValues={mergeDefaultValues<FeeScheduleCreate>(
        defaultValues,
        DEFAULT_VALUES,
      )}
      onSubmit={onSubmit}
      addButtonLabel="Ajouter une autre échéance"
      renderFields={({ namePrefix, control }) => (
        <FeeScheduleBaseForm
          control={control}
          prefixName={namePrefix}
          feeTypeOptions={feeTypeOptions}
        />
      )}
    />
  );
};

FeeScheduleBulkForm.displayName = "FeeScheduleBulkForm";
