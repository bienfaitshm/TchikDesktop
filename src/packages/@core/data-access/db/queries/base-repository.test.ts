import { describe, it, expect, vi, beforeEach } from "vitest";
import { BaseRepository, RepositoryError, ILogger } from "./base-repository";
import * as drizzleBuilder from "./drizzle-builder";

// Création d'une classe concrète pour tester la classe abstraite
class TestRepository extends BaseRepository<any, any, any, any> {}

const mockTable = {} as any;
const mockIdColumn = {} as any;

// Mock complet de la chaîne fluide (chaining) de Drizzle
const createMockDb = () => {
  const chainable: any = {};

  chainable.from = vi.fn().mockReturnValue(chainable);
  chainable.$dynamic = vi.fn().mockReturnValue(chainable);
  chainable.values = vi.fn().mockReturnValue(chainable);
  chainable.set = vi.fn().mockReturnValue(chainable);

  chainable.where = vi.fn().mockReturnValue(chainable);

  chainable.returning = vi.fn().mockResolvedValue([]);

  // Pour les requêtes simples sans returning (ex: findById)
  // On peut faire en sorte que chainable soit lui-même un Thenable (Promesse)
  // ou mocker spécifiquement le retour de .where() selon le cas.

  return {
    select: vi.fn().mockReturnValue(chainable),
    insert: vi.fn().mockReturnValue(chainable),
    update: vi.fn().mockReturnValue(chainable),
    delete: vi.fn().mockReturnValue(chainable),
    _chainable: chainable,
  } as any;
};

const mockLogger: ILogger = {
  error: vi.fn(),
};

// Mocker les helpers globaux restants
vi.mock("./drizzle-builder", () => ({
  applyQueryOptions: vi.fn(),
  mergeQueryOptions: vi.fn().mockReturnValue({}),
}));

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return { ...actual, eq: vi.fn() };
});

describe("BaseRepository", () => {
  let dbMock: ReturnType<typeof createMockDb>;
  let repository: TestRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    dbMock = createMockDb();
    repository = new TestRepository({
      db: dbMock,
      entityName: "TestEntity",
      idColumn: mockIdColumn,
      logger: (_) => mockLogger,
      table: mockTable,
    });
  });

  describe("findById", () => {
    it("should return null if id is undefined", async () => {
      const result = await repository.findById(undefined as any);
      expect(result).toBeNull();
      expect(dbMock.select).not.toHaveBeenCalled();
    });

    it("should return the entity when found", async () => {
      const expectedEntity = { id: 1, name: "Test" };
      dbMock._chainable.where.mockResolvedValueOnce([expectedEntity]);

      const result = await repository.findById(1);

      expect(dbMock.select).toHaveBeenCalled();
      expect(dbMock._chainable.from).toHaveBeenCalledWith(mockTable);
      expect(result).toEqual(expectedEntity);
    });

    it("should throw RepositoryError and log error on failure", async () => {
      const mockError = new Error("DB Connection lost");
      dbMock._chainable.where.mockRejectedValueOnce(mockError);

      await expect(repository.findById(1)).rejects.toThrow(RepositoryError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        "[TestEntityRepository] findById operation failed",
        expect.objectContaining({ error: "DB Connection lost", id: 1 }),
      );
    });
  });

  describe("findMany", () => {
    it("should apply query options and return a list", async () => {
      const expectedList = [{ id: 1 }, { id: 2 }];
      vi.mocked(drizzleBuilder.applyQueryOptions).mockResolvedValueOnce(
        expectedList,
      );

      const result = await repository.findMany();

      expect(dbMock.select).toHaveBeenCalled();
      expect(drizzleBuilder.applyQueryOptions).toHaveBeenCalled();
      expect(result).toEqual(expectedList);
    });
  });

  describe("create", () => {
    it("should create and return the new entity", async () => {
      const payload = { name: "New" };
      const expectedEntity = { id: 1, ...payload };
      dbMock._chainable.returning.mockResolvedValueOnce([expectedEntity]);

      const result = await repository.create(payload);

      expect(dbMock.insert).toHaveBeenCalledWith(mockTable);
      expect(dbMock._chainable.values).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedEntity);
    });
  });

  describe("update", () => {
    it("should update and return the entity", async () => {
      const updates = { name: "Updated" };
      const expectedEntity = { id: 1, ...updates };
      dbMock._chainable.returning.mockResolvedValueOnce([expectedEntity]);

      const result = await repository.update(1, updates);

      expect(dbMock.update).toHaveBeenCalledWith(mockTable);
      expect(dbMock._chainable.set).toHaveBeenCalledWith(updates);
      expect(result).toEqual(expectedEntity);
    });

    it("should return null if id is undefined", async () => {
      const result = await repository.update(undefined as any, {});
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should return true if deletion returns elements", async () => {
      dbMock._chainable.returning.mockResolvedValueOnce([{ id: 1 }]);
      const result = await repository.delete(1);

      expect(dbMock.delete).toHaveBeenCalledWith(mockTable);
      expect(result).toBe(true);
    });

    it("should return false if nothing was deleted", async () => {
      dbMock._chainable.returning.mockResolvedValueOnce([]);
      const result = await repository.delete(999);

      expect(result).toBe(false);
    });
  });
});
