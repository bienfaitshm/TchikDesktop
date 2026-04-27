import { useExportDocuments } from "@/renderer/libs/queries/document-export";
import { useCallback } from "react";

export type DocumentFormData<TData = any> = {
  documentType: string;
  data: TData;
};
export const useExport = <TData = any>() => {
  const mutation = useExportDocuments();
  const onSubmit = useCallback((value: DocumentFormData<TData>) => {
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
