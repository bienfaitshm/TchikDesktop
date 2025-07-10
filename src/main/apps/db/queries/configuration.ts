import { db } from "../config"
import { users } from "@/main/apps/db/schemas"

export async function getUsers() {
    return db.select().from(users)
}
