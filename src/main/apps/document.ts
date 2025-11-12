import { DocumentFilter } from "@/commons/types/services";
import { server } from "@/commons/libs/electron-apis/server";
import { response } from "@/commons/libs/electron-apis/utils";
import { saveFileWithDialog } from "@/main/libs/save-files";
import { Status } from "@/commons/libs/electron-apis/constant";

import { processDocument } from "@/main/db/services/document.files";

// server.post<any, DocumentFilter>(
//   "export/document/cotation-students",
//   async ({ data }) => {
//     try {
//       const responseData: EnrollmentData[] = (await mapModelsToPlainList(
//         getClassesWithStudents(data)
//       )) as EnrollmentData[];

//       const _data = {
//         classrooms: sortStudentsByFullName(responseData as any),
//       };
//       const document = await generateDocxReport(
//         resolveTemplatePath("cotations-secondary.docx"),
//         _data
//       );

//       // 4. Sauvegarde du fichier via la boîte de dialogue
//       const filenamePath = await saveFileWithDialog(
//         document,
//         WORD_FILE_OPTIONS
//       );

//       // 5. Envoi de la réponse à l'application
//       if (filenamePath) {
//         return response({ filenamePath, responseData });
//       }

//       // Si l'utilisateur annule le dialogue de sauvegarde
//       return response(
//         { message: "Opération annulée par l'utilisateur." },
//         Status.INTERNAL_SERVER // Ou Status.CLIENT_ERROR selon l'intention
//       );
//       // return response(responseData);
//     } catch (error) {
//       // Gestion centralisée des erreurs
//       console.error("Erreur lors de l'exportation du document:", error);
//       return response(
//         { error: String(error) },
//         Status.INTERNAL_SERVER,
//         "Il y a eu une erreur lors de l'exportation du document."
//       );
//     }
//   }
// );

server.post<any, DocumentFilter>("export/documents", async ({ data }) => {
  try {
    const result = await processDocument(data);
    if (result.success) {
      // 4. Sauvegarde du fichier via la boîte de dialogue
      const filenamePath = await saveFileWithDialog(
        result.result.data,
        result.result.options
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
    }
    return response(
      { error: "Document processing failed" },
      Status.INTERNAL_SERVER
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
