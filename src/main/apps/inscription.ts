import { server } from "@/camons/libs/electron-apis/server";
import * as queries from "@/main/db/queries/inscription";
import { response } from "@/camons/libs/electron-apis/utils";

server.get<any, any>("students-in-classe", async ({ params }) => {
  const classes = await queries.getStudentsInClass(params.classeId);
  return response(classes);
});

server.get<any, any>("students-in-classe", async ({ params }) => {
  const classes = await queries.getClassesForStudent(params.eleveId);
  return response(classes);
});

server.post<any, any>("classes", async ({ data }) => {
  const classe = await queries.enrollStudentInClass(
    data.eleveId,
    data.classeId
  );
  return response(classe);
});

// server.put<any, any>("classes", async ({ data }) => {
//   const classe = await queries.updateClasse(data.id_classe, data);
//   return response(classe);
// });
