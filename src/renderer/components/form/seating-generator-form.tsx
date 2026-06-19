import { useId } from "react";
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
  seatingGeneratorSchema,
  type SeatingGenerator,
} from "@/packages/@core/data-access/schema-validations";
import { MultiSelect } from "@/renderer/components/form/fields/multi-select-input";
import { Input } from "@/renderer/components/ui/input";
import {
  type BaseFormProps,
  useZodForm,
  mergeDefaultValues,
} from "@/renderer/libs/forms";
import { cn } from "@/renderer/utils";

export type SelectOption = {
  label: string;
  value: string;
};

interface SeatingGeneratorFormProps extends BaseFormProps<SeatingGenerator> {
  className?: string;
  localRoomOptions?: SelectOption[];
  classRoomOptions?: SelectOption[];
}

const DEFAULT_VALUES: SeatingGenerator = {
  classRoomIds: [],
  localRoomIds: [],
  confortRatio: 70,
};

export const SeatingGeneratorForm = ({
  formId,
  onSubmit,
  defaultValues,
  className,
  classRoomOptions = [],
  localRoomOptions = [],
}: SeatingGeneratorFormProps) => {
  const form = useZodForm<SeatingGenerator>({
    schema: seatingGeneratorSchema,
    defaultValues: mergeDefaultValues(defaultValues, DEFAULT_VALUES),
    onSubmit,
  });

  const { isSubmitting } = form.formState;

  const classDescriptionId = useId();
  const localDescriptionId = useId();
  const ratioDescriptionId = useId();

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className={cn("space-y-8", className)}
        aria-label="Formulaire de configuration du plan de placement"
      >
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="confortRatio"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between mt-1">
                  <FormLabel className="text-sm font-bold">
                    Taux de remplissage des salles
                  </FormLabel>
                  <span className="text-xs font-mono font-medium text-secondary-foreground bg-primary px-2 py-0.5 rounded">
                    {field.value}%
                  </span>
                </div>

                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={100}
                    step={5}
                    placeholder="Ex: 80"
                    disabled={isSubmitting}
                    aria-describedby={ratioDescriptionId}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className="h-9 text-xs placeholder:text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </FormControl>

                <FormDescription id={ratioDescriptionId}>
                  Définit la densité d'élèves par salle. Un taux plus bas laisse
                  plus d'espace entre les sièges.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="classRoomIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold">
                  Classes à placer
                </FormLabel>
                <FormControl>
                  <MultiSelect
                    {...field}
                    options={classRoomOptions}
                    placeholder="Sélectionnez les classes..."
                    disabled={isSubmitting}
                    aria-describedby={classDescriptionId}
                  />
                </FormControl>
                <FormDescription id={classDescriptionId}>
                  Sélectionnez les classes qui participent à la session.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="localRoomIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold">
                  Salles d'examen (Locaux)
                </FormLabel>
                <FormControl>
                  <MultiSelect
                    {...field}
                    options={localRoomOptions}
                    placeholder="Sélectionnez les locaux..."
                    disabled={isSubmitting}
                    aria-describedby={localDescriptionId}
                  />
                </FormControl>
                <FormDescription id={localDescriptionId}>
                  Locaux physiques disponibles pour la répartition.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

SeatingGeneratorForm.displayName = "SeatingGeneratorForm";
