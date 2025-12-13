//option.service.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { OptionService } from "@/main/db/services/option.service";
import { Option } from "@/main/db/models";
import { pruneUndefined } from "@/main/db/models/utils";
import { Sequelize } from "sequelize";
import { TOptionInsert } from "@/commons/types/models";

// Constantes de mock
const MOCK_OPTION_ID = "opt-001";
const MOCK_SCHOOL_ID = "sch-001";
const MOCK_YEAR_ID = "yr-2025";

// 1. Mocker les dépendances Sequelize
vi.mock("@/main/db/models", () => ({
  Option: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
}));

// 2. Mocker les utilitaires pour la simplicité du test
vi.mock("@/main/db/models/utils", () => ({
  pruneUndefined: vi.fn((obj) => obj),
}));

// Mock Helper: Crée une fausse instance Sequelize
const mockModelInstance = (data: any) => ({
  ...data,
  toJSON: () => data,
  update: vi.fn().mockResolvedValue({ ...data, toJSON: () => ({ ...data }) }),
});

describe("OptionService", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.mocked(pruneUndefined).mockClear();
  });

  // --- FETCH OPERATIONS ---

  describe("getOptions", () => {
    it("should throw validation error if schoolId or yearId is missing", async () => {
      // @ts-ignore
      await expect(
        OptionService.getOptions({ schoolId: MOCK_SCHOOL_ID })
      ).rejects.toThrow("Validation Error");
    });

    it("should call findAll with correct filters and sorting", async () => {
      // Arrange
      const mockOptions = [
        mockModelInstance({ optionId: MOCK_OPTION_ID, optionName: "Bio" }),
      ];
      vi.mocked(Option.findAll).mockResolvedValue(mockOptions as any);
      vi.mocked(pruneUndefined).mockReturnValue({
        schoolId: MOCK_SCHOOL_ID,
        yearId: MOCK_YEAR_ID,
        optionCode: "SCI",
      });

      const queryArgs = {
        schoolId: MOCK_SCHOOL_ID,
        yearId: MOCK_YEAR_ID,
        params: { optionCode: "SCI" },
      };

      // Act
      const result = await OptionService.getOptions(queryArgs);

      // Assert
      expect(pruneUndefined).toHaveBeenCalled();
      expect(Option.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            schoolId: MOCK_SCHOOL_ID,
            yearId: MOCK_YEAR_ID,
            optionCode: "SCI",
          },
          order: [[Sequelize.fn("LOWER", Sequelize.col("option_name")), "ASC"]],
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].optionId).toBe(MOCK_OPTION_ID);
    });

    it("should throw a service error on DB failure", async () => {
      vi.mocked(Option.findAll).mockRejectedValue(new Error("DB timeout"));

      await expect(
        OptionService.getOptions({
          schoolId: MOCK_SCHOOL_ID,
          yearId: MOCK_YEAR_ID,
        })
      ).rejects.toThrow(
        "Service unavailable: Unable to retrieve academic options."
      );
    });
  });

  describe("getOptionById", () => {
    it("should return the option DTO if found", async () => {
      // Arrange
      const mockOption = mockModelInstance({
        optionId: MOCK_OPTION_ID,
        optionName: "Info",
      });
      vi.mocked(Option.findByPk).mockResolvedValue(mockOption as any);

      // Act
      const result = await OptionService.getOptionById(MOCK_OPTION_ID);

      // Assert
      expect(Option.findByPk).toHaveBeenCalledWith(MOCK_OPTION_ID);
      expect(result?.optionName).toBe("Info");
    });

    it("should return null if ID is empty or not found", async () => {
      vi.mocked(Option.findByPk).mockResolvedValue(null);

      expect(await OptionService.getOptionById("")).toBeNull();
      expect(await OptionService.getOptionById("non-existent")).toBeNull();
    });

    it("should throw a service error on DB failure", async () => {
      vi.mocked(Option.findByPk).mockRejectedValue(new Error("DB error"));
      await expect(OptionService.getOptionById(MOCK_OPTION_ID)).rejects.toThrow(
        `Service unavailable: Unable to fetch option details.`
      );
    });
  });

  // --- MUTATION OPERATIONS ---

  describe("createOption", () => {
    it("should create and return the new option DTO", async () => {
      // Arrange
      const payload = {
        optionName: "New Opt",
        schoolId: MOCK_SCHOOL_ID,
      } as TOptionInsert;
      const createdMock = mockModelInstance({
        ...payload,
        optionId: MOCK_OPTION_ID,
      });
      vi.mocked(Option.create).mockResolvedValue(createdMock as any);

      // Act
      const result = await OptionService.createOption(payload);

      // Assert
      expect(Option.create).toHaveBeenCalledWith(payload);
      expect(result.optionId).toBe(MOCK_OPTION_ID);
    });

    it("should propagate error on creation failure (e.g., validation error)", async () => {
      const dbError = new Error("Validation failed");
      vi.mocked(Option.create).mockRejectedValue(dbError);

      await expect(
        OptionService.createOption({} as TOptionInsert)
      ).rejects.toThrow(dbError);
    });
  });

  describe("updateOption", () => {
    it("should find, update, and return the updated option DTO", async () => {
      // Arrange
      const existingOption = mockModelInstance({
        optionId: MOCK_OPTION_ID,
        optionName: "Old Name",
      });
      existingOption.update = vi
        .fn()
        .mockResolvedValue(
          mockModelInstance({
            optionId: MOCK_OPTION_ID,
            optionName: "New Name",
          })
        );

      vi.mocked(Option.findByPk).mockResolvedValue(existingOption as any);

      // Act
      const result = await OptionService.updateOption(MOCK_OPTION_ID, {
        optionName: "New Name",
      });

      // Assert
      expect(existingOption.update).toHaveBeenCalledWith({
        optionName: "New Name",
      });
      expect(result?.optionName).toBe("New Name");
    });

    it("should return null if option ID is not found", async () => {
      vi.mocked(Option.findByPk).mockResolvedValue(null);
      const result = await OptionService.updateOption("999", {
        optionName: "Test",
      });
      expect(result).toBeNull();
    });

    it("should return null if optionId is empty", async () => {
      expect(
        await OptionService.updateOption("", { optionName: "Test" })
      ).toBeNull();
    });
  });

  describe("deleteOption", () => {
    it("should return true if deletion was successful (row count > 0)", async () => {
      vi.mocked(Option.destroy).mockResolvedValue(1); // 1 row affected
      const result = await OptionService.deleteOption(MOCK_OPTION_ID);

      expect(Option.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { optionId: MOCK_OPTION_ID } })
      );
      expect(result).toBe(true);
    });

    it("should return false if option not found (row count 0)", async () => {
      vi.mocked(Option.destroy).mockResolvedValue(0);
      const result = await OptionService.deleteOption("999");
      expect(result).toBe(false);
    });

    it("should throw service error on DB failure (e.g., FK constraint)", async () => {
      vi.mocked(Option.destroy).mockRejectedValue(
        new Error("Foreign Key Violation")
      );
      await expect(OptionService.deleteOption(MOCK_OPTION_ID)).rejects.toThrow(
        "Delete operation failed, check related data constraints."
      );
    });

    it("should return false if optionId is empty", async () => {
      expect(await OptionService.deleteOption("")).toBe(false);
    });
  });
});
