import React from "react"
import { QuickEnrollmentForm, QuickEnrollmentFormData, useFormHandleRef } from "@/renderer/components/form/quick-enrolement-form"
import { TypographyH1 } from "@/renderer/components/ui/typography"
import { useGetClassrooms } from "@/renderer/libs/queries/classroom"
import { Suspense } from "@/renderer/libs/queries/suspense"
import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store"
import { ButtonLoader } from "@/renderer/components/form/button-loader"
import { useCreateQuickEnrolement } from "@/renderer/libs/queries/enrolement"
import { createMutationCallbacksWithNotifications } from "../utils/mutation-toast"

type InscriptionFormLoaderProps = {
    schoolId: string;
    yearId: string;
}
const InscriptionFormLoader: React.FC<InscriptionFormLoaderProps> = ({ schoolId, yearId }) => {
    const form = useFormHandleRef<QuickEnrollmentFormData>()
    const quickEnrolementMutation = useCreateQuickEnrolement()
    const { data: classrooms = [] } = useGetClassrooms({ schoolId, yearId, params: {} })
    const classroomsOptions = React.useMemo(() => classrooms.map(classroom => ({ value: classroom.classId, label: `${classroom.identifier} (${classroom.shortIdentifier})` })), [classrooms])

    const onSubmit = React.useCallback((value: QuickEnrollmentFormData) => {
        quickEnrolementMutation.mutate(value, createMutationCallbacksWithNotifications({
            onSuccess(data,) {
                console.log("success inscription", data)
                form.current?.reset()
            },
        }))
    }, [])
    return (
        <QuickEnrollmentForm ref={form} initialValues={{ schoolId, yearId }} onSubmit={onSubmit} classrooms={classroomsOptions}>
            <div>
                <ButtonLoader isLoading={quickEnrolementMutation.isPending} isLoadingText="Enregistrement encours...">
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