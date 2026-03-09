import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserQuery } from "./user.query";
import {
  User,
  ClassroomEnrolement,
  getDefaultUsername,
} from "@/packages/@core/data-access/db";

vi.mock("@/packages/@core/data-access/db", () => ({
  User: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
  ClassroomEnrolement: {},
  buildFindOptions: vi.fn(() => ({ where: {} })),
  getDefaultUsername: vi.fn(() => "user.test"),
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

describe("UserQuery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findMany", () => {
    it("doit lever une erreur si schoolId est manquant", async () => {
      await expect(UserQuery.findMany({} as any)).rejects.toThrow(
        "Validation Error: schoolId are required",
      );
    });

    it("doit inclure ClassroomEnrolement si yearId et classroomId sont fournis", async () => {
      (User.findAll as any).mockResolvedValue([]);

      await UserQuery.findMany({
        schoolId: "S1",
        yearId: "Y1",
        classroomId: "C1",
      });

      expect(User.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              model: ClassroomEnrolement,
              required: true,
            }),
          ]),
        }),
      );
    });

    it("ne doit pas inclure de jointure si les IDs de scope sont manquants", async () => {
      (User.findAll as any).mockResolvedValue([]);

      await UserQuery.findMany({ schoolId: "S1" });

      expect(User.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ include: [] }),
      );
    });
  });

  describe("findById", () => {
    it("doit retourner null si l'ID est vide", async () => {
      const result = await UserQuery.findById("");
      expect(result).toBeNull();
    });

    it("doit appeler findByPk avec raw: true", async () => {
      const mockUser = { userId: "1", firstName: "Jean" };
      (User.findByPk as any).mockResolvedValue(mockUser);

      const result = await UserQuery.findById("1");
      expect(result).toEqual(mockUser);
      expect(User.findByPk).toHaveBeenCalledWith("1", { raw: true });
    });
  });

  describe("create", () => {
    it("doit générer un nom d'utilisateur et un mot de passe par défaut", async () => {
      const payload = { firstName: "Test", lastName: "Dev", schoolId: "S1" };
      const mockCreated = {
        ...payload,
        userId: "new-id",
        toJSON: () => ({ ...payload, userId: "new-id" }),
      };
      (User.create as any).mockResolvedValue(mockCreated);

      const result = await UserQuery.create(payload as any);

      expect(getDefaultUsername).toHaveBeenCalled();
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: "000000",
          username: "user.test",
        }),
        undefined,
      );
      expect(result.userId).toBe("new-id");
    });

    it("doit passer les options de transaction si fournies", async () => {
      const transaction = { id: "txn-1" } as any;
      (User.create as any).mockResolvedValue({ toJSON: () => ({}) });

      await UserQuery.create({ schoolId: "S1" } as any, { transaction });

      expect(User.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ transaction }),
      );
    });
  });

  describe("update", () => {
    it("doit retourner null si l'utilisateur n'existe pas", async () => {
      (User.findByPk as any).mockResolvedValue(null);
      const result = await UserQuery.update("id-err", { firstName: "Bob" });
      expect(result).toBeNull();
    });

    it("doit mettre à jour l'utilisateur trouvé", async () => {
      const mockInstance = {
        update: vi.fn().mockResolvedValue({ userId: "1", firstName: "Bob" }),
      };
      (User.findByPk as any).mockResolvedValue(mockInstance);

      const result = await UserQuery.update("1", { firstName: "Bob" });
      expect(mockInstance.update).toHaveBeenCalledWith({ firstName: "Bob" });
      expect(result?.firstName).toBe("Bob");
    });
  });

  describe("delete", () => {
    it("doit retourner true en cas de suppression réussie", async () => {
      (User.destroy as any).mockResolvedValue(1);
      const result = await UserQuery.delete("user-1");
      expect(result).toBe(true);
    });

    it("doit throw une erreur liée aux contraintes de données si la suppression échoue", async () => {
      (User.destroy as any).mockRejectedValue(
        new Error("ForeignKeyConstraintError"),
      );

      await expect(UserQuery.delete("user-1")).rejects.toThrow(
        /check related data constraints/,
      );
    });
  });
});
