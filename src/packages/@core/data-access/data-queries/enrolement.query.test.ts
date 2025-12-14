import { describe, it, expect, vi, afterEach } from "vitest";
import { EnrolementService } from "@/main/db/services/enrolement.service";
import {
  ClassroomEnrolement,
  User,
  ClassRoom,
  StudyYear,
  pruneUndefined,
} from "@/packages/@core/data-access/db";
import { UserQuery } from "@/packages/@core/data-access/data-queries";

// Constantes de mock
const MOCK_ENROLEMENT_ID = "enrol-001";
const MOCK_USER_ID = "user-123";
const MOCK_CLASS_ID = "cls-456";
const MOCK_SCHOOL_ID = "sch-789";
const MOCK_YEAR_ID = "yr-2025";

// 1. Mocker les dépendances Sequelize
vi.mock("../models", () => ({
  ClassroomEnrolement: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
    // findOne: vi.fn(), // Utilisé par findByPk
  },
  User: {},
  ClassRoom: {},
  StudyYear: {},
}));

// 2. Mocker les dépendances externes
vi.mock("./account", () => ({
  createUser: vi.fn(),
}));

// 3. Mocker les utilitaires
vi.mock("../models/utils", () => ({
  pruneUndefined: vi.fn((obj) => obj),
}));

// Mock Helper: Crée une fausse instance Sequelize
const mockModelInstance = (data: any) => ({
  ...data,
  toJSON: () => data,
  update: vi.fn().mockResolvedValue({ ...data, toJSON: () => ({ ...data }) }),
});

