import { server } from "@/camons/libs/electron-apis/server";
import { getUsers } from "./db/queries/configuration";
import { response } from "@/camons/libs/electron-apis/utils";

server.get("configuration", async () => {
  const result = await getUsers();
  console.log("result", result);
  return response(result);
});

server.post("configuration", async (result) => {
  console.log("result apis", JSON.stringify(result, null, 4));
  return {
    result: "ok",
  };
});
