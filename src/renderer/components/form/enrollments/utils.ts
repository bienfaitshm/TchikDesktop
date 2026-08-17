import { FormSubmitHandler } from "@/renderer/libs/queries/base";
import { UseFormReturn, FieldValues, FieldErrors } from "react-hook-form";

/**
 * Checks whether a value is a plain object, excluding null, arrays, and Date instances.
 * @param item - The value to evaluate.
 * @returns True if the value is a plain key-value object, false otherwise.
 */
function isPlainObject(item: unknown): item is Record<string, unknown> {
  return (
    typeof item === "object" &&
    item !== null &&
    !Array.isArray(item) &&
    !(item instanceof Date)
  );
}

/**
 * Recursively merges source properties into a target object, handling nested objects and Date instances safely.
 * @param target - The destination base object.
 * @param source - The source object providing override values.
 * @returns A new merged object without mutating original inputs.
 */
export function mergeDeep<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  const output: Record<string, unknown> = { ...target };

  if (isPlainObject(target) && isPlainObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      const targetValue = target[key];

      if (sourceValue instanceof Date) {
        output[key] = new Date(sourceValue);
      } else if (isPlainObject(sourceValue)) {
        const baseTarget = isPlainObject(targetValue) ? targetValue : {};
        output[key] = mergeDeep(baseTarget, sourceValue);
      } else if (sourceValue !== undefined) {
        output[key] = sourceValue;
      }
    });
  }

  return output as T;
}

/**
 * Creates a submission handler preserving raw form fields and dates, with configurable error handling.
 * @param form - The React Hook Form instance controller.
 * @param onSubmit - Optional callback executed with full merged data upon successful validation.
 * @param onError - Optional callback executed when validation errors occur.
 * @returns A submit handler function compatible with form submission events.
 */
export function createCompleteSubmitHandler<T extends FieldValues>(
  form: UseFormReturn<T>,
  onSubmit?: FormSubmitHandler<T>,
  onError?: (errors: FieldErrors<T>) => void,
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
      onError?.(errors);
    },
  );
}
