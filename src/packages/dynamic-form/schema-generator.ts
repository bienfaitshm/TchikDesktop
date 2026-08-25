import { z } from "zod";
import type { FormFieldDef } from "./type";

/** Strategy resolver mapping field types to their corresponding base Zod schemas. */
const SCHEMA_TYPE_STRATEGIES: Record<string, () => z.ZodTypeAny> = {
  number: () => z.coerce.number(),
  date: () => z.date(),
  string: () => z.string(),
};

/** Default error messages for field validation fallback. */
const ERROR_MESSAGES = {
  required: "Ce champ est requis",
  minArray: "Sélectionnez au moins une option",
} as const;

/**
 * Resolves the base Zod schema based on the provided field definition type.
 * @param field - The form field definition.
 * @returns A base Zod schema validator.
 */
function buildBaseSchema(field: FormFieldDef): z.ZodTypeAny {
  const strategy = SCHEMA_TYPE_STRATEGIES[field.type];
  return strategy ? strategy() : z.string();
}

/**
 * Applies optionality, array multiplicity, and required constraints to a base Zod schema.
 * @param baseSchema - The base Zod schema corresponding to the field type.
 * @param field - The form field definition with validation requirements.
 * @returns The final Zod schema with all constraints applied.
 */
function applyFieldConstraints(
  baseSchema: z.ZodTypeAny,
  field: FormFieldDef,
): z.ZodTypeAny {
  let schema = baseSchema;

  if (field.required && !field.multiple) {
    if (schema instanceof z.ZodString) {
      schema = schema.min(1, ERROR_MESSAGES.required);
    }
  }

  if (field.multiple) {
    const arraySchema = z.array(schema);
    schema = field.required
      ? arraySchema.min(1, ERROR_MESSAGES.minArray)
      : arraySchema;
  }

  if (!field.required) {
    if (field.multiple) {
      schema = z.preprocess(
        (val) => (Array.isArray(val) && val.length === 0 ? undefined : val),
        schema.optional(),
      );
    } else {
      schema = z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        schema.optional(),
      );
    }
  }

  return schema;
}

/**
 * Generates a dynamic Zod object schema for form validation based on an array of field definitions.
 * @param fields - Array of form field definitions containing validation metadata.
 * @returns A dynamic Zod object schema mapped by field identifiers.
 */
export function generateValidationSchema(
  fields: FormFieldDef[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const schemaObj: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    const baseSchema = buildBaseSchema(field);
    schemaObj[field.id] = applyFieldConstraints(baseSchema, field);
  });

  return z.object(schemaObj);
}
