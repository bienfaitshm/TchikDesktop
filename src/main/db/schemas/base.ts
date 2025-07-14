import { text, integer } from "drizzle-orm/sqlite-core";
import ShortUniqueId from "short-unique-id";

const shordId = new ShortUniqueId({ length: 5 });

export const commonFieldTable = {
  id: text("id", { length: 10 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => shordId.randomUUID()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
};
