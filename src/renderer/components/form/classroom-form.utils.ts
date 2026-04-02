import { useCallback, useState } from "react";
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum";
import {
  ClassroomCreateSchema,
  type TClassroomCreate,
  type TOptionAttributes,
} from "@/packages/@core/data-access/schema-validations";
import { useZodForm } from "@/packages/use-zod-form";

export type ClassroomFormData = TClassroomCreate;
export type TSuggestion = { name: string; shortName: string };

const DEFAULT_CLASSROOM_VALUES: ClassroomFormData = {
  identifier: "",
  shortIdentifier: "",
  schoolId: "",
  optionId: null,
  yearId: "",
  section: SECTION_ENUM.SECONDARY,
};

const ORDINAL_TEXT_MAP: Record<string, number> = {
  premier: 1,
  premiere: 1,
  "1er": 1,
  "1ere": 1,
  deuxieme: 2,
  second: 2,
  seconde: 2,
  "2eme": 2,
  "2e": 2,
  troisieme: 3,
  "3eme": 3,
  "3e": 3,
  quatrieme: 4,
  "4eme": 4,
  "4e": 4,
  cinquieme: 5,
  "5eme": 5,
  "5e": 5,
  sixieme: 6,
  "6eme": 6,
  "6e": 6,
  septieme: 7,
  "7eme": 7,
  "7e": 7,
  huitieme: 8,
  "8eme": 8,
  "8e": 8,
} as const;

type UseClassroomFormParams = {
  initialValues: Partial<ClassroomFormData>;
  onSubmit?: (value: ClassroomFormData) => void;
  onGenerateSuggestion?: (
    optionId: string,
    identifier: string,
  ) => TSuggestion | null | undefined;
};

/**
 * Optimisation : Utilitaire pur pour la suggestion.
 * On gère le cas où l'option n'existe pas pour éviter les "undefined" dans le texte.
 */
export const createSuggestion = (
  options: TOptionAttributes[],
  optionId: string,
  identifier: string,
): TSuggestion | null => {
  const selectedOption = options.find(
    (o) => String(o.optionId) === String(optionId),
  );

  if (!selectedOption) return null;

  const suffix = getFrenchOrdinalPrefix(identifier);

  const prefix = suffix === "Inconnu" ? identifier : suffix;

  return {
    name: `${prefix} ${selectedOption.optionName}`.trim(),
    shortName: `${prefix} ${selectedOption.optionShortName}`.trim(),
  };
};

export function useClassroomForm({
  initialValues,
  onSubmit,
  onGenerateSuggestion,
}: UseClassroomFormParams) {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useZodForm({
    schema: ClassroomCreateSchema,
    defaultValues: { ...DEFAULT_CLASSROOM_VALUES, ...initialValues },
    onSubmit,
  });

  const handleGenerate = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (isGenerating) return;

      const { identifier, optionId } = form.getValues();

      // On ne trigger que si on a des valeurs
      if (!identifier || !optionId) {
        await form.trigger(["identifier", "optionId"]);
        return;
      }

      try {
        setIsGenerating(true);
        const suggestion = await onGenerateSuggestion?.(
          String(optionId),
          identifier,
        );

        if (suggestion) {
          // Batching des updates de formulaire
          form.reset(
            {
              ...form.getValues(),
              identifier: suggestion.name,
              shortIdentifier: suggestion.shortName,
            },
            { keepDefaultValues: true },
          );

          // Force la validation après le remplissage
          await form.trigger(["identifier", "shortIdentifier"]);
        }
      } catch (error) {
        console.error("[Suggestion Error]:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [form, onGenerateSuggestion, isGenerating],
  );

  return { isGenerating, handleGenerate, form };
}

/**
 * Utilitaire pour enlever les accents d'une chaîne de caractères.
 */
const normalizeText = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

interface OrdinalOptions {
  isFeminine?: boolean;
  shortSuffix?: boolean;
}

/**
 * @function getFrenchOrdinalPrefix
 * Suggère un préfixe ordinal (1er, 2ème...) même si l'entrée est mal orthographiée ou sans accents.
 */
export const getFrenchOrdinalPrefix = (
  input: string | number,
  options: OrdinalOptions = {},
): string => {
  const { isFeminine = false, shortSuffix = false } = options;

  if (typeof input === "number") {
    return formatResult(input, isFeminine, shortSuffix);
  }

  const normalizedInput = normalizeText(input);

  const mappedValue = ORDINAL_TEXT_MAP[normalizedInput];
  if (mappedValue !== undefined) {
    return formatResult(mappedValue, isFeminine, shortSuffix);
  }

  const parsed = parseInt(normalizedInput, 10);
  if (!isNaN(parsed)) {
    return formatResult(parsed, isFeminine, shortSuffix);
  }

  return "Inconnu";
};

/**
 * Fonction interne de formatage
 */
function formatResult(num: number, isFem: boolean, short: boolean): string {
  if (num === 1) return isFem ? "1ère" : "1er";
  return `${num}${short ? "e" : "ème"}`;
}
