// import { drizzle } from "drizzle-orm/libsql"
// import { defineConfig } from "drizzle-kit"

// export const db = drizzle("main/db.db")

// export default defineConfig({
//     dialect: "sqlite", // 'mysql' | 'sqlite' | 'turso'
//     schema: "./schemas",
// })

import "dotenv/config"
import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"

export const client = createClient({ url: process.env.DB_FILE_NAME! })
export const db = drizzle({ client })
