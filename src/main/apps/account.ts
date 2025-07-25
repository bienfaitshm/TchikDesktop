import { server } from "@/camons/libs/electron-apis/server";
import * as queries from "@/main/db/queries/account";
import { response } from "@/camons/libs/electron-apis/utils";

server.get<any, any>("users", async ({}) => {
  const classes = await queries.getUsers();
  return response(classes);
});

server.get<any, any>("user", async ({ params }) => {
  const classes = await queries.getUserById(params.userId);
  return response(classes);
});

server.get<any, any>("user-email", async ({ params }) => {
  const classes = await queries.getUserById(params.email);
  return response(classes);
});

server.get<any, any>("users-roles", async () => {
  const classes = await queries.getUsersWithRoles();
  return response(classes);
});

server.post<any, any>("user-assign-role", async ({ data }) => {
  const classe = await queries.assignRoleToUser(data.userId, data.roleId);
  return response(classe);
});

// server.put<any, any>("classes", async ({ data }) => {
//   const classe = await queries.updateClasse(data.id_classe, data);
//   return response(classe);
// });
