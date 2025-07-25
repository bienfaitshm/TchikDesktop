import { server } from "@/camons/libs/electron-apis/server";
import { getUsers, createUser } from "@/main/db/queries/account";
import { response } from "@/camons/libs/electron-apis/utils";
// import { dialogSaveDocxFile } from "@/main/libs/save-files";
// import { generateDocxReport, resolveTemplatePath } from "@/main/libs/docx";

server.get("users", async () => {
  const users = await getUsers();
  console.log("Fetched users:", users);
  return response(users);
});

server.post<any, { firstName: string; lastName: string }>(
  "users",
  async ({ data }) => {
    try {
      const user = await createUser({ ...data });
      console.log("data", data, user);
    } catch (error) {
      console.log("DB Error", error);
    }
    // const content = await generateDocxReport(resolveTemplatePath("hello.docx"), {
    //   name: user.name,
    // });
    // await dialogSaveDocxFile(`${user.name}-document.docx`, content);
    return response({});
  }
);
