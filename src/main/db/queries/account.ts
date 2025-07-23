import { User } from "@/main/db/schemas/account";
import { mapModelsToPlainList, mapModelToPlain } from "./utils";

export async function getUsers() {
  return await mapModelsToPlainList(User.findAll());
}

export async function createUser(value: {
  firstName: string;
  lastName: string;
}) {
  return await mapModelToPlain(User.create(value));
}
