import React from "react";
import { GenericBulkForm } from "./generic-bulk-form";
import { OptionCreateSchema } from "@/packages/@core/data-access/schema-validations";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { SectionSelect } from "./option-form";
import { Button } from "../ui/button";

const DEFAULT_OPTION_VALUES = {
  optionName: "",
  optionShortName: "",
  section: SECTION_ENUM.SECONDARY,
  schoolId: "",
};

export const BulkOptionView: React.FC = () => {
  const handleBulkSubmit = async (data: any) => {
    console.log("Payload comptable envoyé à l'IPC/API :", data.items);
    // Appel de ton mutation.mutate(data) ici
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <div>
        <h2 className="text-xl font-bold">Création groupée d'options</h2>
        <p className="text-sm text-muted-foreground">
          Configurez et insérez plusieurs filières d'un coup.
        </p>
      </div>

      <GenericBulkForm
        formId="bulk-option-form"
        itemSchema={OptionCreateSchema}
        itemDefaultValues={DEFAULT_OPTION_VALUES}
        onSubmit={handleBulkSubmit}
        addButtonLabel="Ajouter une autre filière"
        renderFields={({ namePrefix, control, disabled }) => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Nom complet */}
            <FormField
              control={control}
              name={`${namePrefix}.optionName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">
                    Nom complet
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled}
                      placeholder="Ex: Commerciale"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Code Abrégé */}
            <FormField
              control={control}
              name={`${namePrefix}.optionShortName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">
                    Code court
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={disabled}
                      placeholder="Ex: COM"
                      className="uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Section */}
            <FormField
              control={control}
              name={`${namePrefix}.section`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold">Niveau</FormLabel>
                  <FormControl>
                    <SectionSelect
                      options={SECTION_OPTIONS}
                      value={field.value}
                      onChangeValue={field.onChange}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      />
      <Button type="submit" form="bulk-option-form">
        Submit
      </Button>
    </div>
  );
};
