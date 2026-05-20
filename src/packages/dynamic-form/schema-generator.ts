import { z } from "zod";
import type { FormFieldDef } from "./type";

export const generateValidationSchema = (fields: FormFieldDef[]) => {
  const schemaObj: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    let baseSchema;

    if (field.type === "number") {
      baseSchema = z.coerce.number({ invalid_type_error: "Nombre requis" });
    } else {
      baseSchema = z.string();
    }

    let finalSchema = field.multiple
      ? z
          .array(baseSchema)
          .min(field.required ? 1 : 0, "Sélectionnez au moins une option")
      : baseSchema;

    if (field.required && !field.multiple) {
      if (baseSchema instanceof z.ZodString) {
        finalSchema = (finalSchema as z.ZodString).min(
          1,
          "Ce champ est requis",
        );
      }
    } else if (!field.required) {
      finalSchema = field.multiple
        ? finalSchema.optional().or(z.array(z.any()).length(0))
        : finalSchema.optional().or(z.literal(""));
    }

    schemaObj[field.id] = finalSchema;
  });

  return z.object(schemaObj);
};
