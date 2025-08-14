import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import {
  ClassRoomService,
  OptionService,
  StudyYearService,
  SchoolService,
} from "@/main/db/services";
import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";
import type {
  WithSchoolId,
  WithSchoolAndYearId,
  ClassAttributesInsert,
  OptionAttributesInsert,
  SchoolAttributesInsert,
  StudyYearAttributesInsert,
} from "@/commons/types/services";
import { WithSchoolIdParams } from "./types";

// --- Routes pour Options ---

/**
 * @route GET /options
 * @description Récupère la liste de toutes les options pour une école et une année données.
 */
server.get<any, WithSchoolId<{}>>(
  "options",
  async ({ params: { schoolId } }) => {
    try {
      const options = await OptionService.findAll(schoolId);
      return response(mapModelsToPlainList(options));
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
server.post<any, OptionAttributesInsert, WithSchoolAndYearId<{}>>(
  "options",
  async ({ data }) => {
    try {
      const newOption = await OptionService.create(data);
      return response(mapModelToPlain(newOption));
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
server.put<
  any,
  Partial<OptionAttributesInsert>,
  WithSchoolIdParams<{ optionId: string }>
>("options", async ({ params: { schoolId, optionId }, data }) => {
  try {
    const updatedOption = await OptionService.update(schoolId, optionId, data);
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
});

/**
 * @route DELETE /options
 * @description Supprime une option.
 */
server.delete<any, WithSchoolIdParams<{ optionId: string }>>(
  "options",
  async ({ params: { schoolId, optionId } }) => {
    try {
      const success = await OptionService.delete(schoolId, optionId);
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

// --- Routes pour StudyYears ---

/**
 * @route GET /study-years
 * @description Récupère la liste de toutes les années d'étude pour une école donnée.
 */
server.get<any, WithSchoolId<{}>>(
  "study-years",
  async ({ params: { schoolId } }) => {
    try {
      const studyYears = await mapModelsToPlainList(
        StudyYearService.findAll(schoolId)
      );
      return response(studyYears);
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
 * @route POST /study-years
 * @description Crée une nouvelle année d'étude.
 */
server.post<any, StudyYearAttributesInsert, WithSchoolId<{}>>(
  "study-years",
  async ({ data }) => {
    try {
      const newStudyYear = await mapModelToPlain(StudyYearService.create(data));
      return response(newStudyYear);
    } catch (error) {
      console.error(`Erreur lors de la création de l'année d'étude: ${error}`);
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la création de l'année d'étude."
      );
    }
  }
);

/**
 * @route PUT /study-years
 * @description Met à jour une année d'étude existante.
 */
server.put<
  any,
  Partial<StudyYearAttributesInsert>,
  WithSchoolIdParams<{ studyYearId: string }>
>("study-years", async ({ params: { schoolId, studyYearId }, data }) => {
  try {
    const updatedStudyYear = await StudyYearService.update(
      schoolId,
      studyYearId,
      data
    );
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
      `Erreur lors de la mise à jour de l'année d'étude ${studyYearId}: ${error}`
    );
    return response(
      {},
      Status.INTERNAL_SERVER,
      "Erreur interne du serveur lors de la mise à jour de l'année d'étude."
    );
  }
});

/**
 * @route DELETE /study-years
 * @description Supprime une année d'étude.
 */
server.delete<any, WithSchoolIdParams<{ studyYearId: string }>>(
  "study-years",
  async ({ params: { schoolId, studyYearId } }) => {
    try {
      const success = await StudyYearService.delete(schoolId, studyYearId);
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
        `Erreur lors de la suppression de l'année d'étude ${studyYearId}: ${error}`
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
    return response(mapModelsToPlainList(SchoolService.findAll()));
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
server.get<any, WithSchoolIdParams<{}>>(
  "schools/:schoolId",
  async ({ params: { schoolId } }) => {
    try {
      const school = await SchoolService.findById(schoolId);
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
server.post<any, SchoolAttributesInsert, {}>("schools", async ({ data }) => {
  try {
    return response(mapModelToPlain(SchoolService.create(data)));
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
server.put<any, Partial<SchoolAttributesInsert>, WithSchoolIdParams<{}>>(
  "schools",
  async ({ params: { schoolId }, data }) => {
    try {
      const updatedSchool = await SchoolService.update(schoolId, data);
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
server.delete<any, WithSchoolIdParams<{}>>(
  "schools",
  async ({ params: { schoolId } }) => {
    try {
      const success = await SchoolService.delete(schoolId);
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
