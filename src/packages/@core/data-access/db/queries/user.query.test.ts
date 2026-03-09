// user.service.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { UserService } from "./user.query";
import { ClassroomEnrolement, User } from "../models/model";
import { UserAttributes } from "@/commons/types/models";
import { USER_ROLE } from "@/commons/constants/enum";
import { getDefaultUsername } from "../models/utils";

// Mocker les dépendances (Sequelize Models)
vi.mock("../models/model", () => ({
  User: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
  ClassroomEnrolement: {}, // N'a pas besoin de méthodes directes pour ce service, seulement d'être inclus
}));

// Mocker les utilitaires pour des valeurs prévisibles
vi.mock("@/main/db/models/utils", () => ({
  getDefaultUsername: vi.fn().mockReturnValue("GENERATED_USERNAME"),
  pruneUndefined: vi.fn((obj) => obj), // Simplifie la clause where pour les tests
}));

// Mock Helper: Crée une fausse instance Sequelize avec .toJSON() et .update()
const mockModelInstance = (data: any) => ({
  ...data,
  toJSON: () => data,
  update: vi.fn().mockResolvedValue({ ...data, toJSON: () => ({ ...data }) }),
});

const MOCK_USER_ID = "user-123";
const MOCK_SCHOOL_ID = "school-a";
const MOCK_YEAR_ID = "year-2024";

describe("UserService", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // --- FIND USERS ---
  describe("findUsers", () => {
    it("should throw validation error if schoolId or yearId is missing", async () => {
      // @ts-ignore : Test de la validation au runtime
      await expect(
        UserService.findUsers({ schoolId: MOCK_SCHOOL_ID })
      ).rejects.toThrow("Validation Error");
    });

    it("should call findAll with correct includes and where clauses for filtering by classroom", async () => {
      // Arrange
      const mockEnrolement = { enrolementId: "e1", classroomId: "class-1" };
      const mockUser = mockModelInstance({
        userId: MOCK_USER_ID,
        enrolments: [mockEnrolement],
      });
      vi.mocked(User.findAll).mockResolvedValue([mockUser] as any);

      // Act
      await UserService.findUsers({
        schoolId: MOCK_SCHOOL_ID,
        yearId: MOCK_YEAR_ID,
        params: { role: USER_ROLE.STUDENT, classroomId: "class-1" },
      });

      // Assert
      expect(User.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          // Vérifie la clause WHERE sur la table User
          where: { schoolId: MOCK_SCHOOL_ID, role: "STUDENT" },
          // Vérifie l'inclusion de l'association
          include: expect.arrayContaining([
            expect.objectContaining({
              model: ClassroomEnrolement,
              required: true,
              // Vérifie la clause WHERE sur l'association (enrôlement)
              where: { yearId: MOCK_YEAR_ID, classroomId: "class-1" },
            }),
          ]),
        })
      );
    });

    it("should throw service error on DB failure", async () => {
      vi.mocked(User.findAll).mockRejectedValue(
        new Error("DB connection failure")
      );

      await expect(
        UserService.findUsers({
          schoolId: MOCK_SCHOOL_ID,
          yearId: MOCK_YEAR_ID,
        })
      ).rejects.toThrow("Service unavailable: Unable to retrieve users.");
    });
  });

  // --- GET USER BY ID ---
  describe("getUserById", () => {
    it("should return the user with enrolments if found", async () => {
      const mockUser = mockModelInstance({
        userId: MOCK_USER_ID,
        enrolments: [{}],
      });
      vi.mocked(User.findByPk).mockResolvedValue(mockUser as any);

      const result = await UserService.getUserById(MOCK_USER_ID);

      expect(User.findByPk).toHaveBeenCalledWith(
        MOCK_USER_ID,
        expect.objectContaining({
          include: [ClassroomEnrolement],
        })
      );
      expect(result?.userId).toBe(MOCK_USER_ID);
    });

    it("should return null if user ID is empty", async () => {
      const result = await UserService.getUserById("");
      expect(result).toBeNull();
    });
  });

  // --- CREATE USER ---
  describe("createUser", () => {
    it("should generate username, use default password, and return created user", async () => {
      const payload = {
        lastName: "Test",
        role: "STUDENT",
        schoolId: MOCK_SCHOOL_ID,
      } as UserAttributes;

      const expectedData = {
        ...payload,
        password: "000000",
        username: "GENERATED_USERNAME",
      };

      const createdMock = mockModelInstance({
        ...expectedData,
        userId: MOCK_USER_ID,
      });
      vi.mocked(User.create).mockResolvedValue(createdMock as any);

      const result = await UserService.createUser(payload);

      expect(getDefaultUsername).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith(expectedData);
      expect(result.userId).toBe(MOCK_USER_ID);
    });
  });

  // --- UPDATE USER ---
  describe("updateUser", () => {
    it("should find, update, and return the updated user", async () => {
      const existingUser = mockModelInstance({
        userId: MOCK_USER_ID,
        firstName: "Old",
      });
      existingUser.update = vi
        .fn()
        .mockResolvedValue(
          mockModelInstance({ userId: MOCK_USER_ID, firstName: "New" })
        );

      vi.mocked(User.findByPk).mockResolvedValue(existingUser as any);

      const result = await UserService.updateUser(MOCK_USER_ID, {
        firstName: "New",
      });

      expect(existingUser.update).toHaveBeenCalledWith({ firstName: "New" });
      expect(result?.firstName).toBe("New");
    });
  });

  // --- DELETE USER ---
  describe("deleteUser", () => {
    it("should return true if deletion was successful", async () => {
      vi.mocked(User.destroy).mockResolvedValue(1); // 1 row affected
      const result = await UserService.deleteUser(MOCK_USER_ID);
      expect(User.destroy).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: MOCK_USER_ID } })
      );
      expect(result).toBe(true);
    });

    it("should return false if deletion fails (user not found)", async () => {
      vi.mocked(User.destroy).mockResolvedValue(0); // 0 rows affected
      const result = await UserService.deleteUser(MOCK_USER_ID);
      expect(result).toBe(false);
    });

    it("should throw service error on DB constraint failure", async () => {
      vi.mocked(User.destroy).mockRejectedValue(
        new Error("FK Constraint Error")
      );
      await expect(UserService.deleteUser(MOCK_USER_ID)).rejects.toThrow(
        "Delete operation failed, check related data constraints."
      );
    });
  });
});
