/**
 * @file ipc.spec.ts
 * @description Suite de tests unitaires pour l'abstraction IPC.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { IpcServer, IpcClient } from "../ipc";
import { HttpMethod, HttpStatus } from "../constant";
import type { IpcMainInvokeEvent } from "electron";
import { HttpException } from "../utils";

// --- MOCKS ---

const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
} as unknown as Electron.IpcMain;

const mockIpcRenderer = {
  invoke: vi.fn(),
} as unknown as any;

const mockEvent = {
  sender: {},
} as IpcMainInvokeEvent;

// --- TESTS SERVER ---

describe("IpcServer", () => {
  let server: IpcServer;

  beforeEach(() => {
    vi.clearAllMocks();
    // Nous supposons que le constructeur de IpcServer utilise l'instance mockée
    server = new IpcServer(mockIpcMain);
  });

  it("devrait enregistrer un handler et appeler ipcMain.handle", () => {
    server.get("/test", () => "ok");
    server.listen();

    // CORRECTION 1: Le format est `/resource:method` et tout en minuscule, ex: "/test:get"
    expect(mockIpcMain.handle).toHaveBeenCalledWith(
      "/test:get", // <-- CORRIGÉ
      expect.any(Function)
    );
  });

  it("devrait exécuter le handler et retourner une réponse formatée", async () => {
    const handlerSpy = vi.fn().mockReturnValue("success");
    server.post("/data", handlerSpy);
    server.listen();

    // Récupérer la fonction passée à handle()
    const registeredHandler = (mockIpcMain.handle as any).mock.calls[0][1];

    // Simuler un appel
    const payload = { data: { id: 1 }, params: {}, headers: {} };
    // Le serveur de test est initialisé sans browserWindow, donc context.window sera null
    const response = await registeredHandler(mockEvent, payload);

    expect(handlerSpy).toHaveBeenCalled();
    // CORRECTION 2: Ajouter `timestamp` à la vérification car `createResponse` l'inclut.
    expect(response).toEqual(
      expect.objectContaining({
        data: "success",
        status: HttpStatus.OK,
        error: null,
        timestamp: expect.any(String), // Ajout de la vérification du timestamp
      })
    );
  });

  it("devrait attraper les HttpException et retourner une structure d’erreur", async () => {
    server.get("/error", () => {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN);
    });
    server.listen();

    const registeredHandler = (mockIpcMain.handle as any).mock.calls[0][1];
    const response = await registeredHandler(mockEvent, {});

    expect(response.status).toBe(HttpStatus.FORBIDDEN);
    // CORRECTION 3: Vérifier l'objet structuré `error` au lieu d'une simple chaîne.
    expect(response.error).toEqual(
      expect.objectContaining({
        message: "Forbidden",
        code: expect.anything(), // Code est la clé de l'enum (ex: 'FORBIDDEN')
        details: undefined,
      })
    );
  });
});

// --- TESTS CLIENT ---

describe("IpcClient", () => {
  let client: IpcClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new IpcClient(mockIpcRenderer);
  });

  it("devrait envoyer une requête formatée correctement", async () => {
    // Le mock doit simuler la structure de réponse complète (data, error, status, timestamp)
    mockIpcRenderer.invoke.mockResolvedValue({
      data: "pong",
      status: 200,
      error: null,
      timestamp: new Date().toISOString(),
    });

    const result = await client.get("/ping");

    // CORRECTION 4: Le format du canal attendu est "/ping:get"
    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
      "/ping:get", // <-- CORRIGÉ
      expect.objectContaining({
        method: HttpMethod.GET,
        route: "/ping",
      })
    );
    expect(result).toBe("pong");
  });

  it("devrait exécuter les intercepteurs de requête", async () => {
    client.interceptors.request.use((req) => {
      // Les headers dans le payload client peuvent être 'string' ou 'unknown' selon la définition
      (req.headers as Record<string, string>)["Authorization"] = "Bearer token";
      return req;
    });

    // Le mock doit simuler la structure de réponse complète
    mockIpcRenderer.invoke.mockResolvedValue({
      data: "ok",
      status: 200,
      error: null,
      timestamp: new Date().toISOString(),
    });

    await client.post("/auth", {});

    const calledPayload = mockIpcRenderer.invoke.mock.calls[0][1];
    expect(calledPayload.headers["Authorization"]).toBe("Bearer token");
  });

  it("devrait throw une erreur si le serveur répond avec une erreur", async () => {
    // CORRECTION 5: Le mock doit renvoyer l'objet d'erreur structuré (IResponse)
    mockIpcRenderer.invoke.mockResolvedValue({
      data: null,
      status: 404,
      error: {
        // <-- DOIT ÊTRE UN OBJET STRUCTURÉ
        message: "Not Found",
        code: 404, // ou le nom de l'enum
        details: undefined,
      },
      timestamp: new Date().toISOString(),
    });

    // unwrapResult va extraire "Not Found" de error.message et le lancer.
    await expect(client.get("/unknown")).rejects.toThrow("Not Found");
  });
});
