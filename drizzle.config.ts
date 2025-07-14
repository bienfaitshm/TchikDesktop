import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./Drizzle",
  schema: "./src/main/db/schemas",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME!,
  },
});
