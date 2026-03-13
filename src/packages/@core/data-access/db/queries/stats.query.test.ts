import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnrolementQuery } from "./enrolement.query";
import {
  ClassroomEnrolement,
  User,
  STUDENT_STATUS,
} from "@/packages/@core/data-access/db";
import { UserQuery } from "./user.query";

// Mock des dépendances
vi.mock("@/packages/@core/data-access/db", () => ({
  ClassroomEnrolement: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
    sequelize: {
      transaction: vi.fn(() => ({
        commit: vi.fn(),
        rollback: vi.fn(),
      })),
    },
  },
  User: {},
  ClassRoom: {},
  StudyYear: {},
  Option: {},
  buildFindOptions: vi.fn((f) => ({ where: f })),
  STUDENT_STATUS: {
    EN_COURS: "EN_COURS",
    ABANDON: "ABANDON",
    EXCLUT: "EXCLUT",
  },
}));

vi.mock("./user.query", () => ({
  UserQuery: {
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/packages/logger", () => ({
  getLogger: () => ({ error: vi.fn(), info: vi.fn(), warn: vi.fn() }),
}));

describe("EnrolementQuery", () => {
  const mockFilters = { schoolId: "school-1", yearId: "year-2024" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validation des Filtres", () => {
    it("doit lever une erreur si schoolId ou yearId est manquant", async () => {
      await expect(EnrolementQuery.findMany({} as any)).rejects.toThrow(
        "Validation Error: schoolId and yearId are required.",
      );
    });
  });

  describe("findMany", () => {
    it("doit retourner une liste d'enrôlements avec les inclusions", async () => {
      const mockData = [{ enrolementId: "1", user: { firstName: "John" } }];
      vi.mocked(ClassroomEnrolement.findAll).mockResolvedValue(mockData as any);

      const result = await EnrolementQuery.findMany(mockFilters);

      expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ model: User, as: "user" }),
          ]),
          raw: true,
          nest: true,
        }),
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("quickCreate (Logique de Transaction)", () => {
    const quickData = {
      schoolId: "s1",
      classroomId: "c1",
      isInSystem: false,
      student: { firstName: "New", lastName: "Student" },
    } as any;

    it("doit créer un utilisateur ET un enrôlement dans une transaction", async () => {
      const mockUser = { userId: "new-user-id" };
      const mockEnrolement = { enrolementId: "e1" };

      vi.mocked(UserQuery.create).mockResolvedValue(mockUser as any);
      vi.mocked(ClassroomEnrolement.create).mockResolvedValue(
        mockEnrolement as any,
      );

      const result = await EnrolementQuery.quickCreate(quickData);

      expect(UserQuery.create).toHaveBeenCalled();
      expect(ClassroomEnrolement.create).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: "new-user-id" }),
        expect.any(Object),
      );
      expect(result).toEqual(mockEnrolement);
    });

    it("doit rollback la transaction en cas d'échec", async () => {
      vi.mocked(UserQuery.create).mockRejectedValue(
        new Error("User creation failed"),
      );

      await expect(EnrolementQuery.quickCreate(quickData)).rejects.toThrow();

      const transaction = await ClassroomEnrolement.sequelize!.transaction();
      expect(transaction.rollback).toHaveBeenCalled();
    });
  });

  describe("getQuickKpis", () => {
    it("doit agréger correctement les différents statuts", async () => {
      const mockStats = [
        { status: STUDENT_STATUS.EN_COURS, count: "50" },
        { status: STUDENT_STATUS.ABANDON, count: "5" },
        { status: STUDENT_STATUS.EXCLUT, count: "2" },
      ];

      vi.spyOn(EnrolementQuery, "getStudentStatusStats").mockResolvedValue(
        mockStats as any,
      );

      const result = await EnrolementQuery.getQuickKpis(mockFilters);

      expect(result).toEqual({
        total: 57,
        active: 50,
        inactive: 5,
        excluded: 2,
      });
    });
  });

  describe("delete", () => {
    it("doit retourner true si une ligne est supprimée", async () => {
      vi.mocked(ClassroomEnrolement.destroy).mockResolvedValue(1);
      const result = await EnrolementQuery.delete("id-1");
      expect(result).toBe(true);
    });

    it("doit retourner false si l'ID n'existe pas", async () => {
      vi.mocked(ClassroomEnrolement.destroy).mockResolvedValue(0);
      const result = await EnrolementQuery.delete("id-invalid");
      expect(result).toBe(false);
    });
  });
});
