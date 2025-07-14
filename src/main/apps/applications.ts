import { server } from "@/camons/libs/electron-apis/server";
import { getUsers, createUser } from "@/main/db/queries/configuration";
import { response } from "@/camons/libs/electron-apis/utils";
import { dialogSaveDocxFile } from "@/main/libs/save-files";
import { generateDocxReport, resolveTemplatePath } from "@/main/libs/docx";

server.get("configuration", async () => {
  const users = await getUsers();
  console.log("Fetched users:", users);
  return response(users);
});

server.post<any, { name: string }>("configuration", async ({ data }) => {
  const user = await createUser(data);
  const content = await generateDocxReport(resolveTemplatePath("hello.docx"), {
    name: user.name,
  });
  await dialogSaveDocxFile(`${user.name}-document.docx`, content);
  console.log("data", data, user);
  return response({});
});
