import React from "react";
import { Info } from "lucide-react";
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
import { FeeAssignmentTab } from "../../finances/components/fee-assignment-tabs";

const DEFAULT_PRO_DEO_VALUES: Partial<MarkStudentsAsProDeo> = {
  enrollmentIds: [],
  assignmentIds: [],
  schoolId: "",
};

type MarkStudentsAsProDeoFormProps = {
  enrollmentId: string;
  assignmentsOptions?: unknown[];
  /** @deprecated Utilisez `assignmentsOptions` à la place */
  enssignmentsOptions?: unknown[];
};

/**
 * Composant de formulaire pour attribuer le statut Pro Deo (exonération de frais).
 */
export const MarkStudentsAsProDeoForm: React.FC<
  MarkStudentsAsProDeoFormProps &
    BaseFormProps<Partial<MarkStudentsAsProDeo>, MarkStudentsAsProDeo>
> = ({
  formId,
  onSubmit,
  defaultValues,
  enrollmentId,
  assignmentsOptions,
  enssignmentsOptions = [],
}) => {
  const form = useZodForm<MarkStudentsAsProDeo>({
    schema: MarkStudentsAsProDeoSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_PRO_DEO_VALUES),
    onSubmit,
  });

  // Support de l'ancienne prop si 'assignmentsOptions' n'est pas transmis
  const rawAssignments = assignmentsOptions ?? enssignmentsOptions;
  const options = groupFeeAssignmentsByTypeName(rawAssignments);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-5"
        aria-label="Formulaire d'attribution du statut Pro Deo"
      >
        {/* Bannière d'information synthétique */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
          <Info
            size={16}
            className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5"
          />
          <div className="space-y-0.5">
            <p className="font-semibold">Exonération Pro Deo</p>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Les frais sélectionnés ci-dessous seront marqués comme exonérés
              pour cet élève.
            </p>
          </div>
        </div>

        {/* Champ de sélection des frais */}
        <FormField
          control={form.control}
          name="assignmentIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-semibold">
                Frais à exempter
              </FormLabel>
              <FormControl>
                <MultiSelect
                  {...field}
                  groups={options}
                  placeholder="Sélectionnez un ou plusieurs frais..."
                />
              </FormControl>
              <FormDescription className="text-[11px]">
                Choisissez les tranches ou frais pour lesquels l&apos;élève
                bénéficiera d&apos;une dispense Pro Deo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Aperçu financier contextuel */}
        <div className="pt-3 border-t border-border/60 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Aperçu de la situation financière
          </h4>
          <FeeAssignmentTab enrollmentId={enrollmentId} />
        </div>
      </form>
    </Form>
  );
};

MarkStudentsAsProDeoForm.displayName = "MarkStudentsAsProDeoForm";
