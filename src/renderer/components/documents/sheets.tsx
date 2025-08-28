import type { WithSchoolAndYearId } from "@/commons/types/services";
import { useExportStudentEnrollementSheet } from "@/renderer/libs/queries/document-export";
import { DocumentExport } from "./base";


export const EnrollmentSheetExport: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {

    return (
        <DocumentExport
            schoolId={schoolId}
            yearId={yearId}
            useExportMutation={useExportStudentEnrollementSheet}
            onSuccess={(data) => {
                console.log(data)
            }}
        />
    )
}