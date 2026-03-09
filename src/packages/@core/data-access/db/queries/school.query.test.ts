import { describe, it, expect, vi, beforeEach } from "vitest";
import { SchoolQuery, StudyYearQuery } from "./school.query";
import { School, StudyYear } from "@/packages/@core/data-access/db";

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
  buildFindOptions: vi.fn((f, order) => ({ where: f, order })),
  Sequelize: {
    fn: vi.fn(),
    col: vi.fn(),
  },
}));

vi.mock("@/packages/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe("School & StudyYear Queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SchoolQuery", () => {
    describe("findMany", () => {
      it("doit retourner la liste des écoles avec le tri par défaut", async () => {
        const mockSchools = [{ schoolId: "1", name: "Collège L'Allégresse" }];
        (School.findAll as any).mockResolvedValue(mockSchools);

        const result = await SchoolQuery.findMany();

        expect(School.findAll).toHaveBeenCalledWith(
          expect.objectContaining({ raw: true }),
        );
        expect(result).toEqual(mockSchools);
      });

      it("doit throw une erreur personnalisée si la DB échoue", async () => {
        (School.findAll as any).mockRejectedValue(
          new Error("Connection Error"),
        );
        await expect(SchoolQuery.findMany()).rejects.toThrow(
          "Query unavailable: Unable to retrieve schools.",
        );
      });
    });

    describe("update", () => {
      it("doit retourner null si l'école n'existe pas", async () => {
        (School.findByPk as any).mockResolvedValue(null);
        const result = await SchoolQuery.update("id-xyz", {
          name: "Nouveau Nom",
        });
        expect(result).toBeNull();
      });

      it("doit appeler update sur l'instance trouvée", async () => {
        const mockInstance = {
          update: vi
            .fn()
            .mockResolvedValue({ schoolId: "1", name: "Nouveau Nom" }),
        };
        (School.findByPk as any).mockResolvedValue(mockInstance);

        const result = await SchoolQuery.update("1", { name: "Nouveau Nom" });
        expect(mockInstance.update).toHaveBeenCalledWith(
          { name: "Nouveau Nom" },
          { raw: true },
        );
        expect(result?.name).toBe("Nouveau Nom");
      });
    });
  });

  describe("StudyYearQuery", () => {
    describe("findMany", () => {
      it("doit throw une erreur de validation si schoolId est manquant", async () => {
        await expect(StudyYearQuery.findMany({})).rejects.toThrow(
          /schoolId is required/,
        );
      });

      it("doit retourner les années scolaires pour une école spécifique", async () => {
        const mockYears = [{ yearId: "2026", yearName: "2025-2026" }];
        (StudyYear.findAll as any).mockResolvedValue(mockYears);

        const result = await StudyYearQuery.findMany({ schoolId: "sch-123" });

        expect(StudyYear.findAll).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({ schoolId: "sch-123" }),
            raw: true,
          }),
        );
        expect(result).toEqual(mockYears);
      });
    });

    describe("create", () => {
      it("doit valider la présence de schoolId avant la création", async () => {
        const payload = { yearName: "2026" }; // schoolId manquant
        await expect(StudyYearQuery.create(payload as any)).rejects.toThrow(
          /schoolId is mandatory/,
        );
      });

      it("doit créer l'année scolaire avec succès", async () => {
        const payload = { yearName: "2026", schoolId: "S1" };
        (StudyYear.create as any).mockResolvedValue({
          ...payload,
          yearId: "Y1",
        });

        const result = await StudyYearQuery.create(payload as any);
        expect(StudyYear.create).toHaveBeenCalledWith(payload, { raw: true });
        expect(result).toHaveProperty("yearId");
      });
    });

    describe("delete", () => {
      it("doit retourner true si la suppression est effective", async () => {
        (StudyYear.destroy as any).mockResolvedValue(1); // 1 ligne supprimée
        const result = await StudyYearQuery.delete("year-uuid");
        expect(result).toBe(true);
      });

      it("doit throw une erreur personnalisée si la suppression échoue", async () => {
        (StudyYear.destroy as any).mockRejectedValue(new Error("SQL Error"));
        await expect(StudyYearQuery.delete("id")).rejects.toThrow(
          "Delete failed.",
        );
      });
    });
  });
});
