import { WithSchoolAndYearId } from "@/camons/types/services"
import { TypographyH1 } from "../components/ui/typography"
import { useGetEnrolements } from "@/renderer/libs/queries/enrolement"
import { useGetCurrentYearSchool } from "../libs/stores/app-store"


const StudentEnrolement: React.FC<Required<WithSchoolAndYearId<{}>>> = ({ schoolId, yearId }) => {
    const { data: infos } = useGetEnrolements({ schoolId, yearId })
    return (
        <div className="h-screen flex justify-center items-center">
            <TypographyH1>
                Student Screen
            </TypographyH1>
            <code>
                {JSON.stringify(infos, null, 4)}
            </code>
        </div>
    )
}

const StudentScreen = () => {
    const { schoolId, yearId } = useGetCurrentYearSchool()
    if (!schoolId && !yearId) {
        return null;
    }
    return <StudentEnrolement schoolId={schoolId} yearId={yearId} />
}

export default StudentScreen