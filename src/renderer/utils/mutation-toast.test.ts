import { describe, it, expect, vi, beforeEach, Mock } from "vitest"; // ou 'jest'
import { toast } from "sonner";
import { withNotifications } from "./mutation-toast";

// On mock la librairie sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("withNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Comportement en cas de Succès", () => {
    it("devrait afficher le toast de succès par défaut", () => {
      const options = withNotifications({});

      // On simule l'appel par React Query
      options.onSuccess?.("data", "vars", "onMutation", "context");

      expect(toast.success).toHaveBeenCalledWith("Opération réussie !", {
        description: "L'opération a été effectuée avec succès.",
      });
    });

    it("devrait afficher des messages de succès personnalisés", () => {
      const options = withNotifications({
        successMessageTitle: "Super !",
        successMessageDescription: "C'est dans la boîte.",
      });

      options.onSuccess?.("data", "vars", "onMutation", "context");

      expect(toast.success).toHaveBeenCalledWith("Super !", {
        description: "C'est dans la boîte.",
      });
    });

    it("ne devrait pas afficher de toast si showSuccessNotification est false", () => {
      const options = withNotifications({ showSuccessNotification: false });

      options.onSuccess?.("data", "vars", "onMutation", "context");

      expect(toast.success).not.toHaveBeenCalled();
    });

    it("devrait exécuter le onSuccess original fourni par le développeur", () => {
      const mockOriginalOnSuccess = vi.fn();
      const options = withNotifications({ onSuccess: mockOriginalOnSuccess });

      options.onSuccess?.("ma-data", "mes-vars", "onMutation", "mon-context");

      expect(mockOriginalOnSuccess).toHaveBeenCalledWith(
        "ma-data",
        "mes-vars",
        "onMutation",
        "mon-context",
      );
      expect(toast.success).toHaveBeenCalled();
    });
  });

  describe("Comportement en cas d'Erreur", () => {
    it("devrait extraire dynamiquement le message de l'objet Error", () => {
      const options = withNotifications({});
      const myError = new Error("Erreur serveur 500");

      options.onError?.(myError, "vars", "onMutation", "context");

      expect(toast.error).toHaveBeenCalledWith("Une erreur est survenue.", {
        description: "Erreur serveur 500", // Extrait automatiquement
      });
    });

    it("devrait utiliser le fallback si l'erreur n'est pas une instance de Error", () => {
      const options = withNotifications({});

      // Simulation d'une erreur mal formattée retournée par une API
      options.onError?.(
        "Erreur string bizarre",
        "vars",
        "onMutation",
        "context",
      );

      expect(toast.error).toHaveBeenCalledWith("Une erreur est survenue.", {
        description:
          "Veuillez réessayer ultérieurement. Si le problème persiste, contactez le support.",
      });
    });

    it("devrait donner la priorité à errorMessageDescription sur le message de l'objet Error", () => {
      const options = withNotifications({
        errorMessageDescription: "Message forcé",
      });
      const myError = new Error("Ce message doit être ignoré");

      options.onError?.(myError, "vars", "onMutation", "context");

      expect(toast.error).toHaveBeenCalledWith("Une erreur est survenue.", {
        description: "Message forcé",
      });
    });

    it("devrait exécuter le onError original fourni par le développeur", () => {
      const mockOriginalOnError = vi.fn();
      const options = withNotifications({ onError: mockOriginalOnError });
      const myError = new Error("Test");

      options.onError?.(myError, "vars", "onMutation", "context");

      expect(mockOriginalOnError).toHaveBeenCalledWith(
        myError,
        "vars",
        "context",
      );
    });
  });

  describe("Comportement des autres options (Rest operator)", () => {
    it("devrait passer correctement onSettled et onMutate", () => {
      const mockOnSettled = vi.fn();
      const mockOnMutate = vi.fn();

      const options = withNotifications({
        onSettled: mockOnSettled,
        onMutate: mockOnMutate,
      });

      expect(options.onSettled).toBeDefined();
      expect(options.onMutate).toBeDefined();
    });
  });
});
