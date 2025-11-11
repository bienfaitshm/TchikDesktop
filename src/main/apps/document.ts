import { DocumentFilter } from "@/commons/types/services";
import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { generateDocxReport, resolveTemplatePath } from "@/main/libs/docx";
import { saveFileWithDialog, WORD_FILE_OPTIONS } from "@/main/libs/save-files";
import { mapModelsToPlainList } from "../db/models/utils";
import { Status } from "@/commons/libs/electron-apis/constant";
import {
  type EnrollmentData,
  getClassesWithStudents,
  sortStudentsByFullName,
} from "../db/services/document";

server.post<any, DocumentFilter>(
  "export/document/cotation-students",
  async ({ data }) => {
    try {
      const responseData: EnrollmentData[] = (await mapModelsToPlainList(
        getClassesWithStudents(data)
      )) as EnrollmentData[];

      const _data = {
        classrooms: sortStudentsByFullName(responseData as any),
      };
      const document = await generateDocxReport(
        resolveTemplatePath("cotations-secondary.docx"),
        _data
      );

      // 4. Sauvegarde du fichier via la boîte de dialogue
      const filenamePath = await saveFileWithDialog(
        document,
        WORD_FILE_OPTIONS
      );

      // 5. Envoi de la réponse à l'application
      if (filenamePath) {
        return response({ filenamePath, responseData });
      }

      // Si l'utilisateur annule le dialogue de sauvegarde
      return response(
        { message: "Opération annulée par l'utilisateur." },
        Status.INTERNAL_SERVER // Ou Status.CLIENT_ERROR selon l'intention
      );
      // return response(responseData);
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

server.post<any, DocumentFilter>("export/documents", async ({ data }) => {
  try {
    const filenamePath = "pass";
    // 5. Envoi de la réponse à l'application
    if (filenamePath) {
      return response({ filenamePath, data });
    }

    // Si l'utilisateur annule le dialogue de sauvegarde
    return response(
      { message: "Opération annulée par l'utilisateur." },
      Status.INTERNAL_SERVER // Ou Status.CLIENT_ERROR selon l'intention
    );
    // return response(responseData);
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
