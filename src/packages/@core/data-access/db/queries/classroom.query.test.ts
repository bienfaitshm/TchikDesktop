import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClassroomQuery } from "./classroom.query";
import { ClassRoom } from "@/packages/@core/data-access/db";

vi.mock("@/packages/@core/data-access/db", () => ({
  ClassRoom: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
  Option: {},
  StudyYear: {},
  ClassroomEnrolement: {},
  User: {},
  buildFindOptions: vi.fn(() => ({ where: {} })),
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

describe("ClassroomQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findMany", () => {
    it("doit retourner une liste de classes avec les inclusions requises", async () => {
      const mockData = [{ classId: "1", identifier: "6eme Math-Physique" }];
      (ClassRoom.findAll as any).mockResolvedValue(mockData);

      const result = await ClassroomQuery.findMany({ schoolId: "sch-1" });

      expect(ClassRoom.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ as: "option" }),
            expect.objectContaining({ as: "studyYear" }),
          ]),
          raw: true,
        }),
      );
      expect(result).toEqual(mockData);
    });

    it("doit lever une erreur explicite en cas d'échec DB", async () => {
      (ClassRoom.findAll as any).mockRejectedValue(
        new Error("DB Connection Lost"),
      );

      await expect(ClassroomQuery.findMany({})).rejects.toThrow(
        "Impossible de récupérer la liste des classes.",
      );
    });
  });

  describe("findById", () => {
    it("doit retourner null si aucun ID n'est fourni", async () => {
      const result = await ClassroomQuery.findById("");
      expect(result).toBeNull();
    });

    it("doit récupérer une classe spécifique avec ses relations", async () => {
      const mockClass = { classId: "uuid-123", identifier: "3eme Bio" };
      (ClassRoom.findByPk as any).mockResolvedValue(mockClass);

      const result = await ClassroomQuery.findById("uuid-123");

      expect(ClassRoom.findByPk).toHaveBeenCalledWith(
        "uuid-123",
        expect.objectContaining({ raw: true }),
      );
      expect(result).toEqual(mockClass);
    });
  });

  describe("findWithEnrollments", () => {
    it("doit inclure les élèves et leurs informations de base", async () => {
      const mockDataWithUsers = [
        {
          classId: "C1",
          enrollements: [{ user: { firstName: "Arsène" } }],
        },
      ];
      (ClassRoom.findAll as any).mockResolvedValue(mockDataWithUsers);

      const result = await ClassroomQuery.findWithEnrollments({});

      expect(ClassRoom.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({ as: "enrollements" }),
          ]),
        }),
      );
      expect(result).toEqual(mockDataWithUsers);
    });
  });

  describe("create", () => {
    it("doit créer une classe et retourner l'objet créé", async () => {
      const input = { identifier: "1ere A", schoolId: "S1", yearId: "Y1" };
      (ClassRoom.create as any).mockResolvedValue({
        ...input,
        classId: "new-uuid",
      });

      const result = await ClassroomQuery.create(input as any);

      expect(ClassRoom.create).toHaveBeenCalledWith(input, { raw: true });
      expect(result.classId).toBe("new-uuid");
    });
  });

  describe("update", () => {
    it("doit retourner null si la classe à mettre à jour n'existe pas", async () => {
      (ClassRoom.findByPk as any).mockResolvedValue(null);

      const result = await ClassroomQuery.update("ID-INEXISTANT", {
        identifier: "Test",
      });
      expect(result).toBeNull();
    });

    it("doit mettre à jour les champs et retourner la classe modifiée", async () => {
      const mockInstance = {
        update: vi
          .fn()
          .mockResolvedValue({ classId: "1", identifier: "Nouveau Nom" }),
      };
      (ClassRoom.findByPk as any).mockResolvedValue(mockInstance);

      const result = await ClassroomQuery.update("1", {
        identifier: "Nouveau Nom",
      });

      expect(mockInstance.update).toHaveBeenCalledWith(
        { identifier: "Nouveau Nom" },
        { raw: true },
      );
      expect(result?.identifier).toBe("Nouveau Nom");
    });
  });

  describe("delete", () => {
    it("doit retourner true si la classe est supprimée", async () => {
      (ClassRoom.destroy as any).mockResolvedValue(1); // 1 ligne affectée

      const result = await ClassroomQuery.delete("uuid-to-delete");
      expect(result).toBe(true);
    });

    it("doit retourner false si la classe n'existait pas", async () => {
      (ClassRoom.destroy as any).mockResolvedValue(0);

      const result = await ClassroomQuery.delete("uuid-inconnu");
      expect(result).toBe(false);
    });

    it("doit throw une erreur spécifique si la suppression échoue (ex: contrainte d'intégrité)", async () => {
      (ClassRoom.destroy as any).mockRejectedValue(
        new Error("ForeignKeyConstraintError"),
      );

      await expect(ClassroomQuery.delete("C1")).rejects.toThrow(
        "Impossible de supprimer la classe (vérifiez qu'elle est vide).",
      );
    });
  });
});
