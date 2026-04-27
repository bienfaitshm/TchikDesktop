import React, { useId, useMemo, useCallback, useState } from "react";
import { FileText, Loader } from "lucide-react";

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
import { Label } from "@/renderer/components/ui/label";

import { withSchoolConfig } from "@/renderer/hooks/with-application-config";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { DocumentFormData, useExport } from "@/renderer/hooks/documents";
import { FormFieldDef } from "@/packages/dynamic-form";
import { useGetAvailableExports } from "@/renderer/libs/queries/document-export";
import { ComboBoxOption, GenericComboBox } from "@/renderer/components/form/fields/generic-combo-box";
import type { DocumentMetadata } from "@/packages/electron-data-exporter";
import { DynamicForm } from "@/renderer/components/form/dynamic-form";

type WithSchoolAndYearId<T> = T & { schoolId: string; yearId?: string };

/**
 * Configuration du formulaire dynamique
 */
const exportFieldsSchema: FormFieldDef[] = [
    { id: "firstName", type: "text", label: "Prénom", placeholder: "ex: Jean", required: true, colSpan: 6 },
    { id: "lastName", type: "text", label: "Nom", placeholder: "ex: Dupont", required: true, colSpan: 6 },
    { id: "userEmail", type: "email", label: "Adresse Email", required: true, colSpan: 12 },
    {
        id: "department",
        type: "select",
        label: "Département",
        required: true,
        colSpan: 8,
        defaultValue: "eng",
        options: [
            { label: "Engineering", value: "eng" },
            { label: "Design", value: "dsgn" },
            { label: "Product", value: "prod" },
        ]
    },
    {
        "id": "tech_stack",
        "type": "select",
        "multiple": true,
        "label": "Technologies maîtrisées",
        "defaultValue": ["react", "typescript"],
        "options": [
            { "label": "React", "value": "react" },
            { "label": "TypeScript", "value": "typescript" },
            { "label": "Node.js", "value": "node" }
        ],
        "colSpan": 12
    }
];

interface LoaderIndicatorProps {
    message?: string;
}

export const LoaderIndicator: React.FC<LoaderIndicatorProps> = ({ message = "Exportation en cours..." }) => {
    return (
        <div className="flex flex-col items-center p-2 space-y-1 rounded-lg border bg-background text-center">
            <Loader className="h-4 w-4 animate-spin" />
            <div>
                <h3 className="text-sm font-semibold">
                    {message}
                </h3>
                <p className="text-xs text-muted-foreground ">
                    Veuillez patienter pendant le traitement de votre demande.
                </p>
            </div>
        </div>
    );
};



interface FormContentProps {
    formId: string;
    onSubmit: (data: DocumentFormData<any>) => void;
    isPending: boolean;
}

const ExportFormContent: React.FC<FormContentProps> = ({ formId, onSubmit }) => {
    const { data: availableDocs } = useGetAvailableExports();
    const [selectedDocKey, setSelectedDocKey] = useState<string>("");

    const docOptions: ComboBoxOption<DocumentMetadata<any>>[] = useMemo(() => {
        return availableDocs?.map(data => ({ value: data.key, label: data.title, data })) ?? []
    }, [availableDocs]);

    const handleFinalSubmit = (formData: any) => {
        if (!selectedDocKey) return;
        onSubmit({ documentType: selectedDocKey, data: formData });
    };

    return (
        <div className="space-y-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="doc-type-selector">
                    Type de document à exporter
                </Label>

                <GenericComboBox
                    options={docOptions}
                    value={selectedDocKey}
                    onChangeValue={setSelectedDocKey}
                    contentClassName="w-[850px]"
                    renderTrigger={(selected) => (
                        <div className="flex flex-col items-start space-y-1">
                            <span className="font-semibold text-sm">
                                {selected ? selected.data.title : "Choisir un document"}
                            </span>
                            {selected && (
                                <span className="text-xs text-muted-foreground">{selected.data.description}</span>
                            )}
                        </div>
                    )}
                    renderItem={(item) => (
                        <div className="flex flex-col">
                            <p className="font-medium text-sm">{item.data.title}</p>
                            <p className="text-xs text-muted-foreground">{item.data.description}</p>
                        </div>
                    )}
                />
                <p id="doc-type-helper" className="text-[0.8rem] text-muted-foreground">
                    Le type de document détermine les champs disponibles dans le formulaire ci-dessous.
                </p>
            </div>

            <div className={!selectedDocKey ? "opacity-40 pointer-events-none" : ""}>
                <DynamicForm
                    formId={formId}
                    fields={exportFieldsSchema}
                    onSubmit={handleFinalSubmit}
                />
            </div>
        </div>
    );
};

export const DialogDataExport: React.FC<WithSchoolAndYearId<{ currentClassroom?: string }>> = () => {
    const formId = useId();
    const [isPending, onSubmit] = useExport();
    const [isOpen, setIsOpen] = useState(false);

    const handleFormSubmit = useCallback(async (data: any) => {
        await onSubmit(data);
    }, [onSubmit]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen} modal={false}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <FileText className="size-4" />
                    <span>Exporter les données</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                    <DialogTitle>Configuration de l'exportation</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations ci-dessous pour générer votre document.
                    </DialogDescription>
                </DialogHeader>

                <ExportFormContent
                    formId={formId}
                    onSubmit={handleFormSubmit}
                    isPending={isPending}
                />

                {isPending && <LoaderIndicator />}

                <DialogFooter className="gap-2 sm:gap-0">
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={isPending}>
                            Annuler
                        </Button>
                    </DialogClose>
                    <ButtonLoader
                        form={formId}
                        type="submit"
                        disabled={isPending}
                        className="min-w-[120px]"
                    >
                        Générer le fichier
                    </ButtonLoader>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const ButtonDialogDocumentExport = withSchoolConfig(DialogDataExport);