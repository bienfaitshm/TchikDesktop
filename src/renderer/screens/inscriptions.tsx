import React from "react"
import { WithSchoolAndYearId } from "@/commons/types/services"
import { QuickEnrollmentForm, QuickEnrollmentFormData, useFormHandleRef } from "@/renderer/components/form/quick-enrolement-form"
import { TypographyH1 } from "@/renderer/components/ui/typography"
import { Suspense } from "@/renderer/libs/queries/suspense"
import { ButtonLoader } from "@/renderer/components/form/button-loader"

import { useGetClassroomAsOptions } from "@/renderer/hooks/data-as-options"
import { useQuickEnrollement } from "@/renderer/hooks/query.actions"
import { withCurrentConfig } from "@/renderer/hooks/with-application-config"


const InscriptionFormLoader: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const form = useFormHandleRef<QuickEnrollmentFormData>()
    const classroomsOptions = useGetClassroomAsOptions({ schoolId, yearId, params: {} })
    const { onSubmit, quickEnrolementMutation } = useQuickEnrollement({
        onSuccess() {
            form.current?.reset()
        },
    })


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

const Inscription: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
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

export const QuickEnrollement = withCurrentConfig(Inscription)