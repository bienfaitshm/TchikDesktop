import type { WithSchoolAndYearId } from "@/commons/types/services";
import { useExportCotationDocument, useExportStudentEnrollementDocument } from "@/renderer/libs/queries/document-export";
import { DocumentExport } from "./base";


export const CotationDocumentExport: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    return (
        <DocumentExport
            schoolId={schoolId}
            yearId={yearId}
            useExportMutation={useExportCotationDocument}
            onSuccess={(data) => {
                console.log(data)
            }}
        />
    )
}

export const EnrollmentDocumentExport: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    return (
        <DocumentExport
            schoolId={schoolId}
            yearId={yearId}
            useExportMutation={useExportStudentEnrollementDocument}
            onSuccess={(data) => {
                console.log(data)
            }}
        />
    )
} 