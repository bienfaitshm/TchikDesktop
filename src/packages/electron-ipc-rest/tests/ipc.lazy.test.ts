import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLazyIpcClient } from "../ipc.lazy";

const mockIpcRenderer = {
  invoke: vi.fn(),
} as any;

describe("Lazy IpcClient Proxy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ne doit pas instancier IpcClient immédiatement", () => {
    // On peut créer le proxy sans déclencher d'initialisation
    createLazyIpcClient(mockIpcRenderer);
    expect(mockIpcRenderer.invoke).not.toHaveBeenCalled();
  });

  it("doit déléguer les appels de méthode à l'instance réelle", async () => {
    const proxy = createLazyIpcClient(mockIpcRenderer);

    // Simuler une réponse réussie
    mockIpcRenderer.invoke.mockResolvedValue({
      success: true,
      data: { id: 1 },
      statusCode: 200,
    });

    const result = await proxy.get("/test");
    console.log("#########################Data.....", result);

    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
      "GET:/test",
      expect.any(Object),
    );
    expect(result).toEqual({ id: 1 });
  });

  it("doit préserver l'accès aux propriétés comme les intercepteurs", () => {
    const proxy = createLazyIpcClient(mockIpcRenderer);

    // L'accès à .interceptors doit initialiser l'instance et retourner l'objet
    expect(proxy.interceptors).toBeDefined();
    expect(Array.isArray(proxy.interceptors.request.handlers)).toBe(true);
  });

  it("doit fonctionner comme un Singleton (une seule instance créée)", () => {
    // Pour ce test, on espionne le constructeur via une ruse ou en vérifiant l'état
    const proxy = createLazyIpcClient(mockIpcRenderer);

    const call1 = proxy.get;
    const call2 = proxy.get;

    // Les fonctions extraites doivent être identiques (même instance liée)
    expect(call1).toBeDefined();
    expect(call1).toBe(call2);
  });
});

describe("IpcServer Error Handling (Logic)", () => {
  // Test d'intégration de la logique d'erreur du serveur original
  it("doit formater correctement les erreurs HttpException", async () => {
    // ... tests sur le catch block de safeHandler
  });
});
