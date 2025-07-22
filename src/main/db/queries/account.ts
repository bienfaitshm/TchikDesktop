import { User } from "@/main/db/schemas/account";

export async function getUsers() {
  return await User.findAll();
}

export async function createUser(value: {
  firstName: string;
  lastName: string;
}) {
  return await User.create(value);
}
