import { TResponse } from "@/commons/libs/electron-apis/utils";
import { clientApis } from "./client";

interface ExportData {
  [key: string]: any;
}

/**
 * Exporte les fiches d'élèves au format document (.docx).
 * Le nom est plus précis que le précédent, et la réponse attendue est mieux typée.
 */
export const exportStudentsEnrollementDocument = (data: ExportData) => {
  return clientApis
    .post<
      TResponse<{ filenamePath: string }>
    >("export/document/enrollment-students", data)
    .then((res) => res.data);
};

export const exportCotationDocument = (data: ExportData) => {
  return clientApis
    .post<TResponse<unknown>>("export/document/cotation-students", data)
    .then((res) => res.data);
};

/**
 * Exporte des données de test au format feuille de calcul (.xlsx).
 * Le nom `exportSheetTest` est correct si la fonction a pour but de faire un test,
 * mais s'il s'agit d'une fonction de production, son nom devrait être plus explicite.
 * Voici une suggestion si le but est de faire un test :
 */
export const exportTestSheet = (data: ExportData) => {
  return clientApis
    .post<TResponse<unknown>>("export/sheet/test", data)
    .then((res) => res.data);
};

/**
 * Exporte des données brutes en format JSON vers une feuille de calcul.
 * Le nom est plus explicite et reflète l'action et le format.
 */
export const exportDataToJSONSheet = (data: ExportData) => {
  return clientApis
    .post<TResponse<unknown>>("export/sheet/data-json", data)
    .then((res) => res.data);
};
