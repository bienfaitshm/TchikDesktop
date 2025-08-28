import type { WithSchoolAndYearId } from "@/commons/types/services";
import { DocumentEnrollmentForm, type DocumentEnrollmentFormData } from "@/renderer/components/form/documents/classroom-document-export"
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { useCallback } from "react";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useGetClassroomAsOptions } from "@/renderer/hooks/data-as-options";
import { useExportCotationDocument } from "@/renderer/libs/queries/document-export";


export const CotationDocumentExport: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const classrooms = useGetClassroomAsOptions({ schoolId, yearId }, { labelFormat: "short" })
    const mutation = useExportCotationDocument()
    const onSubmit = useCallback((value: DocumentEnrollmentFormData) => {
        mutation.mutate(value, createMutationCallbacksWithNotifications({
            onSuccess(data) {
                console.log(data)
            },
        }))
    }, [])
    return (
        <div>
            <DocumentEnrollmentForm initialValues={{ schoolId, yearId }} classrooms={classrooms} onSubmit={onSubmit}>
                <div className="flex justify-end">
                    <ButtonLoader
                        size="sm"
                        isLoading={mutation.isPending}
                        isLoadingText="Exportation encours..."
                    >
                        Exporter
                    </ButtonLoader>
                </div>
            </DocumentEnrollmentForm>
        </div>
    )
}

export const EnrollmentDocumentExport: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const classrooms = useGetClassroomAsOptions({ schoolId, yearId }, { labelFormat: "short" })
    const mutation = useExportCotationDocument()
    const onSubmit = useCallback((value: DocumentEnrollmentFormData) => {
        mutation.mutate(value, createMutationCallbacksWithNotifications({
            onSuccess(data) {
                console.log(data)
            },
        }))
    }, [])
    return (
        <div>
            <DocumentEnrollmentForm initialValues={{ schoolId, yearId }} classrooms={classrooms} onSubmit={onSubmit}>
                <div className="flex justify-end">
                    <ButtonLoader
                        size="sm"
                        isLoading={mutation.isPending}
                        isLoadingText="Exportation encours..."
                    >
                        Exporter
                    </ButtonLoader>
                </div>
            </DocumentEnrollmentForm>
        </div>
    )
} 