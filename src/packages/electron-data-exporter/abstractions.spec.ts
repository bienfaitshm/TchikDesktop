import { describe, it, expect, beforeEach } from "vitest";
import { z } from "zod";
import { DOCUMENT_EXTENSION } from "@/packages/file-extension";
import {
  AbstractExportStrategy,
  AbstractExportExtension,
  DataResolver,
  ExportStrategyConfig,
} from "./abstractions";

class MockExportExtension extends AbstractExportExtension<string> {
  public description?: string | undefined;
  public readonly extension = DOCUMENT_EXTENSION.PDF;
  public async process(data: string): Promise<string> {
    if (data === "FAIL") throw new Error("Processing failed");
    return `processed-${data}`;
  }
}

class MockResolver implements DataResolver<{ id: string }, string> {
  async resolveData(payload: { id: string }): Promise<string> {
    if (payload.id === "error") throw new Error("Database error");
    return `data-${payload.id}`;
  }
}

class TestExportStrategy extends AbstractExportStrategy<
  unknown,
  { id: string },
  string
> {
  public readonly id = "test-strategy";
  public readonly category = "reports";
  public readonly displayName = "Test Report";
  public readonly description = "A test export strategy";

  protected readonly validationSchema = z.object({
    id: z.string().min(1),
  });
}

describe("AbstractExportStrategy", () => {
  let strategy: TestExportStrategy;
  let mockExtension: MockExportExtension;
  let mockResolver: MockResolver;

  beforeEach(() => {
    mockExtension = new MockExportExtension();
    mockResolver = new MockResolver();

    const config: ExportStrategyConfig<unknown, { id: string }, string> = {
      extensions: [mockExtension],
      resolver: mockResolver,
    };

    strategy = new TestExportStrategy(config);
  });

  describe("getMeta", () => {
    it("should return correct strategy metadata and filters", async () => {
      const meta = await strategy.getMeta();
      expect(meta.title).toBe("Test Report");
      expect(meta.category).toBe("reports");
      expect(meta.description).toBe("A test export strategy");
      expect(meta.extensions).toHaveLength(1);
      expect(meta.extensions[0].extensions).toContain(DOCUMENT_EXTENSION.PDF);
    });
  });

  describe("validateContext", () => {
    it("should successfully validate correct payload", () => {
      const result = strategy.validateContext({ id: "123" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ id: "123" });
      }
    });

    it("should fail validation on invalid payload", () => {
      const result = strategy.validateContext({ id: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("VALIDATION_ERROR");
      }
    });
  });

  describe("handleResolveData", () => {
    it("should resolve data successfully", async () => {
      const result = await strategy.handleResolveData({ id: "456" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("data-456");
      }
    });

    it("should catch resolver errors and return error service result", async () => {
      const result = await strategy.handleResolveData({ id: "error" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("DATA_FETCH_ERROR");
        expect(result.error.message).toBe("Database error");
      }
    });
  });

  describe("buildArtifact", () => {
    it("should build artifact successfully for supported extension", async () => {
      const result = await strategy.buildArtifact(
        DOCUMENT_EXTENSION.PDF,
        "content",
      );
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("processed-content");
      }
    });

    it("should return error when extension is not supported", async () => {
      const result = await strategy.buildArtifact(
        DOCUMENT_EXTENSION.CSV,
        "content",
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("GENERATION_ERROR");
        expect(result.error.message).toContain("not supported");
      }
    });

    it("should handle processing errors gracefully", async () => {
      const result = await strategy.buildArtifact(
        DOCUMENT_EXTENSION.PDF,
        "FAIL",
      );
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("GENERATION_ERROR");
        expect(result.error.details).toBe("Processing failed");
      }
    });
  });

  describe("getSaveOptions", () => {
    it("should return correct save options with target extension", () => {
      const options = strategy.getSaveOptions(DOCUMENT_EXTENSION.PDF);
      expect(options.title).toBe("Export - Test Report");
      expect(options.defaultPath).toMatch(
        /^Test_Report_\d{2}_\d{2}_\d{4}_\d{6}\.pdf$/,
      );
      expect(options.filters).toHaveLength(1);
    });

    it("should return fallback options without target extension", () => {
      const options = strategy.getSaveOptions();
      expect(options.defaultPath).toMatch(
        /^Test_Report_\d{2}_\d{2}_\d{4}_\d{6}$/,
      );
      expect(options.filters).toHaveLength(1);
    });
  });
});
