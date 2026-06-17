"use client";

import { useCallback, useMemo, useState } from "react";
import { withNotifications } from "@/renderer/libs/notifications";
import {
  useAvailableExports,
  useExportDocuments as useExportMutation,
  type ExportParams,
} from "@/renderer/libs/queries/document-export";
import type { DocumentMetadata } from "@/packages/electron-data-exporter";
import type { FormFieldDef } from "@/packages/dynamic-form";
import { type BaseMutationConfig, useFormBase } from "../base";

/**
 * 1. Type Definitions
 */
export interface SchoolYearContext {
  schoolId?: string;
  yearId?: string;
}

export interface DocumentExportFormData<TData = Record<string, unknown>> {
  documentType: string;
  data: TData;
}

export interface ComboBoxOption<T = unknown> {
  value: string;
  label: string;
  data?: T;
}

export type UseExportParams = SchoolYearContext & ExportParams;

export interface UseExportConfig extends BaseMutationConfig<string> {
  invalidateKeys?: unknown[][];
}

/**
 * 2. Hook : useDocumentExportAction
 * Gère uniquement la cinématique d'envoi de la mutation avec toast de notification.
 */
export function useDocumentExportAction(config?: UseExportConfig) {
  const { formId, notifyAndInvalidate } = useFormBase(config);
  const mutation = useExportMutation();

  const handleExport = useCallback(
    (payload: DocumentExportFormData, params?: ExportParams) => {
      mutation.mutate(
        { data: payload, params },
        withNotifications({
          notifications: {
            success: {
              title: "Exportation réussie",
              description: `Le document "${payload.documentType}" a été généré avec succès.`,
            },
            error: {
              title: "Erreur d'exportation",
            },
          },
          onSuccess: (response) => {
            notifyAndInvalidate(response);
          },
        }),
      );
    },
    [mutation, config, notifyAndInvalidate],
  );

  return {
    formId,
    isExporting: mutation.isPending,
    handleExport,
  };
}

export function useDocumentExportForm(params?: UseExportParams) {
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);
  const { data: availableDocs = [] } = useAvailableExports(memoizedParams);
  const [selectedDocKey, setSelectedDocKey] = useState<string>("");

  const docOptions: ComboBoxOption<DocumentMetadata<unknown>>[] =
    useMemo(() => {
      return availableDocs.map((doc) => ({
        value: doc.id,
        label: doc.title,
        data: doc,
      }));
    }, [availableDocs]);

  const selectedDoc = useMemo(() => {
    return availableDocs.find((doc) => doc.id === selectedDocKey);
  }, [availableDocs, selectedDocKey]);

  const dynamicFields: FormFieldDef[] = (selectedDoc?.fields ??
    []) as FormFieldDef[];

  return {
    docOptions,
    dynamicFields,
    selectedDocKey,
    handleDocumentChange: setSelectedDocKey,
    hasSelectedDoc: !!selectedDocKey,
  };
}

export function useDocumentExportManager(
  params?: UseExportParams,
  config?: UseExportConfig,
) {
  const {
    docOptions,
    dynamicFields,
    selectedDocKey,
    handleDocumentChange,
    hasSelectedDoc,
  } = useDocumentExportForm(params);

  const { handleExport, isExporting, formId } = useDocumentExportAction(config);

  const onSubmit = useCallback(
    (formData: Record<string, unknown>, extraParams?: ExportParams) => {
      if (!selectedDocKey) return;

      handleExport(
        {
          documentType: selectedDocKey,
          data: formData,
        },
        extraParams,
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
    hasSelectedDoc,
  };
}
