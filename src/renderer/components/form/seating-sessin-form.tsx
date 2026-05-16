import React from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/renderer/components/ui/form";
import { Input } from "@/renderer/components/ui/input";
import { SeatingSessionCreateSchema } from "@/packages/@core/data-access/schema-validations";
import { type BaseFormProps, useZodForm } from "./base-form";
import { z } from "zod";
export type SeatingSessionData = z.infer<typeof SeatingSessionCreateSchema>;

const DEFAULT_SESSION_VALUES: SeatingSessionData = {
  schoolId: "",
  sessionName: "",
  yearId: "",
};

interface SeatingSessionProps {
  className?: string;
}

export const SeatingSessionForm: React.FC<
  BaseFormProps<SeatingSessionData> & SeatingSessionProps
> = ({ formId, onSubmit, initialValues, className }) => {
  const form = useZodForm({
    schema: SeatingSessionCreateSchema,
    initialValues: initialValues,
    defaultValues: DEFAULT_SESSION_VALUES,
    onSubmit,
  });

  const isPending = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.submit}
        className={className || "space-y-6"}
        aria-label="Configuration de la session d'examen"
      >
        <FormField
          control={form.control}
          name="sessionName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold text-foreground/90">
                Nom de la session
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Ex: Examen de premier semestre"
                  disabled={isPending}
                  aria-required="true"
                  className="focus-visible:ring-primary"
                />
              </FormControl>
              <FormMessage className="text-xs italic" />
            </FormItem>
          )}
        />

        <input type="hidden" {...form.register("schoolId")} />
        <input type="hidden" {...form.register("yearId")} />
      </form>
    </Form>
  );
};

SeatingSessionForm.displayName = "SeatingSessionForm";
