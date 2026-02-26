import type {
  TOption,
  TOptionInsert,
  QueryParams,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { Status } from "@/commons/libs/electron-apis/constant";

import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";
import * as services from "@/main/db/services/option";

// --- Routes pour Options ---

/**
 * @route GET /options
 * @description Récupère la liste de toutes les options pour une école et une année données.
 */
server.get<any, QueryParams<WithSchoolAndYearId, TOptionInsert>>(
  "options",
  async ({ params }) => {
    try {
      return response(mapModelsToPlainList(services.getOptions(params)));
    } catch (error) {
      console.error(`Erreur lors de la récupération des options: ${error}`);
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération des options."
      );
    }
  }
);

/**
 * @route POST /options
 * @description Crée une nouvelle option.
 */
server.post<any, TOptionInsert, WithSchoolAndYearId<{}>>(
  "options",
  async ({ data }) => {
    try {
      return response(mapModelToPlain(services.createOption(data)));
    } catch (error) {
      console.error(`Erreur lors de la création de l'option: ${error}`);
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la création de l'option."
      );
    }
  }
);

/**
 * @route PUT /options
 * @description Met à jour une option existante.
 */
server.put<any, Partial<TOptionInsert>, { optionId: string }>(
  "options/:optionId",
  async ({ params: { optionId }, data }) => {
    try {
      const updatedOption = await services.updateOption(optionId, data);
      if (updatedOption) {
        return response(mapModelToPlain(updatedOption));
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Option non trouvée ou aucune mise à jour effectuée."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'option ${optionId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la mise à jour de l'option."
      );
    }
  }
);

/**
 * @route DELETE /options
 * @description Supprime une option.
 */
server.delete<any, Pick<TOption, "optionId">>(
  "options/:optionId",
  async ({ params: { optionId } }) => {
    try {
      const success = await services.deleteOption(optionId);
      if (success) {
        return response({ message: "Option supprimée avec succès." });
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Option non trouvée ou impossible à supprimer."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'option ${optionId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la suppression de l'option."
      );
    }
  }
);
