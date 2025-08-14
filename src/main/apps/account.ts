import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import { UserService } from "@/main/db/services";
import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";
import type { UserAttributes, WithSchoolId } from "@/main/db/services/types";

// Type utilitaire pour les paramètres avec schoolId et userId
type UserRouteParams = WithSchoolId<{ userId: string }>;

/**
 * @route GET /users
 * @description Récupère la liste de tous les utilisateurs pour une école donnée.
 */
server.get<any, WithSchoolId<{}>>("users", async ({ params: { schoolId } }) => {
  try {
    const users = await UserService.findAll(schoolId);
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
server.post<any, WithSchoolId<UserAttributes>, WithSchoolId<{}>>(
  "users",
  async ({ data, params: { schoolId } }) => {
    try {
      const newUser = await UserService.create({ ...data, schoolId });
      return response(mapModelToPlain(newUser));
    } catch (error) {
      console.error(`Erreur lors de la création de l'utilisateur: ${error}`);
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la création de l'utilisateur."
      );
    }
  }
);

/**
 * @route PUT /users
 * @description Met à jour un utilisateur existant.
 */
server.put<any, Partial<UserAttributes>, UserRouteParams>(
  "users",
  async ({ params: { schoolId, userId }, data }) => {
    try {
      const updatedUser = await UserService.update(schoolId, userId, data);
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
server.delete<any, UserRouteParams>(
  "users",
  async ({ params: { schoolId, userId } }) => {
    try {
      const success = await UserService.delete(schoolId, userId);
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
