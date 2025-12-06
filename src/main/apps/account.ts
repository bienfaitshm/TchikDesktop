import { server } from "@/commons/libs/electron-apis/server";
import { ipcServer } from "./config.ipc.server";
import { response } from "@/commons/libs/electron-apis/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";
import * as services from "@/main/db/services/account";
import {
  QueryParams,
  TUserInsert,
  WithSchoolAndYearId,
} from "@/commons/types/services";

/**
 * @route GET /users
 * @description Récupère la liste de tous les utilisateurs pour une école donnée.
 */
ipcServer.get<
  any,
  QueryParams<
    WithSchoolAndYearId,
    Partial<
      TUserInsert & {
        classroomId: string;
      }
    >
  >
>("users", async ({ params }) => {
  try {
    const users = await services.getUsers(params);
    return response(mapModelsToPlainList(users));
  } catch (error) {
    console.error(`Erreur lors de la récupération des utilisateurs: ${error}`);
    return response(
      {},
      Status.INTERNAL_SERVER,
      "Erreur interne du serveur lors de la récupération des utilisateurs."
    );
  }
});

/**
 * @route POST /users
 * @description Crée un nouvel utilisateur.
 */
server.post<any, TUserInsert>("users", async ({ data }) => {
  try {
    return response(mapModelToPlain(services.createUser(data)));
  } catch (error) {
    console.error(`Erreur lors de la création de l'utilisateur: ${error}`);
    return response(
      {},
      Status.INTERNAL_SERVER,
      "Erreur interne du serveur lors de la création de l'utilisateur."
    );
  }
});

/**
 * @route PUT /users
 * @description Met à jour un utilisateur existant.
 */
server.put<any, Partial<TUserInsert>, { userId: string }>(
  "users/:userId",
  async ({ params: { userId }, data }) => {
    try {
      const updatedUser = await services.updateUser(userId, data);
      if (updatedUser) {
        return response(mapModelToPlain(updatedUser));
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Utilisateur non trouvé ou aucune mise à jour effectuée."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'utilisateur ${userId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la mise à jour de l'utilisateur."
      );
    }
  }
);

/**
 * @route DELETE /users
 * @description Supprime un utilisateur.
 */
server.delete<any, { userId: string }>(
  "users/:userId",
  async ({ params: { userId } }) => {
    try {
      const success = await services.deleteUser(userId);
      if (success) {
        return response({ message: "Utilisateur supprimé avec succès." });
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Utilisateur non trouvé ou impossible à supprimer."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'utilisateur ${userId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la suppression de l'utilisateur."
      );
    }
  }
);
