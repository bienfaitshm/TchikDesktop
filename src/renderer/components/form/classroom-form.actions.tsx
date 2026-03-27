import { useCallback } from "react";
import { createSuggestion } from "./classroom-form";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";

export function useClassroomFormOptions(schoolId: string) {
    const { options: selectItems, data: rawOptions } = useGetOptionAsOptions(schoolId);

    const generateSuggestion = useCallback(
        (optionId: string, currentName: string) => {
            if (!rawOptions) return null;
            return createSuggestion(rawOptions, optionId, currentName);
        },
        [rawOptions]
    );

    return {
        selectItems,
        generateSuggestion,
        rawOptions
    };
}