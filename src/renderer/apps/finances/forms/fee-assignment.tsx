import React from "react";
import {
  FeeAssignmentCreate,
  FeeAssignmentCreateSchema,
} from "@/packages/@core/data-access/schema-validations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { SelectInput } from "@/renderer/components/form/fields/select-input";
import { ComboboxSearch } from "@/renderer/components/form/fields/generic-search-combo-box";
import { SearchOption } from "@/renderer/libs/queries/base";
import {
  type BaseFormProps,
  mergeDefaultValues,
  useZodForm,
} from "@/renderer/libs/forms";

const DEFAULT_VALUES: Partial<FeeAssignmentCreate> = {
  enrollmentId: "",
  feeConfigId: "",
  scheduleId: "",
  amountPaid: 0,
  status: "UNPAID",
};

type FeeAssignmentProps = {
  statusOptions: { label: string; value: string }[];
  enrollmentSearch: SearchOption;
  feeConfigSearch: SearchOption;
  scheduleSearch: SearchOption;
};

export const FeeAssignmentForm: React.FC<
  BaseFormProps<FeeAssignmentCreate> & FeeAssignmentProps
> = ({
  formId,
  onSubmit,
  statusOptions = [],
  enrollmentSearch,
  feeConfigSearch,
  scheduleSearch,
  defaultValues,
}) => {
  const form = useZodForm<FeeAssignmentCreate>({
    schema: FeeAssignmentCreateSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className="space-y-6"
        aria-label="Formulaire d'Attribution de dette"
      >
        <FormField
          control={form.control}
          name="enrollmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">
                Élève concerné (Inscription)
              </FormLabel>
              <FormControl>
                <ComboboxSearch
                  onChange={field.onChange}
                  value={field.value}
                  options={enrollmentSearch.options}
                  onSearchChange={enrollmentSearch.setSearchQuery}
                  isLoading={enrollmentSearch.isSearching}
                  search={enrollmentSearch.searchQuery}
                  searchPlaceholder="Rechercher un élève inscrit..."
                  placeholder="Sélectionner l'élève..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="feeConfigId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Grille Tarifaire (Configuration)
                </FormLabel>
                <FormControl>
                  <ComboboxSearch
                    onChange={field.onChange}
                    value={field.value}
                    options={feeConfigSearch.options}
                    onSearchChange={feeConfigSearch.setSearchQuery}
                    isLoading={feeConfigSearch.isSearching}
                    search={feeConfigSearch.searchQuery}
                    searchPlaceholder="Rechercher une configuration..."
                    placeholder="Sélectionner la structure de frais..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Échéance de Versement liée
                </FormLabel>
                <FormControl>
                  <ComboboxSearch
                    onChange={field.onChange}
                    value={field.value}
                    options={scheduleSearch.options}
                    onSearchChange={scheduleSearch.setSearchQuery}
                    isLoading={scheduleSearch.isSearching}
                    search={scheduleSearch.searchQuery}
                    searchPlaceholder="Rechercher une tranche..."
                    placeholder="Sélectionner la tranche temporelle..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {defaultValues && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">
                  Statut du Versement
                </FormLabel>
                <FormControl>
                  <SelectInput options={statusOptions} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </form>
    </Form>
  );
};

FeeAssignmentForm.displayName = "FeeAssignmentForm";
