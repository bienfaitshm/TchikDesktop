/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";

// Cette commande est "hoisted" par Vitest pour s'exécuter avant les imports
vi.stubGlobal("electron", {
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeAllListeners: vi.fn(),
  },
});

// Pour que window.electron soit accessible si votre code utilise le préfixe window
global.window.electron = (global as any).electron;

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
