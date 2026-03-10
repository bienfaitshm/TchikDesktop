import { describe, it, expect } from "vitest";
import { api } from "./index";

describe("AppClients Factory", () => {
  it("doit avoir initialisé toutes les clés définies dans le registre", () => {
    const expectedKeys = [
      "classroom",
      "enrollement",
      "option",
      "school",
      "stats",
      "exportDocuments",
      "appInfos",
    ];

    expect(Object.keys(api)).toEqual(expect.arrayContaining(expectedKeys));
  });

  it("chaque client doit être défini (pas de undefined)", () => {
    Object.values(api).forEach((client) => {
      expect(client).toBeDefined();
      expect(typeof client).toBe("object");
    });
  });

  it("doit être gelé (immutable) en production", () => {
    expect(Object.isFrozen(api)).toBe(true);
    try {
      (api as any).classroom = null;
    } catch (e) {}

    expect(api.classroom).not.toBeNull();
  });
});
