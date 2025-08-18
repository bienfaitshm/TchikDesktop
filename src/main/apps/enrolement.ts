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
import { Status } from "@/commons/libs/electron-apis/constant";

server.get<any, QueryParams<WithSchoolAndYearId, Partial<TEnrolementInsert>>>(
  "enrolements",
  async ({ params }) => {
    return response(mapModelsToPlainList(services.getEnrolements(params)));
  }
);

server.get<any, { enrolementId: string }>(
  "enrolements/:enrolementId",
  async ({ params: { enrolementId } }) => {
    const result = await services.getEnrolement(enrolementId);
    if (!result) {
      return response({}, Status.NOT_FOUND, "L'inscription no trouvee");
    }
    return response(mapModelToPlain(result));
  }
);

server.post<any, TQuickEnrolementInsert>(
  "enrolements/quick",
  async ({ data }) => {
    return response(mapModelToPlain(services.createQuickEnrolement(data)));
  }
);

server.put<any, Partial<TEnrolementInsert>, { enrolementId: string }>(
  "enrolements/:enrolementId",
  async ({ data, params: { enrolementId } }) => {
    const update = await services.updateEnrolement(enrolementId, data);
    if (!update) {
      return response({}, Status.NOT_FOUND, "L'inscription no trouvee");
    }
    return response(mapModelToPlain(update));
  }
);

server.delete<any, { enrolementId: string }>(
  "enrolements/:enrolementId",
  async ({ params: { enrolementId } }) => {
    try {
      const success = await services.deleteEnrolement(enrolementId);
      if (success) {
        return response({ message: "Inscription supprimée avec succès." });
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Inscription non trouvée ou impossible à supprimer."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'Inscription ${enrolementId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la suppression de l'Inscription."
      );
    }
  }
);
