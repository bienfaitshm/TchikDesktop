"use client";

import React, { useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useDocumentExportManager } from "@/renderer/libs/queries/document-export";
import { LoadingButton } from "@/renderer/components/buttons/button-loading";
import { ExporterForm } from "../forms/exporter-form";
import { ExportInfos } from "./exporter-animation";

export type WithSchoolAndYearId<T> = T & { schoolId: string; yearId?: string };

export interface ExporterFormContentProps {
  defaultValues?: Record<string, unknown>;
}

export interface ExportLoadingOverlayProps {
  message?: string;
}

/**
 * Visual loading overlay indicating document generation progress.
 * @param message - Optional display message shown during loading state.
 * @returns Rendered loader overlay element.
 */
const ExportLoadingOverlay: React.FC<ExportLoadingOverlayProps> = ({
  message = "Préparation du document...",
}) => (
  <div className="flex items-center justify-center gap-3 p-4 rounded-xl border bg-muted/30 animate-in fade-in zoom-in duration-200">
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
    <div className="flex flex-col">
      <p className="text-sm font-medium">{message}</p>
      <p className="text-xs text-muted-foreground">
        Cela peut prendre quelques instants.
      </p>
    </div>
  </div>
);

/**
 * Action dialog component managing document export operations and dynamic form layouts.
 * @param props - Dialog properties including school/year context, default values, and trigger button.
 * @returns Rendered modal export dialog component.
 */
export const ExporterFormContent: React.FC<
  WithSchoolAndYearId<ExporterFormContentProps>
> = ({ schoolId, yearId, defaultValues }) => {
  const formManager = useDocumentExportManager({
    schoolId,
    yearId,
    ...defaultValues,
  });

  const { isExporting, formId, onSubmit: submitExport } = formManager;

  const handleFormSubmit = useCallback(
    ({ data }: { data: Record<string, unknown> }) => {
      submitExport(data, { schoolId, yearId });
    },
    [submitExport, schoolId, yearId],
  );

  return (
    <div className="grid  grid-cols-3 gap-10">
      {/* PANNEAU DE GAUCHE : FORMULAIRE DE FILTRE */}
      <div className="col-span-2 max-w-xl">
        <ExporterForm
          formId={formManager.formId}
          isPending={isExporting}
          docOptions={formManager.docOptions}
          selectedDocKey={formManager.selectedDocKey}
          dynamicFields={formManager.dynamicFields}
          onDocumentChange={formManager.handleDocumentChange}
          onSubmit={handleFormSubmit}
        />
        {isExporting && (
          <div className="mt-6">
            <ExportLoadingOverlay />
          </div>
        )}

        <div className="py-10 gap-5 sm:gap-4">
          <LoadingButton
            form={formId}
            type="submit"
            loading={isExporting}
            disabled={isExporting || !formManager.selectedDocKey}
            className="w-full"
          >
            Générer le fichier
          </LoadingButton>
        </div>
      </div>

      <div className="">
        <ExportInfos
          docOptions={formManager.docOptions}
          selected={formManager.selectedDocKey}
        />
      </div>
    </div>
  );
};

export const ButtonDialogDocumentExport = ExporterFormContent;
