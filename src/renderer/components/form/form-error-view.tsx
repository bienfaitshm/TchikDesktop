import type { UseZodFormReturn } from "@/packages/use-zod-form";
import type z from "zod";

/**
 * Properties for the FormErrorView component.
 * @template T - The Zod schema type defining the form data structure.
 */
export type FormErrorViewProps<T extends z.ZodType> = {
  form: UseZodFormReturn<T>;
};

/**
 * Renders a global root error alert for a validated form.
 * @param props - Component properties containing the form instance.
 * @returns The alert element if a root error exists, otherwise null.
 */
export function FormErrorView<T extends z.ZodType>({
  form,
}: FormErrorViewProps<T>) {
  const rootError = form.formState.errors.root;

  if (!rootError) {
    return null;
  }

  return (
    <div
      role="alert"
      className="p-3 text-red-600 border rounded-md text-xs font-medium animate-in fade-in zoom-in duration-200"
    >
      {rootError.message}
    </div>
  );
}
