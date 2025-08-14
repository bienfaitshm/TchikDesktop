import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import * as services from "@/main/db/services/classroom";
import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";
import type {
  WithSchoolAndYearId,
  QueryParams,
} from "@/commons/types/services";
import { TClassroomInsert } from "@/commons/types/models";

// --- Routes pour Classrooms ---

/**
 * @route GET /classrooms
 * @description Récupère la liste de toutes les salles de classe pour une école donnée.
 */
server.get<any, QueryParams<WithSchoolAndYearId, Partial<TClassroomInsert>>>(
  "classrooms",
  async ({ params }) => {
    try {
      return response(mapModelsToPlainList(services.getClassrooms(params)));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des salles de classe: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération des salles de classe."
      );
    }
  }
);

server.get<any, { classId: string }>(
  "classrooms/:classId",
  async ({ params: { classId } }) => {
    try {
      const classroom = await services.getClassroom(classId);
      if (classroom) return response(mapModelToPlain(classroom));
      return response({}, Status.NOT_FOUND, "Salle de classe non trouvée.");
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des salles de classe: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération des salles de classe."
      );
    }
  }
);

/**
 * @route POST /classrooms
 * @description Crée une nouvelle salle de classe.
 */
server.post<any, TClassroomInsert, any>("classrooms", async ({ data }) => {
  try {
    return response(mapModelToPlain(services.createClassroom(data)));
  } catch (error) {
    console.error(`Erreur lors de la création de la salle de classe: ${error}`);
    return response(
      {},
      Status.INTERNAL_SERVER,
      "Erreur interne du serveur lors de la création de la salle de classe."
    );
  }
});

/**
 * @route PUT /classrooms
 * @description Met à jour une salle de classe existante.
 */
server.put<any, Partial<TClassroomInsert>, { classId: string }>(
  "classrooms",
  async ({ params: { classId }, data }) => {
    try {
      const updatedClassroom = await services.updateClassroom(classId, data);
      if (updatedClassroom) {
        return response(mapModelToPlain(updatedClassroom));
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Salle de classe non trouvée ou aucune mise à jour effectuée."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de la salle de classe ${classId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la mise à jour de la salle de classe."
      );
    }
  }
);

/**
 * @route DELETE /classrooms
 * @description Supprime une salle de classe.
 */
server.delete<any, { classId: string }>(
  "classrooms",
  async ({ params: { classId } }) => {
    try {
      const success = await services.deleteClassroom(classId);
      if (success) {
        return response({ message: "Salle de classe supprimée avec succès." });
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Salle de classe non trouvée ou impossible à supprimer."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de la salle de classe ${classId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la suppression de la salle de classe."
      );
    }
  }
);
