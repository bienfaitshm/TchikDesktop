import { server } from "@/camons/libs/electron-apis/server";
import * as queries from "@/main/db/queries/school";
import { response } from "@/camons/libs/electron-apis/utils";

server.get("classes", async () => {
  const classes = await queries.getAllClassesWithDetails();
  return response(classes);
});

server.post<any, any>("classes", async ({ data }) => {
  const classe = await queries.createClasse(data);
  return response(classe);
});

server.put<any, any>("classes", async ({ data }) => {
  const classe = await queries.updateClasse(data.id_classe, data);
  return response(classe);
});
