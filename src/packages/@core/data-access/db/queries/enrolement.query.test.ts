import { describe, it, expect, vi, afterEach } from "vitest";
import { EnrolementQuery } from "./enrolement.query";
import {
  ClassroomEnrolement,
  STUDENT_STATUS,
} from "@/packages/@core/data-access/db";

describe("EnrolementQuery - Analyse & Statistiques", () => {
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
    STUDENT_STATUS: {
      EN_COURS: "active",
      EXCLUT: "excluded",
      ABANDON: "inactive",
    },
    buildFindOptions: vi.fn(() => ({ where: {} })),
    Sequelize: {
      fn: vi.fn(),
      col: vi.fn(),
    },
  }));

  describe("EnrolementQuery - Full Suite", () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    // --- Tests des KPIs et Statistiques (Les fonctions "omises") ---

    describe("getStudentStatusStats", () => {
      it("doit retourner les stats groupées par statut", async () => {
        const mockStats = [
          { status: "active", count: 10 },
          { status: "excluded", count: 2 },
        ];
        (ClassroomEnrolement.findAll as any).mockResolvedValue(mockStats);

        const result = await EnrolementQuery.getStudentStatusStats({
          schoolId: "1",
          yearId: "1",
        });

        expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            attributes: expect.arrayContaining(["status"]),
            group: ["status"],
          }),
        );
        expect(result).toEqual(mockStats);
      });
    });

    describe("getQuickKpis", () => {
      it("doit calculer correctement les KPIs à partir des stats", async () => {
        const spy = vi
          .spyOn(EnrolementQuery, "getStudentStatusStats")
          .mockResolvedValue([
            { status: STUDENT_STATUS.EN_COURS, count: 50 },
            { status: STUDENT_STATUS.EXCLUT, count: 5 },
            { status: STUDENT_STATUS.ABANDON, count: 10 },
          ] as any);

        const kpis = await EnrolementQuery.getQuickKpis({
          schoolId: "1",
          yearId: "1",
        });

        expect(kpis).toEqual({
          total: 65,
          active: 50,
          excluded: 5,
          inactive: 10,
        });
        spy.mockRestore();
      });
    });

    describe("getRetentionMetrics", () => {
      it("doit calculer la répartition nouveaux vs anciens élèves", async () => {
        (ClassroomEnrolement.count as any)
          .mockResolvedValueOnce(100) // Premier appel : total
          .mockResolvedValueOnce(30); // Deuxième appel : news (isNewStudent: true)

        const metrics = await EnrolementQuery.getRetentionMetrics({
          schoolId: "1",
          yearId: "1",
        });

        expect(metrics).toEqual({
          total: 100,
          news: 30,
          oldStudents: 70,
        });
      });
    });

    // --- Tests des Opérations CRUD ---

    describe("findById", () => {
      it("doit retourner null si l'ID est vide", async () => {
        const result = await EnrolementQuery.findById("");
        expect(result).toBeNull();
      });

      it("doit retourner un DTO si l'enrôlement existe", async () => {
        const mockEnrolement = {
          enrolementId: "abc",
          toJSON: () => ({ enrolementId: "abc", user: {}, classroom: {} }),
        };
        (ClassroomEnrolement.findByPk as any).mockResolvedValue(mockEnrolement);

        const result = await EnrolementQuery.findById("abc");
        expect(result?.enrolementId).toBe("abc");
      });
    });

    describe("delete", () => {
      it("doit retourner true si la suppression réussit", async () => {
        (ClassroomEnrolement.destroy as any).mockResolvedValue(1); // 1 ligne supprimée
        const result = await EnrolementQuery.delete("id-123");
        expect(result).toBe(true);
      });

      it("doit throw une erreur si la DB crash", async () => {
        (ClassroomEnrolement.destroy as any).mockRejectedValue(
          new Error("Fatal Error"),
        );
        await expect(EnrolementQuery.delete("id-123")).rejects.toThrow(
          "Delete operation failed.",
        );
      });
    });
  });

  it("getStudentsCountByOption doit agréger les données par option", async () => {
    const mockResults = [{ value: 15, optionShortName: "Informatique" }];
    (ClassroomEnrolement.findAll as any).mockResolvedValue(mockResults);

    const result = await EnrolementQuery.getStudentsCountByOption({
      schoolId: "1",
      yearId: "1",
    });

    expect(ClassroomEnrolement.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        group: [expect.stringContaining("option_name")],
      }),
    );
    expect(result).toEqual(mockResults);
  });

  it("getRetentionMetrics doit retourner le calcul correct entre total et news", async () => {
    (ClassroomEnrolement.count as any)
      .mockResolvedValueOnce(50) // Total
      .mockResolvedValueOnce(10); // News

    const result = await EnrolementQuery.getRetentionMetrics({
      schoolId: "1",
      yearId: "1",
    });

    expect(result).toEqual({
      total: 50,
      news: 10,
      oldStudents: 40,
    });
  });

  it("getQuickKpis doit sommer les comptes pour le total global", async () => {
    vi.spyOn(EnrolementQuery, "getStudentStatusStats").mockResolvedValue([
      { status: "EN_COURS", count: "20" },
      { status: "ABANDON", count: "5" },
    ] as any);

    const result = await EnrolementQuery.getQuickKpis({
      schoolId: "1",
      yearId: "1",
    });

    expect(result.total).toBe(25);
    expect(result.active).toBe(20);
  });
});
