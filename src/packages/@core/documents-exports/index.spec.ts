// index.spec.ts
import { describe, it, expect } from "vitest";
import { documentExport } from "./index";

describe("Module Integration: Document Export", () => {
  it("doit être initialisé avec les stratégies enregistrées", async () => {
    const available = await documentExport.getAvailableExports();

    expect(documentExport).toBeDefined();
    expect(available.length).toBeGreaterThan(0);
    expect(available.some((s) => s.id === "ENROLLMENT_EXPORT")).toBe(true);
  });
});
