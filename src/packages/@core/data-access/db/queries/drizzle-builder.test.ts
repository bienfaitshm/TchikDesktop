import { describe, it, expect } from "vitest";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import {
  applyQueryOptions,
  DEFAULT_MAX_LIMIT,
  mergeQueryOptions,
} from "./drizzle-builder";
import { createClient } from "@libsql/client/.";

const mockTable = sqliteTable("test_table", {
  id: integer("id").primaryKey(),
  name: text("name"),
  role: text("role"),
});

// const client = new Database(':memory:');
const client = createClient({ url: ":memory" });
const db = drizzle(client);

describe("applyQueryOptions", () => {
  it("doit appliquer correctement le OR avec plusieurs colonnes (Correction Bug)", async () => {
    const baseQuery = db.select().from(mockTable).$dynamic();

    const resultQuery = await applyQueryOptions(baseQuery, mockTable, {
      or: [{ role: "admin", name: "Alice" }, { name: "Bob" }],
    });

    const { sql, params } = resultQuery.toSQL();

    // Vérifie que le SQL contient bien le OR et le AND interne
    // Structure attendue : WHERE (role = ? AND name = ?) OR (name = ?)
    expect(sql).toContain(
      'where ("test_table"."role" = ? and "test_table"."name" = ?) or "test_table"."name" = ?',
    );
    expect(params).toBe("admin");
    expect(params).toBe("Alice");
    expect(params).toBe("Bob");
  });

  it("doit respecter la limite de sécurité par défaut", async () => {
    const baseQuery = db.select().from(mockTable).$dynamic();
    const resultQuery = await applyQueryOptions(baseQuery, mockTable, {});

    const { params } = resultQuery.toSQL();
    // Le dernier paramètre est généralement la limite
    expect(params).toContain(DEFAULT_MAX_LIMIT);
  });

  it("doit combiner WHERE et WHERE IN", async () => {
    const baseQuery = db.select().from(mockTable).$dynamic();
    const resultQuery = await applyQueryOptions(baseQuery, mockTable, {
      where: { role: "user" },
      whereIn: { id: ["1", "2", "3"] },
    });

    const { sql, params } = resultQuery.toSQL();
    expect(sql).toContain(
      'where "test_table"."role" = ? and "test_table"."id" in (?, ?, ?)',
    );
    expect(params).toContain("user");
  });

  it("doit appliquer le tri multiple", async () => {
    const baseQuery = db.select().from(mockTable).$dynamic();
    const resultQuery = await applyQueryOptions(baseQuery, mockTable, {
      orderBy: [
        { column: "role", order: "desc" },
        { column: "id", order: "asc" },
      ],
    });

    const { sql } = resultQuery.toSQL();
    expect(sql).toContain(
      'order by "test_table"."role" desc, "test_table"."id" asc',
    );
  });
});

describe("mergeQueryOptions()", () => {
  it("doit fusionner les filtres 'where' en donnant la priorité à l'utilisateur", () => {
    const defaultOptions = { where: { role: "user", status: "active" } };
    const userOptions = { where: { role: "admin" } };

    const result = mergeQueryOptions(userOptions, defaultOptions);

    expect(result.where).toEqual({
      role: "admin", // Écrasé par l'user
      status: "active", // Conservé du défaut
    });
  });

  it("doit fusionner les objets 'search' et 'whereIn'", () => {
    const defaultOptions = {
      search: { email: "@company.com" },
      whereIn: { categoryId: [] },
    };
    const userOptions = {
      search: { name: "John" },
      whereIn: { categoryId: [] },
    };

    const result = mergeQueryOptions(userOptions, defaultOptions);

    expect(result.search).toEqual({ email: "@company.com", name: "John" });
    expect(result.whereIn?.categoryId).toEqual();
  });

  it("doit remplacer TOTALEMENT le tri par défaut si l'utilisateur en fournit un", () => {
    const defaultOptions = {
      orderBy: [{ column: "createdAt", order: "desc" }],
    };
    const userOptions = { orderBy: [{ column: "name", order: "asc" }] };

    const result = mergeQueryOptions(userOptions, defaultOptions);

    expect(result.orderBy).toHaveLength(1);
    expect(result.orderBy![0].column).toBe("name");
    // On vérifie que createdAt n'est plus là (le tri n'est pas additif)
    expect(result.orderBy).not.toContainEqual({
      column: "createdAt",
      order: "desc",
    });
  });

  it("doit utiliser le tri par défaut si l'utilisateur n'en fournit pas ou envoie un tableau vide", () => {
    const defaultOptions = { orderBy: [{ column: "id", order: "asc" }] };

    const resultWithUndefined = mergeQueryOptions({}, defaultOptions);
    const resultWithEmpty = mergeQueryOptions({ orderBy: [] }, defaultOptions);

    expect(resultWithUndefined.orderBy).toEqual(defaultOptions.orderBy);
    expect(resultWithEmpty.orderBy).toEqual(defaultOptions.orderBy);
  });

  it("doit concaténer les blocs 'or' pour accumuler les conditions", () => {
    const defaultOptions = { or: [{ isDeleted: false }] };
    const userOptions = { or: [{ role: "guest" }] };

    const result = mergeQueryOptions(userOptions, defaultOptions);

    expect(result.or).toHaveLength(2);
    expect(result.or).toEqual([{ isDeleted: false }, { role: "guest" }]);
  });

  it("doit brider la 'limit' à DEFAULT_MAX_LIMIT même si l'utilisateur demande plus", () => {
    const userOptions = { limit: 5000 }; // Tentative d'abuser de l'API

    const result = mergeQueryOptions(userOptions);

    expect(result.limit).toBe(DEFAULT_MAX_LIMIT); // Typiquement 100
  });

  it("doit gérer les paramètres manquants (undefined) sans planter", () => {
    // Test de robustesse extrême
    const result = mergeQueryOptions(undefined, undefined);

    expect(result).toMatchObject({
      limit: expect.any(Number),
      offset: 0,
      where: {},
      whereIn: {},
      search: {},
      or: [],
      orderBy: [],
    });
  });

  it("doit gérer le cas où l'utilisateur fournit des valeurs null/undefined pour des filtres", () => {
    const defaultOptions = { where: { schoolId: 10 } };
    const userOptions = { where: { schoolId: undefined } };

    const result = mergeQueryOptions(userOptions, defaultOptions);
    expect(result.where).toHaveProperty("schoolId", undefined);
  });
});
