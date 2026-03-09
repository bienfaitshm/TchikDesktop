//option.service.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { OptionQuery } from "@/packages/@core/data-access/data-queries";
import {
  Option,
  pruneUndefined,
  TOptionCreate,
} from "@/packages/@core/data-access/db";
import { Sequelize } from "sequelize";

// Constantes de mock
const MOCK_OPTION_ID = "opt-001";
const MOCK_SCHOOL_ID = "sch-001";

// 1. Mocker les dépendances Sequelize
vi.mock("@/packages/@core/data-access/db", () => ({
  Option: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
  pruneUndefined: vi.fn((obj) => obj),
}));

// Mock Helper: Crée une fausse instance Sequelize
const mockModelInstance = (data: any) => ({
  ...data,
  toJSON: () => data,
  update: vi.fn().mockResolvedValue({ ...data, toJSON: () => ({ ...data }) }),
});

describe("OptionQuery", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.mocked(pruneUndefined).mockClear();
  });

  // --- FETCH OPERATIONS ---

  describe("findMany", () => {
    it("should throw validation error if schoolId or yearId is missing", async () => {
      // @ts-ignore
      await expect(
        OptionQuery.findMany({ schoolId: MOCK_SCHOOL_ID })
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
        optionCode: "SCI",
      });

      const queryArgs = {
        schoolId: MOCK_SCHOOL_ID,
        params: { optionCode: "SCI" },
      };

      // Act
      const result = await OptionQuery.findMany(queryArgs);

      // Assert
      expect(pruneUndefined).toHaveBeenCalled();
      expect(Option.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            schoolId: MOCK_SCHOOL_ID,
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
        OptionQuery.findMany({
          schoolId: MOCK_SCHOOL_ID,
        })
      ).rejects.toThrow(
        "Service unavailable: Unable to retrieve academic options."
      );
    });
  });

  describe(".findById", () => {
    it("should return the option DTO if found", async () => {
      // Arrange
      const mockOption = mockModelInstance({
        optionId: MOCK_OPTION_ID,
        optionName: "Info",
      });
      vi.mocked(Option.findByPk).mockResolvedValue(mockOption as any);

      // Act
      const result = await OptionQuery.findById(MOCK_OPTION_ID);

      // Assert
      expect(Option.findByPk).toHaveBeenCalledWith(MOCK_OPTION_ID);
      expect(result?.optionName).toBe("Info");
    });

    it("should return null if ID is empty or not found", async () => {
      vi.mocked(Option.findByPk).mockResolvedValue(null);

      expect(await OptionQuery.findById("")).toBeNull();
      expect(await OptionQuery.findById("non-existent")).toBeNull();
    });

    it("should throw a service error on DB failure", async () => {
      vi.mocked(Option.findByPk).mockRejectedValue(new Error("DB error"));
      await expect(OptionQuery.findById(MOCK_OPTION_ID)).rejects.toThrow(
        `Service unavailable: Unable to fetch option details.`
      );
    });
  });

  // --- MUTATION OPERATIONS ---

  describe("create", () => {
    it("should create and return the new option DTO", async () => {
      // Arrange
      const payload = {
        optionName: "New Opt",
        schoolId: MOCK_SCHOOL_ID,
      } as TOptionCreate;
      const createdMock = mockModelInstance({
        ...payload,
        optionId: MOCK_OPTION_ID,
      });
      vi.mocked(Option.create).mockResolvedValue(createdMock as any);

      // Act
      const result = await OptionQuery.create(payload);

      // Assert
      expect(Option.create).toHaveBeenCalledWith(payload);
      expect(result.optionId).toBe(MOCK_OPTION_ID);
    });

    it("should propagate error on creation failure (e.g., validation error)", async () => {
      const dbError = new Error("Validation failed");
      vi.mocked(Option.create).mockRejectedValue(dbError);

      await expect(OptionQuery.create({} as TOptionCreate)).rejects.toThrow(
        dbError
      );
    });
  });

  describe("update", () => {
    it("should find, update, and return the updated option DTO", async () => {
      // Arrange
      const existingOption = mockModelInstance({
        optionId: MOCK_OPTION_ID,
        optionName: "Old Name",
      });
      existingOption.update = vi.fn().mockResolvedValue(
        mockModelInstance({
          optionId: MOCK_OPTION_ID,
          optionName: "New Name",
        })
      );

      vi.mocked(Option.findByPk).mockResolvedValue(existingOption as any);

      // Act
      const result = await OptionQuery.update(MOCK_OPTION_ID, {
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
      const result = await OptionQuery.update("999", {
        optionName: "Test",
      });
      expect(result).toBeNull();
    });

    it("should return null if optionId is empty", async () => {
      expect(await OptionQuery.update("", { optionName: "Test" })).toBeNull();
    });
  });

  describe("delete", () => {
    it("should return true if deletion was successful (row count > 0)", async () => {
      vi.mocked(Option.destroy).mockResolvedValue(1); // 1 row affected
      const result = await OptionQuery.delete(MOCK_OPTION_ID);

      expect(Option.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { optionId: MOCK_OPTION_ID } })
      );
      expect(result).toBe(true);
    });

    it("should return false if option not found (row count 0)", async () => {
      vi.mocked(Option.destroy).mockResolvedValue(0);
      const result = await OptionQuery.delete("999");
      expect(result).toBe(false);
    });

    it("should throw service error on DB failure (e.g., FK constraint)", async () => {
      vi.mocked(Option.destroy).mockRejectedValue(
        new Error("Foreign Key Violation")
      );
      await expect(OptionQuery.delete(MOCK_OPTION_ID)).rejects.toThrow(
        "Delete operation failed, check related data constraints."
      );
    });

    it("should return false if optionId is empty", async () => {
      expect(await OptionQuery.delete("")).toBe(false);
    });
  });
});
