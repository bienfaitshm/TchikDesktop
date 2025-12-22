import { useMutation, useQuery } from "@tanstack/react-query";
import type { DocumentFilter } from "@/commons/types/services";
import { exportDocuments } from "@/renderer/libs/apis";

export function useExportDocuments() {
  return useMutation({
    mutationKey: ["DOCUMENTS/EXPORT"],
    mutationFn: (data: DocumentFilter) => exportDocuments.executeExport(data),
  });
}

export function useGetAvailableExports() {
  return useQuery({
    queryKey: ["DOCUMENTS/INFOS"],
    queryFn: () => exportDocuments.getAvailableExports(),
  });
}
