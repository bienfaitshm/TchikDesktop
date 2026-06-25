import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SelectOptionTransformer,
  SelectOptionFacade,
  DataToOptionConfig,
  OptionProvider,
} from "./select-option.transformer";
import { CustomLogger } from "@/packages/logger";

/**
 * Entité de test représentant la donnée brute
 */
interface MockUser {
  id: number;
  firstName: string;
  lastName: string;
  employeeId: string;
}

describe("SelectOption Architecture Tests", () => {
  const mockUsers: MockUser[] = [
    { id: 1, firstName: "John", lastName: "Doe", employeeId: "EMP001" },
    { id: 2, firstName: "Jane", lastName: "Smith", employeeId: "EMP002" },
  ];

  const baseConfig: DataToOptionConfig<MockUser> = {
    valueKey: "id",
    labelKeyLong: "lastName",
    labelKeyShort: "employeeId",
  };

  // ==========================================
  // SUITE 1 : SelectOptionTransformer (Pure)
  // ==========================================
  describe("SelectOptionTransformer", () => {
    it("should return an empty array when input data is empty or null", () => {
      expect(SelectOptionTransformer.transformMany([], baseConfig)).toEqual([]);
      expect(
        SelectOptionTransformer.transformMany(null as any, baseConfig),
      ).toEqual([]);
    });

    it("should format labels as 'combined' by default", () => {
      const result = SelectOptionTransformer.transformMany(
        mockUsers,
        baseConfig,
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ value: "1", label: "Doe (EMP001)" });
      expect(result[1]).toEqual({ value: "2", label: "Smith (EMP002)" });
    });

    it("should format labels using 'long' strategy only", () => {
      const config: DataToOptionConfig<MockUser> = {
        ...baseConfig,
        labelFormat: "long",
      };
      const result = SelectOptionTransformer.transformMany(mockUsers, config);

      expect(result[0].label).toBe("Doe");
    });

    it("should format labels using 'short' strategy only", () => {
      const config: DataToOptionConfig<MockUser> = {
        ...baseConfig,
        labelFormat: "short",
      };
      const result = SelectOptionTransformer.transformMany(mockUsers, config);

      expect(result[0].label).toBe("EMP001");
    });

    it("should fallback to 'N/A' or available field if one key is missing/null", () => {
      const brokenData: MockUser[] = [
        { id: 3, firstName: "No", lastName: "", employeeId: "" },
      ];
      const result = SelectOptionTransformer.transformMany(
        brokenData,
        baseConfig,
      );

      expect(result[0].label).toBe("N/A");
    });

    it("should apply custom transform function if provided", () => {
      const config: DataToOptionConfig<
        MockUser,
        { value: string; label: string; extra: string }
      > = {
        ...baseConfig,
        transform: (baseOption, originalItem) => ({
          ...baseOption,
          extra: `Firstname: ${originalItem.firstName}`,
        }),
      };

      const result = SelectOptionTransformer.transformMany(mockUsers, config);

      expect(result[0]).toEqual({
        value: "1",
        label: "Doe (EMP001)",
        extra: "Firstname: John",
      });
    });
  });

  // ==========================================
  // SUITE 2 : SelectOptionFacade (Coordination)
  // ==========================================
  describe("SelectOptionFacade", () => {
    let mockProvider: OptionProvider<MockUser>;
    let mockLogger: CustomLogger;

    beforeEach(() => {
      mockProvider = {
        fetchOptions: vi.fn().mockResolvedValue(mockUsers),
      };

      mockLogger = {
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
      } as unknown as CustomLogger;
    });

    it("should successfully load and transform options", async () => {
      const facade = new SelectOptionFacade(
        mockProvider,
        baseConfig,
        mockLogger,
      );
      const searchArgs = { search: "Doe", filters: { active: true } };

      const result = await facade.loadOptions(searchArgs);

      // Vérifie que le provider a été appelé avec les bons arguments de recherche
      expect(mockProvider.fetchOptions).toHaveBeenCalledWith(searchArgs);
      expect(mockProvider.fetchOptions).toHaveBeenCalledTimes(1);

      // Vérifie le résultat final transformé
      expect(result).toHaveLength(2);
      expect(result[0].label).toBe("Doe (EMP001)");
    });

    it("should handle errors gracefully, log them, and return an empty array", async () => {
      const apiError = new Error("Network Timeout");
      // On force le mock à rejeter (erreur d'API)
      mockProvider.fetchOptions = vi.fn().mockRejectedValue(apiError);

      const facade = new SelectOptionFacade(
        mockProvider,
        baseConfig,
        mockLogger,
      );
      const result = await facade.loadOptions({ search: "fail" });

      // L'UI ne doit pas crasher, elle reçoit un tableau vide
      expect(result).toEqual([]);

      // Le logger doit avoir enregistré l'erreur critique
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Failed to load select options:",
        apiError,
      );
    });

    it("should fallback to console.error if no logger is injected", async () => {
      const apiError = new Error("Database Crash");
      mockProvider.fetchOptions = vi.fn().mockRejectedValue(apiError);

      // Espion sur le console.error global
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Instance sans logger passé au constructeur
      const facade = new SelectOptionFacade(mockProvider, baseConfig);
      await facade.loadOptions();

      expect(consoleSpy).toHaveBeenCalledWith(
        "[SelectOptionFacade] Failed to load select options:",
        apiError,
      );

      consoleSpy.mockRestore();
    });
  });
});
