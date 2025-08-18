import { useMutation } from "@tanstack/react-query";
import * as apis from "@/renderer/libs/apis/document-export";

export function useExportStudentEnrollementDocument() {
  return useMutation({
    mutationKey: ["EXPORT/DOCUMENT/ENROLLMENT"],
    mutationFn: (data: any) => apis.exportStudentsEnrollementDocument(data),
  });
}

// sheet

export function useExportTestSheet() {
  return useMutation({
    mutationKey: ["EXPORT/SHEET/TEST"],
    mutationFn: (data: any) => apis.exportTestSheet(data),
  });
}

export function useExportSheetDataToJson() {
  return useMutation({
    mutationKey: ["EXPORT/SHEET/DATA-JSON"],
    mutationFn: (data: any) => apis.exportDataToJSONSheet(data),
  });
}
