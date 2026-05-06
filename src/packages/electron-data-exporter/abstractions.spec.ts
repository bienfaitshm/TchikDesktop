// abstractions.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import {
  AbstractExportExtension,
  AbstractExportStrategy,
} from "./abstractions";
import type { DOCUMENT_EXTENSION } from "@/packages/file-extension";

// Mock des dépendances externes
vi.mock("@/packages/file-extension", () => ({
  getFileDescription: vi.fn((ext) => `Description for ${ext}`),
}));

// 1. Création d'une extension concrète (Dummy) pour le test
class DummyCsvExtension extends AbstractExportExtension<{ name: string }> {
  readonly extension = "csv" as DOCUMENT_EXTENSION;

  process(data: { name: string }) {
    if (data.name === "ERROR") throw new Error("Processing failed");
    return `Name\n${data.name}`;
  }
}

// 2. Création d'une stratégie concrète (Dummy) pour le test
class DummyUserStrategy extends AbstractExportStrategy<{ name: string }> {
  readonly id = "dummy-users";
  readonly displayName = "Export Utilisateurs";
  readonly description = "Exporte la liste des utilisateurs";

  protected validationSchema = z.object({
    role: z.string().min(1),
  });

  public async resolveData(_: unknown) {
    return { success: true, data: { name: "Alice" } } as const;
  }
}

describe("Abstractions d'Export", () => {
  let strategy: DummyUserStrategy;
  let csvExtension: DummyCsvExtension;

  beforeEach(() => {
    csvExtension = new DummyCsvExtension();
    strategy = new DummyUserStrategy({ extensions: [csvExtension] });
  });

  describe("AbstractExportExtension", () => {
    it("doit retourner le filtre d'extension correct", () => {
      const filter = csvExtension.getExtensionFilter();
      expect(filter).toEqual({
        name: "Description for csv",
        extensions: ["csv"],
      });
    });
  });

  describe("AbstractExportStrategy", () => {
    it("doit retourner les métadonnées correctes", async () => {
      const meta = await strategy.getMeta();
      expect(meta.title).toBe("Export Utilisateurs");
      expect(meta.extensions).toHaveLength(1);
      expect(meta.extensions[0].extensions).toContain("csv");
    });

    it("doit générer les options de sauvegarde avec le bon format de date", () => {
      const options = strategy.getSaveOptions("csv" as DOCUMENT_EXTENSION);
      const dateString = new Date().toISOString().split("T")[0];

      expect(options.title).toBe("Exporter - Export Utilisateurs");
      expect(options.defaultPath).toBe(`Export Utilisateurs_${dateString}.csv`);
      expect(options.filters).toHaveLength(1);
    });

    it("doit valider le contexte avec succès si le schéma Zod correspond", () => {
      const result = strategy.validateContext({ role: "admin" });
      expect(result.success).toBe(true);
    });

    it("doit échouer la validation et formater l'erreur Zod", () => {
      const result = strategy.validateContext({ role: "" }); // min(1) failed
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
        expect(result.error.details).toContain("role");
      }
    });

    it("doit construire l'artefact si l'extension existe", async () => {
      const result = await strategy.buildArtifact("csv" as DOCUMENT_EXTENSION, {
        name: "Bob",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("Name\nBob");
      }
    });

    it("doit capturer et formater les erreurs levées par l'extension", async () => {
      const result = await strategy.buildArtifact("csv" as DOCUMENT_EXTENSION, {
        name: "ERROR",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("GENERATION_ERROR");
        expect(result.error.details).toBe("Processing failed");
      }
    });

    it("doit retourner une erreur si l'extension n'est pas supportée", async () => {
      const result = await strategy.buildArtifact(
        "pdf" as DOCUMENT_EXTENSION,
        {},
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("GENERATION_ERROR");
      }
    });
  });
});
