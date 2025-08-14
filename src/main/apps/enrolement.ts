import type {
  TQuickEnrolementInsert,
  WithSchoolAndYearId,
  QueryParams,
} from "@/camons/types/services";
import type { TEnrolementInsert } from "@/camons/types/models";
import { server } from "@/camons/libs/electron-apis/server";
import { response } from "@/camons/libs/electron-apis/utils";
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
