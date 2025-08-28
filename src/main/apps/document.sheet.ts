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
import { jsonToExcelBuffer, resolveTemplatePath } from "@/main/libs/excel";
import { saveFileWithDialog, EXCEL_FILE_OPTIONS } from "@/main/libs/save-files";
import { mapModelsToPlainList } from "../db/models/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import { remplirTemplateExcel } from "../libs/excel/template";
import {
  EnrollmentData,
  getEnrollmentSchoolData,
} from "../db/services/document";
import {
  enrollmentToExcelData,
  mapClassroomsToEnrollments,
} from "@/main/db/services/document.parser";

server.post<any, WithSchoolAndYearId>("export/sheet/test", async ({ data }) => {
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

    // 3. Génération du document Word
    const document = await jsonToExcelBuffer({ data: students });

    // 4. Sauvegarde du fichier via la boîte de dialogue
    const filenamePath = await saveFileWithDialog(document, EXCEL_FILE_OPTIONS);

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
});

server.post<any, DocumentFilter>(
  "export/sheet/enrollment-students",
  async ({ data }) => {
    try {
      // 1. Récupération des données des élèves
      const classrooms: EnrollmentData[] = (await mapModelsToPlainList(
        getEnrollmentSchoolData(data)
      )) as EnrollmentData[];

      // 2. Traitement des données
      const dataSheet = enrollmentToExcelData(
        mapClassroomsToEnrollments(classrooms)
      );

      // 3. Génération du document Word
      const document = await jsonToExcelBuffer({ data: dataSheet });

      // 4. Sauvegarde du fichier via la boîte de dialogue
      const filenamePath = await saveFileWithDialog(document, {
        ...EXCEL_FILE_OPTIONS,
        defaultPath: "Inscriptions_Eleves.xlsx",
      });

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

server.post<any, WithSchoolAndYearId>(
  "export/sheet/data-json",
  async ({ data }) => {
    try {
      // // 1. Récupération des données des élèves
      // const enrolements = await enrolementServices.getEnrolements({
      //   schoolId: data.schoolId,
      //   yearId: data.yearId,
      // });

      // // 2. Traitement des données
      // const studentsWithDetails = (await mapModelsToPlainList(
      //   enrolements
      // )) as TWithClassroom<TWithUser<TEnrolement>>[];
      // const students = studentsWithDetails.map((enrollment) => enrollment.User);

      // 3. Génération du document Word
      const document: any = await remplirTemplateExcel(
        resolveTemplatePath("hello.xlsx")
      );

      // 4. Sauvegarde du fichier via la boîte de dialogue
      const filenamePath = await saveFileWithDialog(
        document,
        EXCEL_FILE_OPTIONS
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
