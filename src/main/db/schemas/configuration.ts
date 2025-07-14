import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { commonFieldTable } from "./base";

export const users = sqliteTable("users", {
  ...commonFieldTable,
  name: text("name", { length: 256 }).notNull(),
  is_admin: integer({ mode: "boolean" }).notNull().default(false),
});

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export const authentication = sqliteTable("authentication", {
  ...commonFieldTable,
  name: text("name", { length: 256 }).notNull(),
});

export type InsertAuthentication = typeof authentication.$inferInsert;
export type SelectAuthentication = typeof authentication.$inferSelect;
