import type { DocumentFilter } from "@/commons/types/services";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as apis from "@/renderer/libs/apis/document-export";

export function useExportDocuments() {
  return useMutation({
    mutationKey: ["DOCUMENTS/EXPORT"],
    mutationFn: (data: DocumentFilter) => apis.exportDocuments(data),
  });
}

export function useGetDocumentInfos(params?: {}) {
  return useQuery({
    queryKey: ["DOCUMENTS/INFOS"],
    queryFn: () => apis.getDocumentInfos(params),
  });
}
