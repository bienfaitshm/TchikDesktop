/**
 * @file utils.spec.ts
 * @description Suite de tests unitaires pour les utilitaires IPC.
 * Couvre la gestion des exceptions, le formatage et les factories de réponse.
 */

import { describe, it, expect, vi } from "vitest";
import {
  HttpException,
  formatChannelName,
  createResponse,
  createErrorResponse,
  unwrapResult,
} from "../utils"; // Assurez-vous que le chemin est correct

// --- MOCKING DES DÉPENDANCES ---
// On mocke le module "constant" pour que les tests soient isolés
vi.mock("./constant", () => ({
  HttpStatus: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    INTERNAL_SERVER_ERROR: 500,
  },
  // Simulation simple de la logique isSuccess
  isSuccess: (status: number) => status >= 200 && status < 300,
}));

// Import dynamique des constantes mockées pour utilisation dans les tests
import { HttpStatus } from "../constant";

describe("IPC Utils", () => {
  // --- 1. Tests pour HttpException ---
  describe("HttpException", () => {
    it("doit créer une instance avec les valeurs par défaut", () => {
      const error = new HttpException("Erreur par défaut");

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpException);
      expect(error.message).toBe("Erreur par défaut");
      expect(error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.details).toBeUndefined();
    });

    it("doit créer une instance avec un code et des détails personnalisés", () => {
      const details = { field: "email", reason: "invalid" };
      const error = new HttpException(
        "Mauvaise requête",
        HttpStatus.BAD_REQUEST,
        details
      );

      expect(error.message).toBe("Mauvaise requête");
      expect(error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(error.details).toEqual(details);
    });

    it("doit préserver la chaîne de prototype (instanceof fonctionne)", () => {
      // Important pour vérifier que `error instanceof HttpException` fonctionne dans les `catch` blocks
      const error = new HttpException("Test");
      expect(error instanceof HttpException).toBe(true);
    });
  });

  // --- 2. Tests pour formatChannelName ---
  describe("formatChannelName", () => {
    it("doit formater correctement une ressource et une méthode standard", () => {
      const result = formatChannelName("users", "GET");
      expect(result).toBe("users:get");
    });

    it("doit gérer la casse (tout convertir en minuscule)", () => {
      const result = formatChannelName("Settings", "Post");
      expect(result).toBe("settings:post");
    });

    it("doit gérer les caractères spéciaux si nécessaire", () => {
      const result = formatChannelName("api/v1/data", "DELETE");
      expect(result).toBe("api/v1/data:delete");
    });
  });

  // --- 3. Tests pour createResponse (Success) ---
  describe("createResponse", () => {
    it("doit créer une structure de réponse de succès standard", () => {
      const data = { id: 1, name: "Test" };
      const response = createResponse(data);

      expect(response.status).toBe(HttpStatus.OK);
      expect(response.data).toEqual(data);
      expect(response.error).toBeNull();
      // Vérifie que le timestamp est une date ISO valide
      expect(new Date(response.timestamp).toISOString()).toBe(
        response.timestamp
      );
    });

    it("doit accepter un code de statut personnalisé", () => {
      const response = createResponse({ created: true }, HttpStatus.CREATED);
      expect(response.status).toBe(HttpStatus.CREATED);
    });
  });

  // --- 4. Tests pour createErrorResponse ---
  describe("createErrorResponse", () => {
    it("doit créer une structure de réponse d'erreur standard", () => {
      const msg = "Accès interdit";
      const response = createErrorResponse(msg, HttpStatus.UNAUTHORIZED);

      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(response.data).toBeNull();
      expect(response.error).not.toBeNull();
      expect(response.error?.message).toBe(msg);
      // Le mock renvoie le nom de la clé si disponible, ou 0.
      // Ici, on vérifie juste que la structure existe.
      expect(response.error?.code).toBeDefined();
    });

    it("doit inclure les détails de l'erreur si fournis", () => {
      const details = { retryAfter: 300 };
      const response = createErrorResponse("Trop de requêtes", 429, details);

      expect(response.error?.details).toEqual(details);
    });
  });

  // --- 5. Tests pour unwrapResult ---
  describe("unwrapResult", () => {
    it("doit retourner les données (data) si le statut est un succès", async () => {
      const successData = { result: "ok" };
      const successResponse = createResponse(successData, HttpStatus.OK);

      const result = await unwrapResult(Promise.resolve(successResponse));
      expect(result).toEqual(successData);
    });

    it("doit lancer une HttpException si le statut est une erreur", async () => {
      const errorResponse = createErrorResponse(
        "Introuvable",
        HttpStatus.BAD_REQUEST
      );

      // On s'attend à ce que la promesse soit rejetée
      await expect(
        unwrapResult(Promise.resolve(errorResponse))
      ).rejects.toThrow(HttpException);
    });

    it("doit transférer les détails de l'erreur dans l'exception lancée", async () => {
      const details = { invalidFields: ["password"] };
      const errorResponse = createErrorResponse(
        "Validation failed",
        HttpStatus.BAD_REQUEST,
        details
      );

      try {
        await unwrapResult(Promise.resolve(errorResponse));
      } catch (e) {
        // Assertion manuelle pour vérifier les propriétés de l'erreur catchée
        expect(e).toBeInstanceOf(HttpException);
        if (e instanceof HttpException) {
          expect(e.message).toBe("Validation failed");
          expect(e.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(e.details).toEqual(details);
        }
      }
    });

    it("doit gérer une erreur sans message défini (fallback)", async () => {
      // Simulation d'une réponse mal formée ou erreur générique
      const weirdResponse = {
        data: null,
        error: null, // Pas d'objet error
        status: 500,
        timestamp: new Date().toISOString(),
      };

      await expect(
        unwrapResult(Promise.resolve(weirdResponse))
      ).rejects.toThrow("Erreur IPC inconnue");
    });
  });
});
