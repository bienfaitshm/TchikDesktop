import { server } from "@/camons/libs/electron-apis/server";
import { getUsers, createUser } from "./db/queries/configuration";
import { response } from "@/camons/libs/electron-apis/utils";

server.get("configuration", async () => {
  const users = await getUsers();
  console.log("Fetched users:", users);
  return response(users);
});

server.post<any, { name: string }>("configuration", async ({ data }) => {
  const user = await createUser(data);
  console.log("data", data, user);
  return response({});
});
