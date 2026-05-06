import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnrollmentExportStrategy } from "./enrollments";

vi.mock("./enrollments.form-fields", () => ({
  createEnrollmentsgFieldForm: vi
    .fn()
    .mockResolvedValue([{ name: "year", type: "number" }]),
}));

vi.mock("./base.form-fields", () => ({
  prependFileTypeField: vi.fn((fields) => fields),
}));

describe("EnrollmentExportStrategy", () => {
  let strategy: EnrollmentExportStrategy;

  beforeEach(() => {
    strategy = new EnrollmentExportStrategy();
  });

  it("doit avoir les bonnes propriétés d'identification", () => {
    expect(strategy.id).toBe("ENROLLMENT_EXPORT");
    expect(strategy.displayName).toBe("Liste des Inscriptions");
  });

  it("doit retourner des filtres d'extension pour CSV et JSON", () => {
    const filters = strategy.extensionFilters;
    const extensions = filters.flatMap((f) => f.extensions);
    expect(extensions).toContain("csv");
    expect(extensions).toContain("json");
  });

  it("doit valider les paramètres via EnrolementFilterSchema", () => {
    const invalidParams = { unknownField: "test" };
    const result = strategy.validateContext(invalidParams);
    expect(result.success).toBe(false);
  });

  it("doit résoudre les données avec succès", async () => {
    const mockFilters = { schoolYear: 2024 };
    const result = await strategy.resolveData(mockFilters as any);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(mockFilters);
    }
  });

  it("doit générer les champs du formulaire", async () => {
    const fields = await strategy.getFormFields({} as any);
    expect(fields).toBeDefined();
    expect(Array.isArray(fields)).toBe(true);
  });
});
