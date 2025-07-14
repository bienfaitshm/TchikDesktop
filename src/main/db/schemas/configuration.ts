import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { commonFieldTable } from "./base";

export const users = sqliteTable("users", {
  ...commonFieldTable,
  name: text("name", { length: 256 }).notNull(),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;
