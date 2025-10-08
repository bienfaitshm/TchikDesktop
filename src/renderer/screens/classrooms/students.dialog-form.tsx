import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/renderer/components/ui/dialog";
import {
    QuickEnrollmentForm,
    useFormHandleRef,
    QuickEnrollmentFormData,
} from "@/renderer/components/form/quick-enrolement-form";
import { FormSubmitter } from "@/renderer/components/form/form-submiter";
import React from "react";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { Button } from "@/renderer/components/ui/button";
import { useOnValidateDataRefresh } from "@/renderer/providers/refrecher";
import { useGetClassroomAsOptions } from "@/renderer/hooks/data-as-options";
import { useQuickEnrollement } from "@/renderer/hooks/query.actions";
import type { TEnrolement, WithSchoolAndYearId } from "@/commons/types/services";
import { TypographyLead } from "@/renderer/components/ui/typography";


interface QuickEnrollmentDialogFormProps {
    classId: string;
}

export const QuickEnrollmentDialogForm: React.FC<
    React.PropsWithChildren<WithSchoolAndYearId<QuickEnrollmentDialogFormProps>>
> = ({ classId, schoolId, yearId, children }) => {
    const [lastStudentEnrolled, setLastStudentEnrolled] = React.useState<TEnrolement | undefined>(undefined)
    const form = useFormHandleRef<QuickEnrollmentFormData>();
    const classrooms = useGetClassroomAsOptions({ schoolId, yearId }, { labelFormat: "short" })
    const onValidateData = useOnValidateDataRefresh()

    const { onSubmit, quickEnrolementMutation } = useQuickEnrollement({
        onSuccess(lastStudentEnrolled) {
            console.log(lastStudentEnrolled)
            form.current?.reset()
            setLastStudentEnrolled(lastStudentEnrolled)
            onValidateData?.()
        },
    })


    return (
        <Dialog modal={false}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <FormSubmitter>
                <DialogContent className="min-w-max">
                    <DialogHeader>
                        <DialogTitle>Inscription rapide</DialogTitle>
                        <DialogDescription>
                            Inscription et ajout de l'élève dans la salle ouverte
                        </DialogDescription>
                    </DialogHeader>
                    {lastStudentEnrolled ? (
                        <div>
                            <TypographyLead>Dernier eleves inscrits {lastStudentEnrolled.code}</TypographyLead>
                        </div>
                    ) : null}
                    <FormSubmitter.Wrapper>
                        <QuickEnrollmentForm
                            ref={form}
                            initialValues={{ classroomId: classId, schoolId, yearId }}
                            classrooms={classrooms}
                            onSubmit={onSubmit}
                        />
                    </FormSubmitter.Wrapper>
                    <DialogFooter className="border-t pt-10">
                        <DialogClose asChild>
                            <Button variant="secondary">Fermer</Button>
                        </DialogClose>
                        <FormSubmitter.Trigger asChild>
                            <ButtonLoader
                                isLoading={quickEnrolementMutation.isPending}
                                isLoadingText="Inscription en cours..."
                            >
                                Inscrire
                            </ButtonLoader>
                        </FormSubmitter.Trigger>
                    </DialogFooter>
                </DialogContent>
            </FormSubmitter>
        </Dialog>
    );
};