import { Button } from "@/renderer/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/renderer/components/ui/sheet";
import { FileText, Loader } from "lucide-react";
import { withCurrentConfig } from "@/renderer/hooks/with-application-config";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { FormSubmitter } from "@/renderer/components/form/form-submiter";
import { DocumentEnrollmentForm, DocumentEnrollmentFormData } from "@/renderer/components/form/documents/classroom-document-export";
import { useCallback } from "react";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { useGetClassroomAsOptions } from "@/renderer/hooks/data-as-options";
import { useExportCotationDocument, useExportStudentEnrollementSheet } from "@/renderer/libs/queries/document-export";



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

const SheetFormContent: React.FC<WithSchoolAndYearId<{ onSubmit(data: DocumentEnrollmentFormData): void, currentClassroom?: string }>> = ({ schoolId, yearId, currentClassroom, onSubmit }) => {
    const classrooms = useGetClassroomAsOptions({ schoolId, yearId }, { labelFormat: "short" })
    return (
        <FormSubmitter.Wrapper>
            <DocumentEnrollmentForm classrooms={classrooms} initialValues={{ schoolId, yearId, classrooms: currentClassroom ? [currentClassroom] : [] }} onSubmit={onSubmit} />
        </FormSubmitter.Wrapper>
    )
}

export const SheetDataExport: React.FC<WithSchoolAndYearId<{ currentClassroom?: string }>> = (props) => {
    const mutation = useExportCotationDocument()
    const onSubmit = useCallback((value: DocumentEnrollmentFormData) => {
        mutation.mutate(value, {
            onSuccess(data) {
                console.log(value, data)
            },
        })
    }, [])

    return (
        <Sheet modal={false}>
            <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <FileText className="size-4" />
                    <span>Exporter</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col sm:max-w-xl">
                <FormSubmitter>
                    <SheetHeader>
                        <SheetTitle>Options d'exportation</SheetTitle>
                        <SheetDescription>
                            Choisissez le format de fichier que vous souhaitez exporter.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-5 mb-10">
                        <SheetFormContent onSubmit={onSubmit} {...props} />
                    </div>
                    <LoaderIndicator message="Exportation..." />
                    <SheetFooter className="pt-5">
                        <SheetClose asChild>
                            <Button className="text-sm" size="sm" type="button" variant="secondary">
                                Fermer
                            </Button>
                        </SheetClose>
                        <FormSubmitter.Trigger asChild>
                            <ButtonLoader className="text-sm" size="sm">
                                Exporter
                            </ButtonLoader>
                        </FormSubmitter.Trigger>
                    </SheetFooter>
                </FormSubmitter>
            </SheetContent>
        </Sheet>
    );
};


export const ButtonDataExport = withCurrentConfig(SheetDataExport)