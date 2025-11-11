import { useExportDocuments } from "@/renderer/libs/queries/document-export";
import { DocumentEnrollmentFormData } from "../components/form/documents/classroom-document-export";
import { useCallback } from "react";

export const useExport = () => {
  const mutation = useExportDocuments();
  const onSubmit = useCallback((value: DocumentEnrollmentFormData) => {
    mutation.mutate(value, {
      onSuccess(data) {
        console.log(value, data);
      },
    });
  }, []);

  return [mutation.isPending, onSubmit] as const;
};
