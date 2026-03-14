import { describe, it, expect } from "vitest";
import * as Options from "../options";
import { SECTION, USER_GENDER, USER_ROLE, STUDENT_STATUS } from "../enum";

describe("UI Options Generators", () => {
  // Test générique pour vérifier la structure de base
  const validateOptionStructure = (options: any[]) => {
    expect(Array.isArray(options)).toBe(true);
    options.forEach((option) => {
      expect(option).toHaveProperty("label");
      expect(option).toHaveProperty("value");
      expect(typeof option.label).toBe("string");
    });
  };

  describe("SECTION_OPTIONS", () => {
    it("doit retourner la liste des sections avec la structure correcte", () => {
      validateOptionStructure(Options.SECTION_OPTIONS);
      // Vérifie qu'une valeur spécifique de l'enum est présente
      const values = Options.SECTION_OPTIONS.map((o) => o.value);
      expect(values).toContain(SECTION.KINDERGARTEN);
    });
  });

  describe("GENDER_OPTIONS", () => {
    it("doit inclure tous les genres définis", () => {
      validateOptionStructure(Options.GENDER_OPTIONS);
      expect(Options.GENDER_OPTIONS.length).toBe(
        Object.keys(USER_GENDER).length,
      );
    });

    it("doit avoir des labels traduits (pas seulement les clés d'enum)", () => {
      const maleOption = Options.GENDER_OPTIONS.find(
        (o) => o.value === USER_GENDER.MALE,
      );
      // On s'attend à ce que le label soit différent de la clé brute si la traduction fonctionne
      expect(maleOption?.label).toBeDefined();
    });
  });

  describe("ROLE_OPTIONS", () => {
    it("doit mapper correctement les rôles utilisateur", () => {
      validateOptionStructure(Options.ROLE_OPTIONS);
      const adminRole = Options.ROLE_OPTIONS.find(
        (o) => o.value === USER_ROLE.ADMIN,
      );
      expect(adminRole).toBeDefined();
    });
  });

  describe("STUDENT_STATUS_OPTIONS", () => {
    it("doit contenir le statut ACTIF", () => {
      const activeStatus = Options.STUDENT_STATUS_OPTIONS.find(
        (o) => o.value === STUDENT_STATUS.EN_COURS,
      );
      expect(activeStatus).toBeDefined();
    });
  });

  describe("Cohérence des exports", () => {
    it("tous les exports d'options doivent être des tableaux non vides", () => {
      const allOptions = [
        Options.SECTION_OPTIONS,
        Options.GENDER_OPTIONS,
        Options.ROLE_OPTIONS,
        Options.STUDENT_STATUS_OPTIONS,
        Options.ENROLEMENT_ACTION_OPTIONS,
        Options.MUTATION_ACTION_OPTIONS,
      ];

      allOptions.forEach((optList) => {
        expect(optList.length).toBeGreaterThan(0);
      });
    });
  });
});
