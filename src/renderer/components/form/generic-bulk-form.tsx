import React from "react";
import { type Control, useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Form } from "@/renderer/components/ui/form";
import { Button } from "@/renderer/components/ui/button";
import { type BaseFormProps, useZodForm } from "@/renderer/libs/forms";
import {
  createBulkCreateSchema,
  type InferBulkCreate,
} from "@/packages/@core/data-access/schema-validations";

// On définit l'interface attendue par l'item de formulaire générique
export interface BulkFormItemRenderProps<TFieldValues extends z.ZodTypeAny> {
  /** Index de l'élément courant dans le tableau array */
  index: number;
  /** Le nom préfixé à donner aux sous-champs de formulaire (ex: `items.${index}.value`) */
  namePrefix: `items.${number}.value`;
  /** Le contrôle du formulaire pour les passer aux <FormField> */
  control: Control<InferBulkCreate<TFieldValues>>;
  /** Flag indiquant si le formulaire est en cours de soumission */
  disabled?: boolean;
}

interface GenericBulkFormProps<TItemSchema extends z.ZodTypeAny> {
  /** Le schéma unitaire de création (ex: OptionCreateSchema) */
  itemSchema: TItemSchema;
  /** Les valeurs par défaut unitaires d'une seule ligne vide (ex: DEFAULT_OPTION_VALUES) */
  itemDefaultValues: z.infer<TItemSchema>;
  /** Fonction de rendu pour dessiner les inputs d'une seule ligne */
  renderFields: (
    props: BulkFormItemRenderProps<TItemSchema>,
  ) => React.ReactNode;
  /** Libellé personnalisé pour le bouton d'ajout de ligne */
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
}: BaseFormProps<
  z.infer<ReturnType<typeof createBulkCreateSchema<TItemSchema>>>
> &
  GenericBulkFormProps<TItemSchema>) {
  // 1. Instanciation dynamique du schéma Bulk global
  const bulkSchema = React.useMemo(
    () => createBulkCreateSchema(itemSchema),
    [itemSchema],
  );

  const getInitialItemValue: () => InferBulkCreate<
    typeof itemSchema
  >["items"][0] = React.useCallback(
    () => ({
      key: crypto.randomUUID(),
      value: itemDefaultValues,
    }),
    [itemDefaultValues],
  );

  // 2. Initialisation du formulaire global
  const form = useZodForm<InferBulkCreate<typeof itemSchema>>({
    schema: bulkSchema,
    defaultValues: defaultValues ?? {
      items: [getInitialItemValue()],
    },
    onSubmit,
  });

  // 3. Gestion dynamique des lignes de tableau via useFieldArray
  const { fields, append, remove } = useFieldArray<
    InferBulkCreate<typeof itemSchema>
  >({
    control: form.control,
    name: "items",
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form id={formId} onSubmit={form.submit} className="space-y-6" noValidate>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="group relative flex items-start gap-4 p-4 border rounded-xl bg-card/50 hover:bg-accent/5 duration-150 animate-in fade-in slide-in-from-top-2"
            >
              {/* Conteneur de champs injecté dynamiquement */}
              <div className="flex-1">
                {renderFields({
                  index,
                  namePrefix: `items.${index}.value`,
                  control: form.control,
                  disabled: isSubmitting,
                })}
              </div>

              {/* Bouton de retrait de ligne (Désactivé s'il ne reste qu'une seule ligne obligatoire) */}
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

        {/* Pied de formulaire : Actions transversales */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t">
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

          {/* Affichage centralisé des erreurs globales de structure (comme l'absence d'unicité des clés) */}
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
