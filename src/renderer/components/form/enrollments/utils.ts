import { FormSubmitHandler } from "@/renderer/libs/queries/base";
import { UseFormReturn, FieldValues } from "react-hook-form";

/**
 * Checks whether a given value is a plain non-null object.
 * @param item - The value to evaluate.
 * @returns True if the value is a plain object, false otherwise.
 */
function isObject(item: unknown): item is Record<string, unknown> {
  return Boolean(item && typeof item === "object" && !Array.isArray(item));
}

/**
 * Recursively merges source object properties into a target object.
 * @param target - The destination base object.
 * @param source - The source object providing override values.
 * @returns The merged composite object.
 */
export function mergeDeep<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (isObject(sourceValue) && isObject(targetValue)) {
        output[key as keyof T] = mergeDeep(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>,
        ) as T[keyof T];
      } else if (sourceValue !== undefined) {
        output[key as keyof T] = sourceValue as T[keyof T];
      }
    });
  }

  return output;
}

/**
 * Creates a submission handler that preserves all form fields including omitted ones.
 * @param form - The React Hook Form instance controller.
 * @param onSubmit - The target callback function receiving complete data.
 * @returns Form submit handler function compatible with standard form submit events.
 */
export function createCompleteSubmitHandler<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSubmit?: FormSubmitHandler<T>,
) {
  return form.handleSubmit(
    (validatedData) => {
      const rawValues = form.getValues();
      const completeData = mergeDeep<T>(rawValues, validatedData);

      onSubmit?.(completeData, {
        reset: (nextValues) => {
          form.reset(nextValues);
        },
      });
    },
    (errors) => {
      console.log("erros", errors);
    },
  );
}
