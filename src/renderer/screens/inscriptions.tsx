import React from "react"
import { QuickEnrollmentForm, QuickEnrollmentFormData } from "@/renderer/components/form/quick-enrolement-form"
import { TypographyH1 } from "@/renderer/components/ui/typography"
import { useGetClassrooms } from "@/renderer/libs/queries/school"
import { Suspense } from "@/renderer/libs/queries/suspense"
import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store"
import { ButtonLoader } from "../components/form/button-loader"

type InscriptionFormLoaderProps = {
    schoolId: string;
    yearId: string;
}
const InscriptionFormLoader: React.FC<InscriptionFormLoaderProps> = ({ schoolId, yearId }) => {
    const [isloading, setIsloading] = React.useState(false)
    const { data: classrooms = [] } = useGetClassrooms(schoolId, yearId)
    const classroomsOptions = React.useMemo(() => classrooms.map(classroom => ({ value: classroom.classId, label: `${classroom.identifier} (${classroom.shortIdentifier})` })), [classrooms])
    console.log("InscriptionFormLoader")

    const onSubmit = React.useCallback((value: QuickEnrollmentFormData) => {
        console.log(value)
        setIsloading(true)
        setTimeout(() => {
            setIsloading(false)
        }, 30 * 1000)
    }, [])
    return (
        <QuickEnrollmentForm initialValues={{ schoolId, yearId }} onSubmit={onSubmit} classrooms={classroomsOptions}>
            <div>
                <ButtonLoader isLoading={isloading} isLoadingText="Enregistrement encours...">
                    Enregistrer
                </ButtonLoader>
            </div>
        </QuickEnrollmentForm>
    )
}

const InscriptionScreen = () => {
    const { schoolId, yearId } = useGetCurrentYearSchool()
    if (!schoolId && !yearId) {
        return null;
    }
    console.log("InscriptionScreen")
    return (
        <div className="mx-auto container max-w-screen-md">
            <TypographyH1>
                Inscription Screen
            </TypographyH1>
            <div>
                <Suspense>
                    <InscriptionFormLoader schoolId={schoolId} yearId={yearId} />
                </Suspense>
            </div>
        </div>
    )
}

export default InscriptionScreen