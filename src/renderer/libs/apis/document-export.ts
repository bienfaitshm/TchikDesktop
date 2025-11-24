import type { DocumentFilter } from "@/commons/types/services";
import { DOCUMENT_EXPORT_ROUTES } from "@/commons/constants/routes";
import { clientApis } from "./client";
import {
  DocumentInfo,
  GroupedDocumentOption,
} from "@/commons/types/services.documents";

export const exportDocuments = (data: DocumentFilter) => {
  return clientApis
    .post<{
      filenamePath: string;
    }>(DOCUMENT_EXPORT_ROUTES.EXPORT_DOCUMENT, data)
    .then((res) => res.data);
};

export const getDocumentInfos = (params = {}) => {
  return clientApis
    .get<
      GroupedDocumentOption[] | DocumentInfo[]
    >(DOCUMENT_EXPORT_ROUTES.GET_INFOS, { params })
    .then((res) => res.data);
};
