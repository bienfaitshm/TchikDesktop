import { describe, it, expect } from "vitest";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engins";

describe("Export Engines (CSV & JSON)", () => {
  describe("CsvExportExtension", () => {
    const engine = new CsvExportExtension();

    it("doit retourner une chaîne vide pour un tableau vide", () => {
      expect(engine.process([])).toBe("");
    });

    it("doit convertir correctement les données avec un point-virgule", () => {
      const data = [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
      ];
      const result = engine.process(data);

      expect(result).toContain("id;name");
      expect(result).toContain("1;Alice");
      expect(result).toContain("2;Bob");
    });

    it("doit gérer les valeurs nulles sans planter", () => {
      const data = [{ name: "Alice", age: null }];
      const result = engine.process(data as any);
      expect(result).toContain("Alice;");
    });
  });

  describe("JsonExportExtension", () => {
    const engine = new JsonExportExtension();

    it("doit produire un JSON indenté", () => {
      const data = [{ id: 1 }];
      const result = engine.process(data);
      // Vérifie l'indentation (2 espaces)
      expect(result).toBe(`[\n  {\n    "id": 1\n  }\n]`);
    });

    it("doit retourner un tableau vide JSON si les données sont nulles", () => {
      expect(engine.process(null as any)).toBe("[]");
    });

    it("doit lever une erreur en cas de structure circulaire", () => {
      const circular: any = {};
      circular.self = circular;
      expect(() => engine.process([circular])).toThrow(
        "Échec de la sérialisation JSON",
      );
    });
  });
});
