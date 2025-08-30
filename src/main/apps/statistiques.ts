import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import * as services from "@/main/db/services/statistiques";
import { mapModelToPlain, mapModelsToPlainList } from "@/main/db/models/utils";
import type { WithSchoolAndYearId } from "@/commons/types/services";

/**
 * Endpoint pour récupérer le nombre total d'élèves dans une école et/ou une année.
 * Requête GET: /statistiques/total-students
 * Paramètres: { schoolId: string, yearId?: string }
 */
server.get<any, WithSchoolAndYearId>(
  "statistiques/total-students",
  async ({ params }) => {
    try {
      return response(services.getTotalStudentsInSchool(params));
    } catch (error) {
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération du nombre total d'élèves."
      );
    }
  }
);

/**
 * Endpoint pour récupérer le nombre d'élèves par section dans une école.
 * Requête GET: /statistiques/students-by-section
 * Paramètres: { schoolId: string, yearId?: string }
 */
server.get<any, WithSchoolAndYearId>(
  "statistiques/students-by-section",
  async ({ params }) => {
    try {
      return response(
        mapModelsToPlainList(services.getStudentsBySection(params))
      );
    } catch (error) {
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération des élèves par section."
      );
    }
  }
);

/**
 * Endpoint pour récupérer le nombre de garçons et de filles pour chaque classe.
 * Requête GET: /statistiques/gender-count-by-class
 * Paramètres: { schoolId: string, yearId?: string }
 */
server.get<any, WithSchoolAndYearId>(
  "statistiques/gender-count-by-class",
  async ({ params }) => {
    try {
      return response(
        mapModelsToPlainList(services.getGenderCountByClassAndSection(params))
      );
    } catch (error) {
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération du décompte des genres par classe."
      );
    }
  }
);

/**
 * Endpoint pour récupérer le nombre d'élèves par option pour la section secondaire.
 * Requête GET: /statistiques/students-by-option/secondary
 * Paramètres: { schoolId: string, yearId?: string }
 */
server.get<any, WithSchoolAndYearId>(
  "statistiques/students-by-option/secondary",
  async ({ params }) => {
    try {
      return response(
        mapModelsToPlainList(services.getStudentsByOptionForSecondary(params))
      );
    } catch (error) {
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération des élèves par option pour le secondaire."
      );
    }
  }
);

/**
 * Endpoint pour récupérer le nombre de filles et de garçons pour une classe spécifique.
 * Requête GET: /statistiques/gender-count/class/:classId
 * Paramètres: { classId: string }
 */
server.get<any, { classId: string }>(
  "statistiques/gender-count/class/:classId",
  async ({ params }) => {
    try {
      const result = await services.getGenderCountForClass(params.classId);
      if (result) {
        return response(mapModelToPlain(result));
      }
      return response({}, Status.NOT_FOUND, "Salle de classe non trouvée");
    } catch (error) {
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération du décompte des genres pour la classe."
      );
    }
  }
);

/**
 * Endpoint pour récupérer le nombre de filles et de garçons par statut pour une classe spécifique.
 * Requête GET: /statistiques/gender-status-count/class/:classId
 * Paramètres: { classId: string }
 */
server.get<any, { classId: string }>(
  "statistiques/gender-status-count/class/:classId",
  async ({ params }) => {
    try {
      return response(
        mapModelsToPlainList(
          services.getGenderAndStatusCountForClass(params.classId)
        )
      );
    } catch (error) {
      return response(
        {},
        Status.INTERNAL_SERVER,
        "Erreur interne du serveur lors de la récupération des genres et statuts pour la classe."
      );
    }
  }
);