describe("EnrolementService", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.mocked(pruneUndefined).mockClear();
  });

  // --- FETCH OPERATIONS ---

  describe("getEnrolements", () => {
    it("should throw validation error if schoolId or yearId is missing", async () => {
      // @ts-ignore
      await expect(
        EnrolementService.getEnrolements({ schoolId: MOCK_SCHOOL_ID })
      ).rejects.toThrow("Validation Error");
    });

    it("should call findAll with correct includes, filtering on ClassRoom (yearId)", async () => {
      // Arrange
      const mockEnrolements = [
        mockModelInstance({ enrolementId: MOCK_ENROLEMENT_ID }),
      ];
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue(
        mockEnrolements as any
      );
      vi.mocked(pruneUndefined).mockImplementation((obj) => obj); // S'assure que les filtres sont passés

      // Act
      await EnrolementService.getEnrolements({
        schoolId: MOCK_SCHOOL_ID,
        yearId: MOCK_YEAR_ID,
        params: { studentId: MOCK_USER_ID },
      });

      // Assert
      expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schoolId: MOCK_SCHOOL_ID, studentId: MOCK_USER_ID },
          include: expect.arrayContaining([
            expect.objectContaining({
              model: ClassRoom,
              where: { yearId: MOCK_YEAR_ID }, // Filtre yearId appliqué à ClassRoom
              required: true,
              include: [StudyYear],
            }),
            User,
          ]),
        })
      );
    });
  });

  describe("getEnrolementHistory", () => {
    it("should call findAll with filtering on ClassRoom and StudyYear when yearId is provided", async () => {
      // Arrange
      vi.mocked(pruneUndefined).mockImplementation((obj) => obj);
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue([] as any);

      // Act
      await EnrolementService.getEnrolementHistory({
        schoolId: MOCK_SCHOOL_ID,
        yearId: MOCK_YEAR_ID,
        classId: MOCK_CLASS_ID,
      });

      // Assert
      expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { schoolId: MOCK_SCHOOL_ID, classId: MOCK_CLASS_ID }, // where sur ClassroomEnrolement
          include: expect.arrayContaining([
            expect.objectContaining({
              model: ClassRoom,
              required: true,
              include: [
                expect.objectContaining({
                  model: StudyYear,
                  required: true,
                  where: { yearId: MOCK_YEAR_ID }, // Filtre sur StudyYear
                }),
              ],
            }),
          ]),
        })
      );
    });
  });

  // --- MUTATION OPERATIONS ---

  describe("createEnrolement", () => {
    it("should create and return the new enrolement DTO", async () => {
      // Arrange
      const payload = {
        studentId: MOCK_USER_ID,
        classId: MOCK_CLASS_ID,
      } as TEnrolementInsert;
      const createdMock = mockModelInstance({
        ...payload,
        enrolementId: MOCK_ENROLEMENT_ID,
      });
      vi.mocked(ClassroomEnrolement.create).mockResolvedValue(
        createdMock as any
      );

      // Act
      const result = await EnrolementService.createEnrolement(payload);

      // Assert
      expect(ClassroomEnrolement.create).toHaveBeenCalledWith(payload);
      expect(result.enrolementId).toBe(MOCK_ENROLEMENT_ID);
    });
  });

  describe("createQuickEnrolement", () => {
    it("should create a user and then the enrolement using the new userId", async () => {
      // Arrange
      const mockStudentPayload = { lastName: "Quick", role: "STUDENT" };
      const quickEnrolementData = {
        schoolId: MOCK_SCHOOL_ID,
        classId: MOCK_CLASS_ID,
      };
      const createdStudent = mockModelInstance({
        userId: MOCK_USER_ID,
        ...mockStudentPayload,
      });
      const createdEnrolement = mockModelInstance({
        ...quickEnrolementData,
        studentId: MOCK_USER_ID,
        enrolementId: MOCK_ENROLEMENT_ID,
      });

      vi.mocked(UserQuery.createUser).mockResolvedValue(createdStudent as any);
      vi.mocked(ClassroomEnrolement.create).mockResolvedValue(
        createdEnrolement as any
      );

      // Act
      const result = await EnrolementService.createQuickEnrolement({
        student: mockStudentPayload as any,
        ...quickEnrolementData,
      });

      // Assert
      expect(UserQuery.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockStudentPayload,
          schoolId: MOCK_SCHOOL_ID,
        })
      );
      expect(ClassroomEnrolement.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...quickEnrolementData,
          studentId: MOCK_USER_ID, // Vérifie que l'ID du nouvel utilisateur est bien utilisé
        })
      );
      expect(result.enrolementId).toBe(MOCK_ENROLEMENT_ID);
    });
  });

  describe("updateEnrolement", () => {
    it("should update and return the updated enrolement DTO", async () => {
      // Arrange
      const existingEnrolement = mockModelInstance({
        enrolementId: MOCK_ENROLEMENT_ID,
        studentId: MOCK_USER_ID,
      });
      existingEnrolement.update = vi.fn().mockResolvedValue(
        mockModelInstance({
          enrolementId: MOCK_ENROLEMENT_ID,
          studentId: "new-user",
        })
      );

      vi.mocked(ClassroomEnrolement.findByPk).mockResolvedValue(
        existingEnrolement as any
      );

      // Act
      const result = await EnrolementService.updateEnrolement(
        MOCK_ENROLEMENT_ID,
        { studentId: "new-user" }
      );

      // Assert
      expect(existingEnrolement.update).toHaveBeenCalledWith({
        studentId: "new-user",
      });
      expect(result?.studentId).toBe("new-user");
    });

    it("should return null if enrolement ID is not found", async () => {
      vi.mocked(ClassroomEnrolement.findByPk).mockResolvedValue(null);
      const result = await EnrolementService.updateEnrolement("999", {
        studentId: MOCK_USER_ID,
      });
      expect(result).toBeNull();
    });
  });

  describe("deleteEnrolement", () => {
    it("should return true if deletion was successful", async () => {
      vi.mocked(ClassroomEnrolement.destroy).mockResolvedValue(1);
      const result =
        await EnrolementService.deleteEnrolement(MOCK_ENROLEMENT_ID);
      expect(ClassroomEnrolement.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { enrolementId: MOCK_ENROLEMENT_ID } })
      );
      expect(result).toBe(true);
    });

    it("should return false if enrolement not found", async () => {
      vi.mocked(ClassroomEnrolement.destroy).mockResolvedValue(0);
      const result = await EnrolementService.deleteEnrolement("999");
      expect(result).toBe(false);
    });
  });
});
