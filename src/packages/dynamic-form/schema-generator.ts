import { z } from "zod";
import type { FormFieldDef } from "./type";

export function generateValidationSchema(fields: FormFieldDef[]) {
  const schemaObj = {};

  fields.forEach((field) => {
    let fieldValidation;
    switch (field.type) {
      case "email":
        fieldValidation = z.string().email("Format d'email invalide");
        break;
      case "number":
        fieldValidation = z.coerce.number();
        break;
      case "text":
      case "select":
      default:
        fieldValidation = z.string();
    }

    if (!field.required) {
      fieldValidation = fieldValidation.optional().or(z.literal(""));
    } else if (fieldValidation instanceof z.ZodString) {
      fieldValidation = fieldValidation.min(1, "Ce champ est requis");
    }
    schemaObj[field.id] = fieldValidation;
  });

  return z.object(schemaObj);
}
