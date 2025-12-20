// school.service.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  SchoolQuery,
  StudyYearQuery,
} from "@/packages/@core/data-access/data-queries";
import { School, StudyYear } from "@/packages/@core/data-access/db";

// 1. Mocker les dépendances (Sequelize Models)
vi.mock("@/packages/@core/data-access/db", () => ({
  School: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
  StudyYear: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
}));

// Mock Helper: Crée une fausse instance Sequelize avec méthodes .toJSON() et .update()
const mockModelInstance = (data: any) => ({
  ...data,
  toJSON: () => data,
  update: vi.fn().mockResolvedValue({
    ...data,
    ...data /* simule update */,
    toJSON: () => data,
  }),
});

describe("SchoolQuery", () => {
  afterEach(() => {
    vi.clearAllMocks(); // Nettoyer les mocks entre chaque test
  });

  describe("findSchools", () => {
    it("should return a list of schools when DB is healthy", async () => {
      // Arrange
      const mockSchools = [
        mockModelInstance({ schoolId: "1", name: "Polytech" }),
      ];
      vi.mocked(School.findAll).mockResolvedValue(mockSchools as any);

      // Act
      const result = await SchoolQuery.findMany({ name: "Polytech" });

      // Assert
      expect(School.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { name: "Polytech" },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Polytech");
    });

    it("should throw a formatted error when DB fails", async () => {
      vi.mocked(School.findAll).mockRejectedValue(
        new Error("DB connection lost")
      );

      await expect(SchoolQuery.findMany()).rejects.toThrow(
        "Service unavailable: Unable to retrieve schools."
      );
    });
  });

  describe("create", () => {
    it("should create and return a school", async () => {
      const payload = {
        name: "New School",
        town: "L'shi",
        adress: "Test",
      } as any;
      const createdMock = mockModelInstance({ ...payload, schoolId: "123" });

      vi.mocked(School.create).mockResolvedValue(createdMock as any);

      const result = await SchoolQuery.create(payload);

      expect(School.create).toHaveBeenCalledWith(payload);
      expect(result.schoolId).toBe("123");
    });
  });

  describe("update", () => {
    it("should update school if exists", async () => {
      const existingSchool = mockModelInstance({
        schoolId: "1",
        name: "Old Name",
      });
      // On simule que l'update retourne la nouvelle valeur
      existingSchool.update = vi
        .fn()
        .mockResolvedValue(
          mockModelInstance({ schoolId: "1", name: "New Name" })
        );

      vi.mocked(School.findByPk).mockResolvedValue(existingSchool as any);

      const result = await SchoolQuery.update("1", {
        name: "New Name",
      });

      expect(existingSchool.update).toHaveBeenCalledWith({ name: "New Name" });
      expect(result?.name).toBe("New Name");
    });

    it("should return null if school ID does not exist", async () => {
      vi.mocked(School.findByPk).mockResolvedValue(null);

      const result = await SchoolQuery.update("999", { name: "Test" });

      expect(result).toBeNull();
    });
  });

  describe("findMany", () => {
    it("should throw strict error if schoolId is missing", async () => {
      // @ts-ignore force null pour tester le runtime check
      await expect(StudyYearQuery.findMany({ schoolId: null })).rejects.toThrow(
        "Validation Error: schoolId is required"
      );
    });

    it("should return years sorted by name and date", async () => {
      const mockYears = [mockModelInstance({ yearId: "y1", yearName: "2024" })];
      vi.mocked(StudyYear.findAll).mockResolvedValue(mockYears as any);

      const result = await StudyYearQuery.findMany({ schoolId: "school-1" });

      expect(StudyYear.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schoolId: "school-1" },
          order: expect.arrayContaining([
            expect.arrayContaining(["startDate", "ASC"]),
          ]),
        })
      );
      expect(result).toHaveLength(1);
    });
  });
});
