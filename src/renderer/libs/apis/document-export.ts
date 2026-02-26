import type { DocumentFilter } from "@/commons/types/services";
import { clientApis } from "./client";

export const exportDocuments = (data: DocumentFilter) => {
  return clientApis
    .post<{ filenamePath: string }>("export/documents", data)
    .then((res) => res.data);
};
