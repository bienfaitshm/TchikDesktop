import { server } from "@/camons/libs/electron-apis/server";
import { response } from "@/camons/libs/electron-apis/utils";
import { Status } from "@/camons/libs/electron-apis/constant";
import {
  ClassRoomService,
  OptionService,
  StudyYearService,
} from "@/main/db/services";
import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";
import type {
  ClassAttributes,
  OptionAttributes, // Assumé pour les services d'option
  StudyYearAttributes, // Assumé pour les services d'année d'étude
  WithSchoolId,
  WithSchoolAndYearId,
} from "@/main/db/services/types";
import { WithSchoolIdParams } from "./types";

// --- Routes pour Classrooms ---

/**
 * @route GET /classrooms
 * @description Récupère la liste de toutes les salles de classe pour une école donnée.
 */
server.get<any, WithSchoolId<{ yearId?: string }>>(
  "classrooms",
  async ({ params: { schoolId, yearId } }) => {
    try {
      const classrooms = await ClassRoomService.findAll(schoolId, yearId);
      return response(mapModelsToPlainList(classrooms));
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
server.post<any, WithSchoolAndYearId<ClassAttributes>, WithSchoolAndYearId<{}>>(
  "classrooms",
  async ({ data, params: { schoolId } }) => {
    try {
      const newClassroom = await ClassRoomService.create({ ...data, schoolId });
      return response(mapModelToPlain(newClassroom));
    } catch (error) {
      console.error(
        `Erreur lors de la création de la salle de classe: ${error}`
      );
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la création de la salle de classe."
      );
    }
  }
);

/**
 * @route PUT /classrooms
 * @description Met à jour une salle de classe existante.
 */
server.put<
  any,
  Partial<ClassAttributes>,
  WithSchoolIdParams<{ classId: string }>
>("classrooms", async ({ params: { schoolId, classId }, data }) => {
  try {
    const updatedClassroom = await ClassRoomService.update(
      schoolId,
      classId,
      data
    );
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
});

/**
 * @route DELETE /classrooms
 * @description Supprime une salle de classe.
 */
server.delete<any, WithSchoolIdParams<{ classId: string }>>(
  "classrooms",
  async ({ params: { schoolId, classId } }) => {
    try {
      const success = await ClassRoomService.delete(schoolId, classId);
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
server.post<
  any,
  WithSchoolAndYearId<OptionAttributes>,
  WithSchoolAndYearId<{}>
>("options", async ({ data, params: { schoolId } }) => {
  try {
    const newOption = await OptionService.create({ ...data, schoolId });
    return response(mapModelToPlain(newOption));
  } catch (error) {
    console.error(`Erreur lors de la création de l'option: ${error}`);
    return response(
      {},
      Status.INTERNAL_SERVER,
      "Erreur interne du serveur lors de la création de l'option."
    );
  }
});

/**
 * @route PUT /options
 * @description Met à jour une option existante.
 */
server.put<
  any,
  Partial<OptionAttributes>,
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
      const studyYears = await StudyYearService.findAll(schoolId);
      return response(mapModelsToPlainList(studyYears));
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
server.post<any, WithSchoolId<StudyYearAttributes>, WithSchoolId<{}>>(
  "study-years",
  async ({ data, params: { schoolId } }) => {
    try {
      const newStudyYear = await StudyYearService.create({ ...data, schoolId });
      return response(mapModelToPlain(newStudyYear));
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
  Partial<StudyYearAttributes>,
  WithSchoolIdParams<{ studyYearId: string }>
>("study-years", async ({ params: { schoolId, studyYearId }, data }) => {
  try {
    const updatedStudyYear = await StudyYearService.update(
      schoolId,
      studyYearId,
      data
    );
    if (updatedStudyYear) {
      return response(mapModelToPlain(updatedStudyYear));
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
