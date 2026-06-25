"use client";

import { useCallback } from "react";
import { Label } from "@/renderer/components/ui/label";
import {
  GenericComboBox,
  type ComboBoxOption,
} from "@/renderer/components/form/fields/generic-combo-box";
import { DynamicForm } from "@/renderer/components/form/dynamic-form";

import type { FormFieldDef } from "@/packages/dynamic-form";
import type { DocumentMetadata } from "@/packages/electron-data-exporter";
import type { DocumentExportFormData } from "@/renderer/libs/queries/document-export/action";

export interface ExportFormContentProps {
  formId: string;
  docOptions: ComboBoxOption<DocumentMetadata<unknown>>[];
  selectedDocKey: string;
  dynamicFields: FormFieldDef[];
  isPending: boolean;
  onDocumentChange: (key: string) => void;
  onSubmit: (data: DocumentExportFormData) => void;
}

const MAX_CHART = 130;
export function ExportFormContent({
  formId,
  docOptions,
  selectedDocKey,
  dynamicFields,
  isPending,
  onDocumentChange,
  onSubmit,
}: ExportFormContentProps) {
  const selectedDoc = docOptions.find((opt) => opt.value === selectedDocKey);

  const handleFormSubmit = useCallback(
    (formData: Record<string, unknown>) => {
      if (!selectedDocKey) return;
      onSubmit({ documentType: selectedDocKey, data: formData });
    },
    [selectedDocKey, onSubmit],
  );

  return (
    <div className="space-y-4">
      {/* 1. Sélection du type de document */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="doc-type-selector" className="text-base font-bold">
            Type de document
          </Label>
          <p className="text-sm text-muted-foreground">
            Sélectionnez le modèle de document pour afficher les options
            d'exportation.
          </p>
        </div>

        <GenericComboBox
          id="doc-type-selector"
          options={docOptions}
          value={selectedDocKey}
          onChangeValue={onDocumentChange}
          className="h-12"
          renderTrigger={(selected) => (
            <div className="flex flex-col items-start gap-0.5 overflow-hidden text-left w-full min-w-0">
              <span className="font-medium text-sm text-wrap">
                {selected ? selected.data?.title : "Choisir un modèle..."}
              </span>
              {selected?.data?.description && (
                <span className="text-xs text-muted-foreground text-wrap">
                  {selected.data.description.length >= MAX_CHART
                    ? `${selected.data.description.substring(0, MAX_CHART)}...`
                    : selected.data.description}
                </span>
              )}
            </div>
          )}
          renderItem={(item) => (
            <div className="flex flex-col py-1 w-full min-w-0">
              <p className="font-semibold text-sm truncate">
                {item.data?.title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 text-wrap">
                {item.data?.description}
              </p>
            </div>
          )}
        />
      </section>

      {/* 2. Formulaire Dynamique (Filtres/Paramètres) */}
      <section
        className="relative min-h-25 transition-all duration-300"
        aria-busy={isPending}
      >
        {!selectedDocKey ? (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground italic">
              Veuillez sélectionner un type de document pour configurer
              l'exportation.
            </p>
          </div>
        ) : (
          <div
            className={
              isPending
                ? "opacity-50 pointer-events-none grayscale-[0.5]"
                : "opacity-100"
            }
          >
            <div className="mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary truncate">
                Configuration de l'export : {selectedDoc?.data?.title}
              </h3>
            </div>

            <DynamicForm
              formId={formId}
              fields={dynamicFields}
              onSubmit={handleFormSubmit}
            />
          </div>
        )}
      </section>
    </div>
  );
}
