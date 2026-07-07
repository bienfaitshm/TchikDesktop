import React from "react";
import {
  type Control,
  useFieldArray,
  FieldPath,
  FieldValues,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Form } from "@/renderer/components/ui/form";
import { Button } from "@/renderer/components/ui/button";
import { type BaseFormProps, useZodForm } from "@/renderer/libs/forms";
import { createBulkCreateSchema } from "@/packages/@core/data-access/schema-validations";

/**
 * Structure globale du formulaire Bulk inferrée proprement.
 */
export type InferBulkCreate<T extends z.ZodTypeAny> = {
  items: {
    key: string;
    value: z.infer<T>;
  }[];
};

/**
 * Props transmises à la fonction de rendu d'une ligne.
 * On passe le contrôle racine typé et le préfixe strict pour garantir la fluidité de RHF.
 */
export interface BulkFormItemRenderProps<TItemSchema extends z.ZodTypeAny> {
  index: number;
  namePrefix: `items.${number}.value`;
  control: Control<InferBulkCreate<TItemSchema>>;
  disabled?: boolean;
}

interface GenericBulkFormProps<TItemSchema extends z.ZodTypeAny> {
  itemSchema: TItemSchema;
  itemDefaultValues: z.infer<TItemSchema>;
  renderFields: (
    props: BulkFormItemRenderProps<TItemSchema>,
  ) => React.ReactNode;
  addButtonLabel?: string;
}

export function GenericBulkForm<TItemSchema extends z.ZodTypeAny>({
  formId,
  itemSchema,
  itemDefaultValues,
  onSubmit,
  defaultValues,
  renderFields,
  addButtonLabel = "Ajouter un élément",
}: BaseFormProps<InferBulkCreate<TItemSchema>> &
  GenericBulkFormProps<TItemSchema>) {
  // 1. Mémorisation du schéma global
  const bulkSchema = React.useMemo(
    () => createBulkCreateSchema(itemSchema),
    [itemSchema],
  );

  // 2. Sauvegarde des valeurs par défaut dans un Ref (Pattern useLatest)
  // Évite de casser la mémoisation si l'utilisateur passe un objet inline : itemDefaultValues={{}}
  const latestItemDefaultValues = React.useRef(itemDefaultValues);
  React.useEffect(() => {
    latestItemDefaultValues.current = itemDefaultValues;
  }, [itemDefaultValues]);

  // Générateur d'item unitaire parfaitement stable
  const getInitialItemValue = React.useCallback(
    (): InferBulkCreate<TItemSchema>["items"][0] => ({
      key: crypto.randomUUID(),
      value: latestItemDefaultValues.current,
    }),
    [],
  );

  // 3. Initialisation du formulaire (on tape directement le schéma attendu)
  const form = useZodForm<InferBulkCreate<TItemSchema>>({
    schema: bulkSchema,
    defaultValues: defaultValues ?? {
      items: [getInitialItemValue()],
    },
    onSubmit,
  });

  // 4. Gestion du tableau dynamique
  const { fields, append, remove } = useFieldArray<
    InferBulkCreate<TItemSchema>
  >({
    control: form.control,
    name: "items",
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.submit} className="space-y-6" noValidate>
        <div className="space-y-4 pr-2 contain-intrinsic-size">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="group relative flex items-start gap-4 py-2 border-b duration-150 animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex-1">
                {renderFields({
                  index,
                  namePrefix: `items.${index}.value`,
                  control: form.control,
                  disabled: isSubmitting,
                })}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={fields.length <= 1 || isSubmitting}
                onClick={() => remove(index)}
                className="mt-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 duration-100"
                aria-label={`Supprimer l'élément ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => append(getInitialItemValue())}
            className="w-full sm:w-auto flex items-center gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>

          {form.formState.errors.items?.root && (
            <p
              role="alert"
              className="text-xs font-semibold text-destructive animate-pulse"
            >
              {form.formState.errors.items.root.message}
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}

/**
 * Concatène proprement le préfixe et le nom du champ avec un typage strict et fluide.
 */
export function getFormFieldName<
  TFieldValues extends FieldValues,
  TSubField extends string = string,
>(defaultFieldName: TSubField, prefix?: string): FieldPath<TFieldValues> {
  return (
    prefix ? `${prefix}.${defaultFieldName}` : defaultFieldName
  ) as FieldPath<TFieldValues>;
}
