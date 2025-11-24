import type { DocumentFilter } from "@/commons/types/services";
import { DOCUMENT_EXPORT_ROUTES } from "@/commons/constants/routes";
import { clientApis } from "./client";
import { DocumentInfo } from "@/commons/types/services.decuments";

export const exportDocuments = (data: DocumentFilter) => {
  return clientApis
    .post<{
      filenamePath: string;
    }>(DOCUMENT_EXPORT_ROUTES.EXPORT_DOCUMENT, data)
    .then((res) => res.data);
};

export const getDocumentInfos = () => {
  return clientApis
    .get<DocumentInfo[]>(DOCUMENT_EXPORT_ROUTES.GET_INFOS)
    .then((res) => res.data);
};
