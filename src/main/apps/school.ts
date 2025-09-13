import type {
  WithSchoolId,
  TSchoolInsert,
  TStudyYearInsert,
  QueryParams,
} from "@/commons/types/services";
import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";

import * as services from "@/main/db/services/school";

// --- Routes pour StudyYears ---

/**
 * @route GET /study-years
 * @description Récupère la liste de toutes les années d'étude pour une école donnée.
 */
server.get<any, QueryParams<WithSchoolId, TStudyYearInsert>>(
  "study-years",
  async ({ params: { schoolId, params } }) => {
    try {
      return response(
        mapModelsToPlainList(services.getStudyYears(schoolId, params))
      );
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des années d'étude: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération des années d'étude."
      );
    }
  }
);

/**
 * @route GET /schools/:schoolId
 * @description Récupère une école par son ID.
 */
server.get<any, { yearId: string }>(
  "study-years/:yearId",
  async ({ params: { yearId } }) => {
    try {
      const school = await services.getStudyYear(yearId);
      if (school) {
        return response(mapModelToPlain(school));
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Année d'étude non trouvée ou aucune mise à jour effectuée."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'année d'étude ${yearId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la mise à jour de l'année d'étude."
      );
    }
  }
);

/**
 * @route POST /study-years
 * @description Crée une nouvelle année d'étude.
 */
server.post<any, TStudyYearInsert>("study-years", async ({ data }) => {
  try {
    return response(mapModelToPlain(services.createStudyYear(data)));
  } catch (error) {
    console.error(`Erreur lors de la création de l'année d'étude: ${error}`);
    return response(
      {},
      Status.INTERNAL_SERVER,
      "Erreur interne du serveur lors de la création de l'année d'étude."
    );
  }
});

/**
 * @route PUT /study-years
 * @description Met à jour une année d'étude existante.
 */
server.put<any, Partial<TStudyYearInsert>, { yearId: string }>(
  "study-years/:yearId",
  async ({ params: { yearId }, data }) => {
    try {
      const updatedStudyYear = await services.updateStudyYear(yearId, data);
      if (updatedStudyYear) {
        return response(await mapModelToPlain(updatedStudyYear));
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Année d'étude non trouvée ou aucune mise à jour effectuée."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'année d'étude ${yearId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la mise à jour de l'année d'étude."
      );
    }
  }
);

/**
 * @route DELETE /study-years
 * @description Supprime une année d'étude.
 */
server.delete<any, { yearId: string }>(
  "study-years/:yearId",
  async ({ params: { yearId } }) => {
    try {
      const success = await services.deleteStudyYear(yearId);
      if (success) {
        return response({ message: "Année d'étude supprimée avec succès." });
      }
      return response(
        {},
        Status.NOT_FOUND,
        "Année d'étude non trouvée ou impossible à supprimer."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'année d'étude ${yearId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la suppression de l'année d'étude."
      );
    }
  }
);

/**
 * @route GET /schools
 * @description Récupère la liste de toutes les écoles.
 */
server.get("schools", async () => {
  try {
    return response(mapModelsToPlainList(services.getSchools()));
  } catch (error) {
    console.error(`Erreur lors de la récupération des écoles: ${error}`);
    return response(
      {},
      Status.INTERNAL_SERVER,
      "Erreur interne du serveur lors de la récupération des écoles."
    );
  }
});

/**
 * @route GET /schools/:schoolId
 * @description Récupère une école par son ID.
 */
server.get<any, WithSchoolId>(
  "schools/:schoolId",
  async ({ params: { schoolId } }) => {
    try {
      const school = await services.getSchool(schoolId);
      if (school) {
        return response(mapModelToPlain(school));
      }
      return response({}, Status.NOT_FOUND, "École non trouvée.");
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'école ${schoolId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération de l'école."
      );
    }
  }
);

/**
 * @route POST /schools
 * @description Crée une nouvelle école.
 */
server.post<any, TSchoolInsert>("schools", async ({ data }) => {
  try {
    return response(mapModelToPlain(services.createSchool(data)));
  } catch (error) {
    console.error(`Erreur lors de la création de l'école: ${error}`);
    return response(
      {},
      Status.INTERNAL_SERVER,
      "Erreur interne du serveur lors de la création de l'école."
    );
  }
});

/**
 * @route PUT /schools
 * @description Met à jour une école existante.
 */
server.put<any, Partial<TSchoolInsert>, WithSchoolId>(
  "schools/:schoolId",
  async ({ params: { schoolId }, data }) => {
    try {
      const updatedSchool = await services.updateSchool(schoolId, data);
      if (updatedSchool) {
        return response(mapModelToPlain(updatedSchool));
      }
      return response(
        {},
        Status.NOT_FOUND,
        "École non trouvée ou aucune mise à jour effectuée."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'école ${schoolId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la mise à jour de l'école."
      );
    }
  }
);

/**
 * @route DELETE /schools
 * @description Supprime une école.
 */
server.delete<any, WithSchoolId>(
  "schools/:schoolId",
  async ({ params: { schoolId } }) => {
    try {
      const success = await services.deleteSchool(schoolId);
      if (success) {
        return response({ message: "École supprimée avec succès." });
      }
      return response(
        {},
        Status.NOT_FOUND,
        "École non trouvée ou impossible à supprimer."
      );
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'école ${schoolId}: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la suppression de l'école."
      );
    }
  }
);
