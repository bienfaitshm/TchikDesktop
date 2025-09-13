import type { DocumentFilter } from "@/commons/types/services";
import { useMutation } from "@tanstack/react-query";
import * as apis from "@/renderer/libs/apis/document-export";

export function useExportStudentEnrollementDocument() {
  return useMutation({
    mutationKey: ["EXPORT/DOCUMENT/ENROLLMENT"],
    mutationFn: (data: DocumentFilter) =>
      apis.exportStudentsEnrollementDocument(data),
  });
}

export function useExportCotationDocument() {
  return useMutation({
    mutationKey: ["EXPORT/DOCUMENT/COTATION"],
    mutationFn: (data: DocumentFilter) => apis.exportCotationDocument(data),
  });
}

// sheet

export function useExportStudentEnrollementSheet() {
  return useMutation({
    mutationKey: ["EXPORT/SHEET/ENROLLMENT"],
    mutationFn: (data: DocumentFilter) =>
      apis.exportStudentsEnrollementSheet(data),
  });
}

//TODO: to delete
export function useExportTestSheet() {
  return useMutation({
    mutationKey: ["EXPORT/SHEET/TEST"],
    mutationFn: (data: DocumentFilter) => apis.exportTestSheet(data),
  });
}

export function useExportSheetDataToJson() {
  return useMutation({
    mutationKey: ["EXPORT/SHEET/DATA-JSON"],
    mutationFn: (data: DocumentFilter) => apis.exportDataToJSONSheet(data),
  });
}
