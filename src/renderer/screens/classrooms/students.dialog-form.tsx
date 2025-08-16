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
import { useCreateQuickEnrolement } from "@/renderer/libs/queries/enrolement";
import { FormSubmitter } from "@/renderer/components/form/form-submiter";
import React from "react";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { Button } from "@/renderer/components/ui/button";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";

export function useGetClassroomsAsOptions({ schoolId, yearId }: WithSchoolAndYearId) {
    const { data: classrooms = [] } = useGetClassrooms({ schoolId, yearId });
    return React.useMemo(
        () =>
            classrooms.map((classroom) => ({
                value: classroom.classId,
                label: `${classroom.identifier} (${classroom.shortIdentifier})`,
            })),
        [classrooms]
    );
}

interface QuickEnrollmentDialogFormProps {
    classId: string;
    schoolId: string;
    yearId?: string;
    onValidateData?: () => void
}

export const QuickEnrollmentDialogForm: React.FC<
    React.PropsWithChildren<QuickEnrollmentDialogFormProps>
> = ({ classId, schoolId, yearId, children, onValidateData }) => {
    const form = useFormHandleRef<QuickEnrollmentFormData>();
    const classrooms = useGetClassroomsAsOptions({ schoolId, yearId });


    const quickEnrollmentMutation = useCreateQuickEnrolement();
    const onSubmit = React.useCallback((value: QuickEnrollmentFormData) => {
        quickEnrollmentMutation.mutate(
            value,
            createMutationCallbacksWithNotifications({
                onSuccess() {
                    form.current?.reset();
                    onValidateData?.()
                },
            })
        );
    }, []);

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
                    <FormSubmitter.Wrapper>
                        <QuickEnrollmentForm
                            ref={form}
                            initialValues={{ classroomId: classId, schoolId, yearId }}
                            classrooms={classrooms}
                            onSubmit={onSubmit}
                        />
                    </FormSubmitter.Wrapper>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="secondary">Fermer</Button>
                        </DialogClose>
                        <FormSubmitter.Trigger asChild>
                            <ButtonLoader
                                isLoading={quickEnrollmentMutation.isPending}
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