import { describe, it, expect, vi } from "vitest";
import { additionalJsContext } from "./additional-context";

vi.mock("@/packages/times", () => ({
  formatDate: (date: Date) => date.toISOString().split("T")[0],
}));

describe("additionalJsContext", () => {
  describe("String Transformers", () => {
    it("should convert string to uppercase", () => {
      expect(additionalJsContext.toUpperCase("hello")).toBe("HELLO");
      expect(additionalJsContext.toUpperCase(null)).toBe("");
      expect(additionalJsContext.toUpperCase(undefined)).toBe("");
    });

    it("should convert string to lowercase", () => {
      expect(additionalJsContext.toLowerCase("WORLD")).toBe("world");
      expect(additionalJsContext.toLowerCase(null)).toBe("");
    });

    it("should capitalize the first character", () => {
      expect(additionalJsContext.capitalize("jAVasCRIPT")).toBe("Javascript");
      expect(additionalJsContext.capitalize("")).toBe("");
      expect(additionalJsContext.capitalize(null)).toBe("");
    });

    it("should truncate strings exceeding maxLength", () => {
      expect(additionalJsContext.truncate("Short", 10)).toBe("Short");
      expect(additionalJsContext.truncate("Very long string content", 5)).toBe(
        "Very ...",
      );
      expect(additionalJsContext.truncate(null)).toBe("");
    });
  });

  describe("Date Formatters", () => {
    it("should format valid dates correctly", () => {
      const date = new Date("2026-01-01T00:00:00.000Z");
      expect(additionalJsContext.formatDate(date)).toBe("2026-01-01");
      expect(additionalJsContext.formatDateTime(date)).toBe("2026-01-01");
    });

    it("should throw TypeError on invalid dates", () => {
      expect(() => additionalJsContext.formatDate("invalid-date")).toThrow(
        TypeError,
      );
    });

    it("should calculate timeAgo accurately", () => {
      const now = Date.now();
      expect(additionalJsContext.timeAgo(now - 30000)).toBe("À l'instant");
      expect(additionalJsContext.timeAgo(now - 300000)).toBe("Il y a 5 min");
      expect(additionalJsContext.timeAgo(now - 7200000)).toBe("Il y a 2 h");
      expect(additionalJsContext.timeAgo(now - 172800000)).toBe("Il y a 2 j");
    });
  });

  describe("Boolean & Status", () => {
    it("should format boolean with default or custom labels", () => {
      expect(additionalJsContext.formatBoolean(true)).toBe("Oui");
      expect(additionalJsContext.formatBoolean(false)).toBe("Non");
      expect(
        additionalJsContext.formatBoolean(true, { trueLabel: "Yes" }),
      ).toBe("Yes");
    });

    it("should format boolean as icon", () => {
      expect(additionalJsContext.formatBooleanAsIcon(true)).toBe("✅");
      expect(additionalJsContext.formatBooleanAsIcon(false)).toBe("❌");
    });

    it("should format status badge", () => {
      expect(additionalJsContext.formatStatusBadge(true)).toBe("Actif");
      expect(
        additionalJsContext.formatStatusBadge(false, "En ligne", "Hors ligne"),
      ).toBe("Hors ligne");
    });
  });

  describe("Number & Currency", () => {
    it("should format numbers with locale and precision", () => {
      expect(additionalJsContext.formatNumber(1234.56, 2, "en-US")).toBe(
        "1,234.56",
      );
      expect(additionalJsContext.formatNumber(null, 0, "fr-FR")).toBe("0");
      expect(additionalJsContext.formatNumber(NaN, 0, "fr-FR")).toBe("0");
    });

    it("should format currency values", () => {
      expect(
        additionalJsContext.formatCurrency(1500, "CDF", "fr-FR"),
      ).toContain("1 500,00 CDF");
      expect(additionalJsContext.formatCurrency(null)).toBe("");
    });

    it("should format percentage values", () => {
      expect(additionalJsContext.formatPercentage(0.1234, 1, "en-US")).toBe(
        "12.3%",
      );
      expect(additionalJsContext.formatPercentage(null)).toBe("0%");
    });
  });

  describe("Logic Helpers", () => {
    it("should return fallback if value is nullish", () => {
      expect(additionalJsContext.fallback(null, "N/A")).toBe("N/A");
      expect(additionalJsContext.fallback("Hello", "N/A")).toBe("Hello");
    });

    it("should check if value is defined", () => {
      expect(additionalJsContext.isDefined(0)).toBe(true);
      expect(additionalJsContext.isDefined(null)).toBe(false);
      expect(additionalJsContext.isDefined(undefined)).toBe(false);
    });

    it("should join arrays safely", () => {
      expect(additionalJsContext.join(["a", "b", "c"], "-")).toBe("a-b-c");
      expect(additionalJsContext.join(null)).toBe("");
    });

    it("should count array elements", () => {
      expect(additionalJsContext.count([1, 2, 3])).toBe(3);
      expect(additionalJsContext.count(null)).toBe(0);
    });

    it("should evaluate strict equality using eq", () => {
      expect(additionalJsContext.eq(10, 10)).toBe(true);
      expect(additionalJsContext.eq("abc", "xyz")).toBe(false);
      expect(additionalJsContext.eq(null, undefined)).toBe(false);
    });
  });
});
