import type { DocumentFilter } from "@/commons/types/services";
import { useMutation } from "@tanstack/react-query";
import * as apis from "@/renderer/libs/apis/document-export";

export function useExportDocuments() {
  return useMutation({
    mutationKey: ["EXPORT/DOCUMENTS"],
    mutationFn: (data: DocumentFilter) => apis.exportDocuments(data),
  });
}
