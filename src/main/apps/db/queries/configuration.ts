import { db } from "../config";
import { users, InsertUser, SelectUser } from "@/main/apps/db/schemas";

export async function getUsers() {
  return db.select().from(users);
}

export async function createUser(value: InsertUser): Promise<SelectUser> {
  const _users = db.insert(users).values(value).returning();
  return _users[0];
}
