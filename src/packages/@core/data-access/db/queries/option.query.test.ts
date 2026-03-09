import { describe, it, expect, vi, beforeEach } from "vitest";
import { OptionQuery } from "./option.query";
import { Option, buildFindOptions } from "@/packages/@core/data-access/db";

vi.mock("@/packages/@core/data-access/db", () => ({
  Option: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
  buildFindOptions: vi.fn(() => ({ where: {} })),
  Sequelize: {
    fn: vi.fn(),
    col: vi.fn(),
  },
}));

// Mock du Logger
vi.mock("@/packages/logger", () => ({
  getLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }),
}));

describe("OptionQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findMany", () => {
    it("doit retourner un tableau vide si schoolId n'est pas fourni", async () => {
      const result = await OptionQuery.findMany({});
      expect(result).toEqual([]);
      expect(Option.findAll).not.toHaveBeenCalled();
    });

    it("doit récupérer les options avec le tri par défaut (LOWER)", async () => {
      const mockOptions = [{ optionId: "1", optionName: "Informatique" }];
      (Option.findAll as any).mockResolvedValue(mockOptions);

      const result = await OptionQuery.findMany({ schoolId: "sch-10" });

      expect(buildFindOptions).toHaveBeenCalled();
      expect(Option.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ raw: true }),
      );
      expect(result).toEqual(mockOptions);
    });

    it("doit throw une erreur métier si la requête échoue", async () => {
      (Option.findAll as any).mockRejectedValue(new Error("SQL Crash"));

      await expect(OptionQuery.findMany({ schoolId: "1" })).rejects.toThrow(
        "Service unavailable: Unable to retrieve academic options.",
      );
    });
  });

  describe("findById", () => {
    it("doit retourner null et logger un avertissement si l'ID est vide", async () => {
      const result = await OptionQuery.findById("");
      expect(result).toBeNull();
    });

    it("doit retourner l'option si elle existe", async () => {
      const mockOption = { optionId: "opt-1", optionName: "Bio-Chimie" };
      (Option.findByPk as any).mockResolvedValue(mockOption);

      const result = await OptionQuery.findById("opt-1");
      expect(result).toEqual(mockOption);
      expect(Option.findByPk).toHaveBeenCalledWith("opt-1", { raw: true });
    });
  });

  describe("create", () => {
    it("doit créer une option et logger le succès", async () => {
      const data = { optionName: "Pédagogie", schoolId: "S1" };
      (Option.create as any).mockResolvedValue({
        ...data,
        optionId: "new-opt",
      });

      const result = await OptionQuery.create(data as any);

      expect(Option.create).toHaveBeenCalledWith(data, { raw: true });
      expect(result.optionId).toBe("new-opt");
    });

    it("doit relancer l'erreur originale en cas d'échec de création", async () => {
      const err = new Error("Unique constraint failed");
      (Option.create as any).mockRejectedValue(err);

      await expect(OptionQuery.create({} as any)).rejects.toThrow(err);
    });
  });

  describe("update", () => {
    it("doit retourner null si l'option est introuvable", async () => {
      (Option.findByPk as any).mockResolvedValue(null);
      const result = await OptionQuery.update("id-err", { optionName: "Test" });
      expect(result).toBeNull();
    });

    it("doit mettre à jour l'instance si elle existe", async () => {
      const mockInstance = {
        update: vi
          .fn()
          .mockResolvedValue({ optionId: "1", optionName: "Nouveau" }),
      };
      (Option.findByPk as any).mockResolvedValue(mockInstance);

      const result = await OptionQuery.update("1", { optionName: "Nouveau" });

      expect(mockInstance.update).toHaveBeenCalledWith(
        { optionName: "Nouveau" },
        { raw: true },
      );
      expect(result?.optionName).toBe("Nouveau");
    });
  });

  describe("delete", () => {
    it("doit retourner true si au moins une ligne est supprimée", async () => {
      (Option.destroy as any).mockResolvedValue(1);
      const result = await OptionQuery.delete("opt-123");
      expect(result).toBe(true);
    });

    it("doit retourner false si l'ID n'existe pas", async () => {
      (Option.destroy as any).mockResolvedValue(0);
      const result = await OptionQuery.delete("opt-unknown");
      expect(result).toBe(false);
    });

    it("doit throw une erreur de contrainte si des classes utilisent cette option", async () => {
      (Option.destroy as any).mockRejectedValue(
        new Error("ForeignKeyConstraint"),
      );

      await expect(OptionQuery.delete("opt-1")).rejects.toThrow(
        /check related data constraints/,
      );
    });
  });
});
