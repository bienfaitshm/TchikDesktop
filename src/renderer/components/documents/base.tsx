import type { DocumentFilter, WithSchoolAndYearId } from "@/commons/types/services";
import { DocumentEnrollmentForm, type DocumentEnrollmentFormData } from "@/renderer/components/form/documents/classroom-document-export"
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { useCallback } from "react";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { useGetClassroomAsOptions } from "@/renderer/hooks/data-as-options";
import type { UseMutationResult } from "@tanstack/react-query";

type UseMutationResultExport = UseMutationResult<{ filenamePath: string; }, Error, DocumentFilter, unknown>
export const DocumentExport: React.FC<WithSchoolAndYearId<{ useExportMutation: () => UseMutationResultExport; onSuccess?(data: { filenamePath: string; }): void }>> = ({ schoolId, yearId, useExportMutation, onSuccess }) => {
    const classrooms = useGetClassroomAsOptions({ schoolId, yearId }, { labelFormat: "short" })
    const mutation = useExportMutation()
    const onSubmit = useCallback((value: DocumentEnrollmentFormData) => {
        mutation.mutate(value, createMutationCallbacksWithNotifications({
            onSuccess(data) {
                onSuccess?.(data)
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