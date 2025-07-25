import { server } from "@/camons/libs/electron-apis/server";
import { getUsers, createUser } from "@/main/db/queries/account";
import { response } from "@/camons/libs/electron-apis/utils";
// import { dialogSaveDocxFile } from "@/main/libs/save-files";
// import { generateDocxReport, resolveTemplatePath } from "@/main/libs/docx";

server.get("users", async () => {
  const users = await getUsers();
  return response(users);
});

server.post<any, any>("users", async ({ data }) => {
  const user = await createUser({ ...data });
  return response(user);
  // try {
  //   const user =
  //   console.log("data", data, user);
  // } catch (error) {
  //   console.log("DB Error", error);
  // }
  // // const content = await generateDocxReport(resolveTemplatePath("hello.docx"), {
  // //   name: user.name,
  // // });
  // // await dialogSaveDocxFile(`${user.name}-document.docx`, content);
  // return response({});
});
