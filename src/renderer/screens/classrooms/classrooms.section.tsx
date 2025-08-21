import { SECTION } from "@/commons/constants/enum"
import { WithSchoolAndYearId } from "@/commons/types/services"
import { Suspense } from "@/renderer/libs/queries/suspense"
import { useParams } from "react-router"
import { ClassroomSectionView } from "./classrooms.view"
import { withCurrentConfig } from "@/renderer/hooks/with-application-config"



const Classrooms: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const { section } = useParams<{ section: SECTION }>()
    return (
        <Suspense>
            <ClassroomSectionView schoolId={schoolId} yearId={yearId} section={section} />
        </Suspense>
    )
}

export const ClassroomSection = withCurrentConfig(Classrooms)


