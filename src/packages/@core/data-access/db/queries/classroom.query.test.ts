// classroom.service.test.ts

import { describe, it, expect, vi, afterEach } from "vitest";
import { ClassroomQuery } from "@/packages/@core/data-access/data-queries"; // Assurez-vous que l'alias est correct
import {
  ClassRoom,
  Option,
  StudyYear,
  TClassroomInsert,
} from "@/packages/@core/data-access/db";
import { pruneUndefined } from "@/main/db/models/utils";

// Constantes de mock
const MOCK_CLASS_ID = "cls-123";
const MOCK_SCHOOL_ID = "sch-1";
const MOCK_YEAR_ID = "yr-2025";

// Mocker les dépendances Sequelize
vi.mock("@/packages/@core/data-access/db", () => ({
  ClassRoom: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
  Option: {},
  StudyYear: {},
}));

// Mocker l'utilitaire de nettoyage pour la simplicité du test
vi.mock("@/main/db/models/utils", () => ({
  pruneUndefined: vi.fn((obj) => obj),
}));

// Mock Helper: Crée une fausse instance Sequelize avec .toJSON() et .update()
const mockModelInstance = (data: any) => ({
  ...data,
  toJSON: () => data,
  update: vi.fn().mockResolvedValue({ ...data, toJSON: () => ({ ...data }) }),
});

describe("ClassroomQuery", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks(); // Rétablit les mocks si vous utilisez un mock global
  });

  // --- FETCH OPERATIONS ---

  describe("getClassrooms", () => {
    it("should call findAll with correct filtering, inclusion, ordering, and pagination", async () => {
      // Arrange
      const mockClassRoom = mockModelInstance({
        classId: MOCK_CLASS_ID,
        identifier: "A1",
      });
      vi.mocked(ClassRoom.findAll).mockResolvedValue([mockClassRoom] as any);
      vi.mocked(pruneUndefined).mockReturnValue({ schoolId: MOCK_SCHOOL_ID });

      const filters = {
        schoolId: MOCK_SCHOOL_ID,
        limit: 10,
        offset: 5,
        orderBy: "identifier" as const, // Ignoré dans la requête DB mais inclus ici
        order: "ASC" as const,
      };

      // Act
      const result = await ClassroomQuery.findMany(filters);

      // Assert
      expect(pruneUndefined).toHaveBeenCalledWith(
        expect.objectContaining({ schoolId: MOCK_SCHOOL_ID })
      );
      expect(ClassRoom.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schoolId: MOCK_SCHOOL_ID },
          include: [Option, StudyYear],
          limit: 10,
          offset: 5,
          order: expect.any(Array), // Tri standard vérifié
        })
      );
      expect(result).toHaveLength(1);
    });

    it("should throw a service error on DB failure", async () => {
      vi.mocked(ClassRoom.findAll).mockRejectedValue(
        new Error("DB Connection Error")
      );

      await expect(
        ClassroomQuery.findMany({ schoolId: MOCK_SCHOOL_ID })
      ).rejects.toThrow("Service unavailable: Unable to retrieve classrooms.");
    });
  });

  describe("getClassroomById", () => {
    it("should return the classroom DTO with relations if found", async () => {
      // Arrange
      const mockClassRoom = mockModelInstance({
        classId: MOCK_CLASS_ID,
        identifier: "B1",
      });
      vi.mocked(ClassRoom.findByPk).mockResolvedValue(mockClassRoom as any);

      // Act
      const result = await ClassroomQuery.findById(MOCK_CLASS_ID);

      // Assert
      expect(ClassRoom.findByPk).toHaveBeenCalledWith(MOCK_CLASS_ID, {
        include: [Option, StudyYear],
      });
      expect(result?.classId).toBe(MOCK_CLASS_ID);
    });

    it("should return null if ID is empty or not found", async () => {
      vi.mocked(ClassRoom.findByPk).mockResolvedValue(null);

      expect(await ClassroomQuery.findById("")).toBeNull();
      expect(await ClassroomQuery.findById("non-existent")).toBeNull();
    });
  });

  // --- MUTATION OPERATIONS ---

  describe("createClassroom", () => {
    it("should create and return the new classroom DTO", async () => {
      // Arrange
      const payload = {
        identifier: "C2",
        schoolId: MOCK_SCHOOL_ID,
        studyYearId: MOCK_YEAR_ID,
      } as unknown as TClassroomInsert;
      const createdMock = mockModelInstance({ ...payload, classId: "new-id" });
      vi.mocked(ClassRoom.create).mockResolvedValue(createdMock as any);

      // Act
      const result = await ClassroomQuery.create(payload);

      // Assert
      expect(ClassRoom.create).toHaveBeenCalledWith(payload);
      expect(result.classId).toBe("new-id");
    });
  });

  describe("updateClassroom", () => {
    it("should update and return the updated classroom DTO", async () => {
      // Arrange
      const existingClass = mockModelInstance({
        classId: MOCK_CLASS_ID,
        identifier: "Old",
      });
      existingClass.update = vi
        .fn()
        .mockResolvedValue(
          mockModelInstance({ classId: MOCK_CLASS_ID, identifier: "New" })
        );

      vi.mocked(ClassRoom.findByPk).mockResolvedValue(existingClass as any);

      // Act
      const result = await ClassroomQuery.update(MOCK_CLASS_ID, {
        identifier: "New",
      });

      // Assert
      expect(existingClass.update).toHaveBeenCalledWith({ identifier: "New" });
      expect(result?.identifier).toBe("New");
    });

    it("should return null if classroom ID is not found", async () => {
      vi.mocked(ClassRoom.findByPk).mockResolvedValue(null);

      const result = await ClassroomQuery.update("999", {
        identifier: "Test",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteClassroom", () => {
    it("should return true if deletion was successful (row count > 0)", async () => {
      vi.mocked(ClassRoom.destroy).mockResolvedValue(1); // 1 row affected
      const result = await ClassroomQuery.delete(MOCK_CLASS_ID);

      expect(ClassRoom.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { classId: MOCK_CLASS_ID } })
      );
      expect(result).toBe(true);
    });

    it("should throw service error on DB constraint failure", async () => {
      vi.mocked(ClassRoom.destroy).mockRejectedValue(
        new Error("FK Constraint Error")
      );
      await expect(ClassroomQuery.delete(MOCK_CLASS_ID)).rejects.toThrow(
        "Delete operation failed, check related constraints."
      );
    });
  });
});
