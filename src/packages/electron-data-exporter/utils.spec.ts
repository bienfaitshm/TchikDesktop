import { describe, it, expect } from "vitest";
import { ZodError } from "zod";
import { formatZodError, sanitizeFileName } from "./utils";

describe("formatZodError", () => {
  it("should format single Zod issue correctly", () => {
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["username"],
        message: "Expected string, received number",
      },
    ]);

    const result = formatZodError(zodError);
    expect(result).toBe("username: Expected string, received number");
  });

  it("should format nested path issues and join multiple issues with semicolons", () => {
    const zodError = new ZodError([
      {
        code: "too_small",
        minimum: 8,
        type: "string",
        inclusive: true,
        exact: false,
        path: ["user", "profile", "password"],
        message: "String must contain at least 8 character(s)",
      },
      {
        code: "invalid_string",
        validation: "email",
        path: ["email"],
        message: "Invalid email",
      },
    ]);

    const result = formatZodError(zodError);
    expect(result).toBe(
      "user.profile.password: String must contain at least 8 character(s); email: Invalid email",
    );
  });

  it("should handle empty issues list gracefully", () => {
    const zodError = new ZodError([]);
    const result = formatZodError(zodError);
    expect(result).toBe("");
  });
});

describe("sanitizeFileName", () => {
  it("should remove illegal file system characters and replace them with underscores", () => {
    const input = "report<2026>/version:1?*\\|";
    const result = sanitizeFileName(input);
    expect(result).toBe("report_2026__version_1____");
  });

  it("should trim leading and trailing whitespace", () => {
    const input = "   my-document.pdf   ";
    const result = sanitizeFileName(input);
    expect(result).toBe("my-document.pdf");
  });

  it("should return empty string when input is empty", () => {
    const result = sanitizeFileName("");
    expect(result).toBe("");
  });

  it("should preserve valid characters like hyphens, dots, and underscores", () => {
    const input = "valid_file-name.v2.txt";
    const result = sanitizeFileName(input);
    expect(result).toBe("valid_file-name.v2.txt");
  });
});
