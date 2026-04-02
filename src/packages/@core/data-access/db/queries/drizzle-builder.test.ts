import { describe, it, expect } from "vitest";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { applyQueryOptions, DEFAULT_MAX_LIMIT } from "./drizzle-builder";
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
