import { text } from "drizzle-orm/sqlite-core";
import ShortUniqueId from "short-unique-id";

const shordId = new ShortUniqueId({ length: 5 });

export const commonFieldTable = {
  id: text("id", { length: 10 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => shordId.randomUUID()),
  updatedAt: text("updated_at"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
};
