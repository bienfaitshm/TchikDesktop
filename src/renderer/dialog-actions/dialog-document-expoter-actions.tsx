"use client";

import React, { useState, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/renderer/components/ui/dialog";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { useDocumentExportManager } from "@/renderer/libs/queries/document-export";
import { ExportFormContent } from "@/renderer/components/form/document-export-form";

type WithSchoolAndYearId<T> = T & { schoolId: string; yearId?: string };

interface DialogDataExportProps {
  defaultValues?: Record<string, unknown>;
  buttonTrigger?: ReactNode;
}

/**
 * Indicateur visuel d'activité pour l'exportation.
 */
const ExportLoadingOverlay: React.FC<{ message?: string }> = ({
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

export const DialogDataExport: React.FC<
  WithSchoolAndYearId<DialogDataExportProps>
> = ({ schoolId, yearId, defaultValues, buttonTrigger }) => {
  const [isOpen, setIsOpen] = useState(false);

  const formManager = useDocumentExportManager(
    {
      schoolId,
      yearId,
      ...defaultValues,
    },
    {
      onSuccess: () => {
        setTimeout(() => setIsOpen(false), 1500);
      },
    },
  );

  const { isExporting, formId, handleDocumentChange } = formManager;

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (isExporting) return;
      setIsOpen(open);
      if (!open) {
        handleDocumentChange("");
      }
    },
    [handleDocumentChange, isExporting],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <DialogTrigger asChild>{buttonTrigger}</DialogTrigger>

      <DialogContent className="sm:max-w-[700px] lg:max-w-[900px] gap-0 p-0 overflow-hidden">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl">
              Exportation de documents
            </DialogTitle>
            <DialogDescription>
              Sélectionnez un modèle et configurez les paramètres d'exportation.
            </DialogDescription>
          </DialogHeader>

          {/* Contenu principal du formulaire */}
          <ExportFormContent
            formId={formManager.formId}
            isPending={isExporting}
            docOptions={formManager.docOptions}
            selectedDocKey={formManager.selectedDocKey}
            dynamicFields={formManager.dynamicFields}
            onDocumentChange={formManager.handleDocumentChange}
            onSubmit={({ data }) =>
              formManager.onSubmit(data, { schoolId, yearId })
            }
          />

          {/* Feedback visuel lors de l'exportation */}
          {isExporting && (
            <div className="mt-6">
              <ExportLoadingOverlay />
            </div>
          )}
        </div>

        <DialogFooter className="bg-muted/50 p-4 gap-2 border-t">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isExporting}>
              Annuler
            </Button>
          </DialogClose>

          <ButtonLoader
            form={formId}
            type="submit"
            isLoading={isExporting}
            disabled={isExporting || !formManager.selectedDocKey}
            className="min-w-[140px]"
          >
            Générer le fichier
          </ButtonLoader>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ButtonDialogDocumentExport = DialogDataExport;
