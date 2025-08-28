import { CotationDocumentExport, EnrollmentDocumentExport } from "@/renderer/components/documents/cotation";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/renderer/components/ui/accordion";
import { TypographySmall } from "@/renderer/components/ui/typography";
import type { WithSchoolAndYearId } from "@/commons/types/services";
import { FileText } from "lucide-react";
import React from "react";

// Types pour une meilleure lisibilité et maintenance
type DocumentExportation = {
    icon?: React.ReactNode;
    code: string;
    title: string;
    subTitle?: string;
    render: React.FC<WithSchoolAndYearId>;
};

// Tableau des exportations de documents avec les titres et sous-titres mis à jour
export const documentExports: DocumentExportation[] = [
    {
        icon: <FileText className="size-4" />,
        title: "Fiches de cotation",
        subTitle: "Exportez les fiches de cotation de vos élèves par classe.",
        code: "FC001",
        render: CotationDocumentExport,
    },

    {
        icon: <FileText className="size-4" />,
        title: "Liste des élèves inscrits",
        subTitle: "Exportez la liste des inscriptions de vos élèves par classe.",
        code: "FC00e",
        render: EnrollmentDocumentExport,
    },
];

// Composant pour afficher la liste d'exportations
export const DocumentExportList: React.FC<WithSchoolAndYearId<{ documents: DocumentExportation[] }>> = ({ documents, schoolId, yearId }) => {
    const defaultOpen = documents.length > 0 ? documents[0].code : undefined;

    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={defaultOpen}
        >
            {documents.map((document) => (
                <AccordionItem key={document.code} value={document.code}>
                    <AccordionTrigger className="hover:decoration-none">
                        <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                                {document?.icon}
                                <TypographySmall className="font-medium text-foreground block">{document.title}</TypographySmall>
                            </div>
                            {document.subTitle && <TypographySmall className="text-xs font-normal text-muted-foreground block">{document.subTitle}</TypographySmall>}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="border-t pt-4">
                        <document.render schoolId={schoolId} yearId={yearId} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};