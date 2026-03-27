import { describe, it, expect } from "vitest";

import {
  getFrenchOrdinalPrefix,
  createSuggestion,
} from "./classroom-form.utils";

describe("Logic de Suffixes et Suggestions", () => {
  describe("getFrenchOrdinalPrefix", () => {
    it("devrait transformer 'premier' en '1er'", () => {
      expect(getFrenchOrdinalPrefix("premier")).toBe("1er");
    });

    it("devrait être insensible aux accents et à la casse", () => {
      expect(getFrenchOrdinalPrefix("Quatrième")).toBe("4ème");
      expect(getFrenchOrdinalPrefix("huitieme")).toBe("8ème");
    });

    it("devrait gérer les entrées numériques en string", () => {
      expect(getFrenchOrdinalPrefix("6")).toBe("6ème");
    });

    it("devrait retourner 'Inconnu' pour une valeur farfelue", () => {
      expect(getFrenchOrdinalPrefix("XYZ")).toBe("Inconnu");
    });
  });

  describe("createSuggestion", () => {
    const mockOptions = [
      {
        optionId: "opt-1",
        optionName: "Pédagogie",
        optionShortName: "Péda",
        schoolId: "school_1",
      },
    ];

    it("devrait générer une suggestion complète basée sur l'identifiant", () => {
      const result = createSuggestion(mockOptions, "opt-1", "deuxieme");
      expect(result).toEqual({
        name: "2ème Pédagogie",
        shortName: "2ème Péda",
      });
    });

    it("devrait retourner null si l'optionId n'existe pas", () => {
      const result = createSuggestion(mockOptions, "non-existant", "1");
      expect(result).toBeNull();
    });

    it("devrait utiliser l'identifiant brut si le préfixe est inconnu", () => {
      const result = createSuggestion(mockOptions, "opt-1", "ABC");
      expect(result?.name).toBe("ABC Pédagogie");
    });
  });
});
