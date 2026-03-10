import { useExportDocuments } from "@/renderer/libs/queries/document-export";
import { DocumentFormData } from "../components/form/documents/classroom-document-export";
import { useCallback } from "react";

export const useExport = () => {
  const mutation = useExportDocuments();
  const onSubmit = useCallback((value: DocumentFormData) => {
    mutation.mutate(value, {
      onSuccess(data) {
        console.log(value, data);
      },
      onError(error) {
        console.log("Error", error);
      },
    });
  }, []);

  return [mutation.isPending, onSubmit] as const;
};
