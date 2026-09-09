import React from "react";
import {
  MarkStudentsAsProDeo,
  MarkStudentsAsProDeoSchema,
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

import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";
import { MultiSelect } from "@/renderer/components/inputs/multiple-select";
import { groupFeeAssignmentsByTypeName } from "@/renderer/libs/queries/finances/utils";

const DEFAULT_PRO_DEO_VALUES: Partial<MarkStudentsAsProDeo> = {
  enrollmentIds: [],
  assignmentIds: [],
  schoolId: "",
};

type MarkStudentsAsProDeoFormProps = {
  enssignmentsOptions: unknown[];
};
/**
 * Form component to mark selected students as Pro Deo (granted exemption).
 * @param props - Base form props for Pro Deo schema payload.
 * @returns Renders the Pro Deo confirmation form.
 */
export const MarkStudentsAsProDeoForm: React.FC<
  MarkStudentsAsProDeoFormProps &
    BaseFormProps<Partial<MarkStudentsAsProDeo>, MarkStudentsAsProDeo>
> = ({ formId, onSubmit, defaultValues, enssignmentsOptions = [] }) => {
  const form = useZodForm<MarkStudentsAsProDeo>({
    schema: MarkStudentsAsProDeoSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_PRO_DEO_VALUES),
    onSubmit,
  });

  const selectedEnrollmentsCount = form.watch("enrollmentIds")?.length || 0;
  const selectedAssignmentsCount = form.watch("assignmentIds")?.length || 0;

  const options = groupFeeAssignmentsByTypeName(enssignmentsOptions);
  console.log(options);
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
        <MultiSelect name="" groups={options} />
      </form>
    </Form>
  );
};

MarkStudentsAsProDeoForm.displayName = "MarkStudentsAsProDeoForm";
