import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseRepository } from "./base-repository";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

// 1. Création d'une table "Dummy" pour le test
const mockTable = pgTable("test_table", {
  id: uuid("id").primaryKey(),
  name: varchar("name"),
});

// 2. Classe concrète pour instancier l'abstrait
class TestRepository extends BaseRepository<
  typeof mockTable,
  { id: string; name: string },
  { name: string },
  { name?: string }
> {
  constructor(db: any) {
    super(mockTable, mockTable.id, "TestEntity", {}, db);
  }
}

describe("BaseRepository", () => {
  let repository: TestRepository;

  // Mock des méthodes chaînables de Drizzle
  const dbMock = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    $dynamic: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new TestRepository(dbMock);
  });

  describe("findById", () => {
    it("doit retourner un record si l'ID existe", async () => {
      const mockData = { id: "123", name: "Test" };
      // Simulation du retour de Drizzle (un tableau)
      dbMock.where.mockResolvedValueOnce([mockData]);

      const result = await repository.findById("123");

      expect(dbMock.select).toHaveBeenCalled();
      expect(dbMock.where).toHaveBeenCalledWith(eq(mockTable.id, "123"));
      expect(result).toEqual(mockData);
    });

    it("doit retourner null si l'ID n'est pas fourni", async () => {
      const result = await repository.findById("");
      expect(result).toBeNull();
      expect(dbMock.select).not.toHaveBeenCalled();
    });

    it("doit throw une erreur si la DB crash", async () => {
      dbMock.where.mockRejectedValueOnce(new Error("DB Error"));

      await expect(repository.findById("123")).rejects.toThrow(
        "Failed to fetch TestEntity",
      );
    });
  });

  describe("create", () => {
    it("doit insérer une nouvelle entité et la retourner", async () => {
      const payload = { name: "New Entity" };
      const createdRecord = { id: "456", ...payload };

      dbMock.returning.mockResolvedValueOnce([createdRecord]);

      const result = await repository.create(payload);

      expect(dbMock.insert).toHaveBeenCalledWith(mockTable);
      expect(dbMock.values).toHaveBeenCalledWith(payload);
      expect(result).toEqual(createdRecord);
    });
  });

  describe("delete", () => {
    it("doit retourner true si la suppression est confirmée", async () => {
      dbMock.returning.mockResolvedValueOnce([{ id: "123" }]);

      const result = await repository.delete("123");

      expect(result).toBe(true);
      expect(dbMock.delete).toHaveBeenCalled();
    });

    it("doit retourner false si rien n'a été supprimé", async () => {
      dbMock.returning.mockResolvedValueOnce([]);

      const result = await repository.delete("non-existent");

      expect(result).toBe(false);
    });
  });
});
