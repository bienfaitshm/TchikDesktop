import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/packages/@core/data-access/db/schemas/schema.ts",
  dbCredentials: {
    url: "sqlite.db",
  },
});
