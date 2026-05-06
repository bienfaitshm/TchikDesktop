import { describe, it, expect } from "vitest";
import { CsvExportExtension, JsonExportExtension } from "./enrollments.engines";

describe("Universal Export Engines", () => {
  describe("CsvExportExtension (Normalisation)", () => {
    const engine = new CsvExportExtension();

    it("doit traiter un objet unique comme une seule ligne", () => {
      const singleObject = { id: 1, name: "Alice" };
      const result = engine.process(singleObject);

      expect(result).toContain("id;name");
      expect(result).toContain("1;Alice");
      // Vérifie qu'il n'y a pas de lignes supplémentaires indésirables
      expect(result.trim().split("\n")).toHaveLength(2);
    });

    it("doit traiter un tableau d'objets normalement", () => {
      const dataArray = [{ id: 1 }, { id: 2 }];
      const result = engine.process(dataArray);
      expect(result.trim().split("\n")).toHaveLength(3); // Header + 2 lignes
    });
  });

  describe("JsonExportExtension", () => {
    const engine = new JsonExportExtension();

    it("doit sérialiser un objet unique en objet JSON (pas de tableau forcé)", () => {
      const data = { id: 1 };
      const result = engine.process(data);
      expect(result).toBe(`{\n  "id": 1\n}`);
    });

    it("doit retourner un tableau vide si data est nul", () => {
      expect(engine.process(null as any)).toBe("[]");
    });
  });
});
