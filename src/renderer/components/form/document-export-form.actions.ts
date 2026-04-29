"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import {
  useAvailableExports,
  useExportDocuments as useExportMutation,
} from "@/renderer/libs/queries/document-export";
import { DocumentMetadata } from "@/packages/electron-data-exporter";
import type { ComboBoxOption } from "@/renderer/components/form/fields/generic-combo-box";
import type { FormFieldDef } from "@/packages/dynamic-form";

/**
 * Structure des données soumises par le formulaire d'exportation.
 */
export interface DocumentExportFormData<TData = Record<string, unknown>> {
  documentType: string;
  data: TData;
}

interface UseExportConfig {
  onSuccess?: (data?: any) => void;
  invalidateKeys?: unknown[][];
}

/**
 * Hook de gestion de l'action d'exportation avec notifications intégrées.
 */
export function useDocumentExportAction(config?: UseExportConfig) {
  const formId = useId();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useExportMutation();

  const handleExport = useCallback(
    (payload: DocumentExportFormData, params?: Record<string, unknown>) => {
      mutate(
        { data: payload, params },
        createMutationCallbacksWithNotifications({
          successMessageTitle: "Exportation réussie",
          successMessageDescription: `Le document "${payload.documentType}" a été généré avec succès.`,
          errorMessageTitle: "Erreur d'exportation",
          onSuccess: (response) => {
            config?.invalidateKeys?.forEach((key) => {
              queryClient.invalidateQueries({ queryKey: key });
            });

            config?.onSuccess?.(response);
          },
        }),
      );
    },
    [mutate, queryClient, config],
  );

  return {
    formId,
    isExporting: isPending,
    handleExport,
  };
}

/**
 * Hook de gestion d'état pour le formulaire de sélection de document.
 * Gère la liste des documents disponibles et les champs dynamiques associés.
 */
export function useDocumentExportForm() {
  const { data: availableDocs } = useAvailableExports();
  const [selectedDocKey, setSelectedDocKey] = useState<string>("");

  const docOptions: ComboBoxOption<DocumentMetadata<unknown>>[] =
    useMemo(() => {
      return (
        availableDocs?.map((doc) => ({
          value: doc.key,
          label: doc.title,
          data: doc,
        })) ?? []
      );
    }, [availableDocs]);

  const selectedDoc = useMemo(() => {
    return availableDocs?.find((doc) => doc.key === selectedDocKey);
  }, [availableDocs, selectedDocKey]);

  const dynamicFields: FormFieldDef[] = selectedDoc?.fields ?? [];

  const handleDocumentChange = useCallback(setSelectedDocKey, []);

  return {
    docOptions,
    dynamicFields,
    selectedDocKey,
    handleDocumentChange,
    hasSelectedDoc: !!selectedDocKey,
  };
}

/**
 * Hook complet pour le manager d'export (UI + Action).
 */
export function useDocumentExportManager(config?: UseExportConfig) {
  const { docOptions, dynamicFields, selectedDocKey, handleDocumentChange } =
    useDocumentExportForm();

  const { handleExport, isExporting, formId } = useDocumentExportAction(config);

  const onSubmit = useCallback(
    (formData: Record<string, unknown>, params?: Record<string, unknown>) => {
      if (!selectedDocKey) return;

      handleExport(
        {
          documentType: selectedDocKey,
          data: formData,
        },
        params,
      );
    },
    [selectedDocKey, handleExport],
  );

  return {
    formId,
    onSubmit,
    isExporting,
    docOptions,
    dynamicFields,
    selectedDocKey,
    handleDocumentChange,
    hasSelectedDoc: !!selectedDocKey,
  };
}
