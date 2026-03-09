/**
 * @file validation.spec.ts
 * @description Tests unitaires pour le middleware de validation Zod.
 */

import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import { createValidatedHandler } from "../validation";
import { HttpException } from "../utils";
import { HttpStatus } from "../constant";
import type { IpcRequest } from "../ipc";

// --- Mocks Data ---
const mockReq = (overrides: Partial<IpcRequest> = {}): IpcRequest => ({
  id: "123",
  body: {},
  params: {},
  headers: {},
  context: { sender: {} as any, window: null },
  ...overrides,
});

describe("createValidatedHandler", () => {
  it("devrait exécuter le handler si les données sont valides", async () => {
    const schema = z.object({ name: z.string() });

    // Handler espion
    const handlerSpy = vi.fn().mockResolvedValue("success");

    const validatedHandler = createValidatedHandler(handlerSpy, {
      schemas: { body: schema },
    });

    const req = mockReq({ body: { name: "Alice" } });
    const result = await validatedHandler(req);

    expect(result).toBe("success");
    expect(handlerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { name: "Alice" },
      })
    );
  });

  it("devrait transformer les données (Zod coercion) avant de les passer au handler", async () => {
    // Exemple: conversion string -> number
    const schema = z.object({ age: z.coerce.number() });
    const handlerSpy = vi.fn();

    const validatedHandler = createValidatedHandler(handlerSpy, {
      schemas: { body: schema },
    });

    // On envoie "25" (string)
    const req = mockReq({ body: { age: "25" } });
    await validatedHandler(req);

    // Le handler doit recevoir 25 (number)
    const calledReq = handlerSpy.mock.calls[0][0];
    expect(calledReq.body.age).toBe(25);
    expect(typeof calledReq.body.age).toBe("number");
  });

  it("devrait lever une HttpException avec les détails si la validation échoue", async () => {
    const schema = z.object({ email: z.string().email() });
    const handlerSpy = vi.fn();

    const validatedHandler = createValidatedHandler(handlerSpy, {
      schemas: { body: schema },
      errorMessage: "Données invalides",
    });

    const req = mockReq({ body: { email: "not-an-email" } });

    // Expectation d'erreur
    try {
      await validatedHandler(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.message).toBe("Données invalides");

      // Vérification des détails structurés
      expect(error.details.issues).toHaveLength(1);
      expect(error.details.issues[0]).toEqual({
        location: "body",
        path: "email",
        message: "Invalid email",
      });
    }

    expect(handlerSpy).not.toHaveBeenCalled();
  });

  it("devrait agréger les erreurs provenant du Body et des Params", async () => {
    const bodySchema = z.object({ fieldA: z.string() });
    const paramsSchema = z.object({ id: z.coerce.number() });

    const validatedHandler = createValidatedHandler(vi.fn(), {
      schemas: {
        body: bodySchema,
        params: paramsSchema,
      },
    });

    // Body invalide (manque fieldA) ET Params invalide (id est du texte non convertible)
    const req = mockReq({
      body: {},
      params: { id: "abc" },
    });

    try {
      await validatedHandler(req);
    } catch (error: any) {
      const issues = error.details.issues;
      expect(issues).toHaveLength(2);

      const locations = issues.map((i: any) => i.location);
      expect(locations).toContain("body");
      expect(locations).toContain("params");
    }
  });

  it("ne devrait pas muter l'objet request original", async () => {
    const schema = z.object({ val: z.coerce.number() });
    const handlerSpy = vi.fn();

    const validatedHandler = createValidatedHandler(handlerSpy, {
      schemas: { body: schema },
    });

    const originalBody = { val: "10" };
    const req = mockReq({ body: originalBody });

    await validatedHandler(req);

    // L'objet original doit rester intact (string)
    expect(originalBody.val).toBe("10");

    // L'objet reçu par le handler doit être transformé (number)
    const calledReq = handlerSpy.mock.calls[0][0];
    expect(calledReq.body.val).toBe(10);

    // Vérifier que ce sont deux objets différents
    expect(calledReq).not.toBe(req);
  });
});
