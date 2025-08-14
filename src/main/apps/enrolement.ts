import type {
  TQuickEnrolementInsert,
  WithSchoolAndYearId,
  QueryParams,
} from "@/commons/types/services";
import type { TEnrolementInsert } from "@/commons/types/models";
import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { mapModelsToPlainList, mapModelToPlain } from "@/main/db/models/utils";
import * as services from "@/main/db/services/enrolements";

server.post<any, TQuickEnrolementInsert>(
  "enrolements/quick",
  async ({ data }) => {
    return response(mapModelToPlain(services.createQuickEnrolement(data)));
  }
);

server.get<any, QueryParams<WithSchoolAndYearId, Partial<TEnrolementInsert>>>(
  "enrolements",
  async ({ params }) => {
    return response(mapModelsToPlainList(services.getEnrolements(params)));
  }
);

server.post("enrolements", async () => {
  return response({});
});

server.delete("enrolements", async () => {
  return response({});
});
