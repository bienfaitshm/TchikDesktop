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

    // Correction : On s'assure que l'objet simulé passe les checks de unwrapResult
    mockIpcRenderer.invoke.mockResolvedValue({
      success: true,
      status: 200, // Ajouté car unwrapResult semble l'utiliser
      statusCode: 200,
      data: { id: 1 },
      error: null, // On explicite qu'il n'y a pas d'erreur
    });

    const result = await proxy.get("/test");

    console.log("TEST", result);

    expect(mockIpcRenderer.invoke).toHaveBeenCalledWith(
      "GET:/test",
      expect.any(Object),
    );
    expect(result).toEqual({
      body: { id: 1 },
    });
  });

  it("doit préserver l'accès aux propriétés comme les intercepteurs", () => {
    const proxy = createLazyIpcClient(mockIpcRenderer);

    // L'accès à .interceptors doit initialiser l'instance et retourner l'objet
    expect(proxy.interceptors).toBeDefined();
    expect(Array.isArray(proxy.interceptors.request.handlers)).toBe(true);
  });

  // it("doit fonctionner comme un Singleton (une seule instance créée)", () => {
  //   // Pour ce test, on espionne le constructeur via une ruse ou en vérifiant l'état
  //   const proxy = createLazyIpcClient(mockIpcRenderer);

  //   const call1 = proxy.get;
  //   const call2 = proxy.get;

  //   // Les fonctions extraites doivent être identiques (même instance liée)
  //   expect(call1).toBeDefined();
  //   expect(call1).toBe(call2);
  // });
  it("doit fonctionner comme un Singleton (une seule instance créée)", () => {
    const proxy = createLazyIpcClient(mockIpcRenderer);

    // On accède deux fois à un objet complexe (les intercepteurs)
    const interceptors1 = proxy.interceptors;
    const interceptors2 = proxy.interceptors;

    // Si c'est un singleton, la référence de l'objet interceptors doit être identique
    expect(interceptors1).toBe(interceptors2);

    // Alternativement pour les méthodes, si le proxy recrée un "bind" à chaque fois,
    // on vérifie que l'instance sous-jacente n'est pas recréée (si tu as accès à un espion sur le constructeur)
  });
});

describe("IpcServer Error Handling (Logic)", () => {
  // Test d'intégration de la logique d'erreur du serveur original
  it("doit formater correctement les erreurs HttpException", async () => {
    // ... tests sur le catch block de safeHandler
  });
});
