import { useMutation, useQuery } from "@tanstack/react-query";
import { exportDocuments } from "@/renderer/libs/apis";

export function useExportDocuments() {
  return useMutation({
    mutationKey: ["DOCUMENTS/EXPORT"],
    mutationFn: (data: any) => exportDocuments.executeExport(data),
  });
}

export function useGetAvailableExports() {
  return useQuery({
    queryKey: ["DOCUMENTS/INFOS"],
    queryFn: () => exportDocuments.getAvailableExports(),
  });
}
