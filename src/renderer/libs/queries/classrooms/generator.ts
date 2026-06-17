import { useCallback, useState, useRef } from "react";
import type { UseZodFormReturn } from "@/packages/use-zod-form";
import type { ClassroomCreateSchema } from "@/packages/@core/data-access/schema-validations";
import type { TSuggestion } from "./utils";

interface UseClassroomSuggestionOptions {
  onGenerateSuggestion?: (
    optionId: string,
    identifier: string,
  ) => TSuggestion | null | Promise<TSuggestion | null>;
}

export function useGenerateClassroomSuggestion(
  options: UseClassroomSuggestionOptions = {},
) {
  const [isGenerating, setIsGenerating] = useState(false);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const handleGenerate = useCallback(
    async (form: UseZodFormReturn<typeof ClassroomCreateSchema>) => {
      const { identifier, optionId } = form.getValues();

      if (!identifier || !optionId) {
        await form.trigger(["identifier", "optionId"]);
        return;
      }

      try {
        setIsGenerating(true);

        const suggestion = await optionsRef.current.onGenerateSuggestion?.(
          String(optionId),
          identifier,
        );

        if (suggestion) {
          form.setValue("identifier", suggestion.name, {
            shouldDirty: true,
            shouldValidate: true,
          });
          form.setValue("shortIdentifier", suggestion.shortName, {
            shouldDirty: true,
            shouldValidate: true,
          });
        }
      } catch (error) {
        console.error("[Classroom Suggestion Error]:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [],
  );

  return {
    isGenerating,
    handleGenerate,
  };
}
