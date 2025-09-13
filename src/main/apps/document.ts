import {
  DocumentFilter,
  TEnrolement,
  TWithClassroom,
  TWithUser,
  WithSchoolAndYearId,
} from "@/commons/types/services";
import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import * as enrolementServices from "@/main/db/services/enrolements";
import { generateDocxReport, resolveTemplatePath } from "@/main/libs/docx";
import { saveFileWithDialog, WORD_FILE_OPTIONS } from "@/main/libs/save-files";
import { mapModelsToPlainList } from "../db/models/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import {
  type EnrollmentData,
  getEnrollmentSchoolData,
} from "../db/services/document";

// Le nom de la route est plus descriptif pour une exportation spécifique.
const EXPORT_DOCUMENT_ROUTE = "export/document/enrollment-students";
const TEMPLATE_FILENAME = "enrollment-students.docx";
const DEFAULT_CLASSROOM_NAME = "bienfait shomari"; // A revoir, cette valeur semble être une valeur par défaut de test.

server.post<any, WithSchoolAndYearId>(
  EXPORT_DOCUMENT_ROUTE,
  async ({ data }) => {
    try {
      // 1. Récupération des données des élèves
      const enrolements = await enrolementServices.getEnrolements({
        schoolId: data.schoolId,
        yearId: data.yearId,
      });

      // 2. Traitement des données
      const studentsWithDetails = (await mapModelsToPlainList(
        enrolements
      )) as TWithClassroom<TWithUser<TEnrolement>>[];
      const students = studentsWithDetails.map((enrollment) => enrollment.User);

      // Assurer que le nom de la classe est dynamique et non statique
      // Cette ligne est un exemple pour illustrer comment récupérer le nom
      // à partir des données si elles sont disponibles.
      const classroomName = DEFAULT_CLASSROOM_NAME;

      // 3. Génération du document Word
      const document = await generateDocxReport(
        resolveTemplatePath(TEMPLATE_FILENAME),
        { students, classroomName }
      );

      // 4. Sauvegarde du fichier via la boîte de dialogue
      const filenamePath = await saveFileWithDialog(
        document,
        WORD_FILE_OPTIONS
      );

      // 5. Envoi de la réponse à l'application
      if (filenamePath) {
        return response({ filenamePath });
      }

      // Si l'utilisateur annule le dialogue de sauvegarde
      return response(
        { message: "Opération annulée par l'utilisateur." },
        Status.INTERNAL_SERVER // Ou Status.CLIENT_ERROR selon l'intention
      );
    } catch (error) {
      // Gestion centralisée des erreurs
      console.error("Erreur lors de l'exportation du document:", error);
      return response(
        { error: String(error) },
        Status.INTERNAL_SERVER,
        "Il y a eu une erreur lors de l'exportation du document."
      );
    }
  }
);

server.post<any, DocumentFilter>(
  "export/document/cotation-students",
  async ({ data }) => {
    const responseData: EnrollmentData[] = (await mapModelsToPlainList(
      getEnrollmentSchoolData(data)
    )) as EnrollmentData[];
    return response(responseData);
  }
);
