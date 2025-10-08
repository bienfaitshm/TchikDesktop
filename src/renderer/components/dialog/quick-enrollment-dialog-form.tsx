import React from 'react';

import { WithSchoolAndYearId } from '@/commons/types/services';

import { Button } from '@/renderer/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/renderer/components/ui/dialog';

import { QuickEnrollmentForm, QuickEnrollmentFormData, useFormHandleRef } from '@/renderer/components/form/quick-enrolement-form';
import { ButtonLoader } from '@/renderer/components/form/button-loader';
import { FormSubmitter } from '@/renderer/components/form/form-submiter';

import { useGetClassroomAsOptions } from '@/renderer/hooks/data-as-options';
import { useQuickEnrollement } from '@/renderer/hooks/query.actions';

/**
 * @description A dialog component containing the form for a new enrollment.
 * It manages the form submission logic and its state.
 */
export const EnrollmentDialog: React.FC<WithSchoolAndYearId<{ initialValues?: Partial<QuickEnrollmentFormData>, onSuccess?(): void }>> = ({ initialValues, schoolId, yearId, onSuccess }) => {
    const formRef = useFormHandleRef();
    const classroomsOptions = useGetClassroomAsOptions({ schoolId, yearId }, { labelFormat: "short" });

    const { onSubmit, quickEnrolementMutation } = useQuickEnrollement({
        onSuccess: () => {
            formRef.current?.reset();
            onSuccess?.()
        },
    });

    const isSubmitting = quickEnrolementMutation.isPending;

    return (
        <Dialog modal={false}>
            <DialogTrigger asChild>
                <Button size="sm">Nouvelle inscription</Button>
            </DialogTrigger>
            <DialogContent className="min-w-max max-w-2xl">
                <FormSubmitter>
                    <DialogHeader>
                        <DialogTitle>Nouvelle Inscription</DialogTitle>
                        <DialogDescription>
                            Remplissez les informations ci-dessous pour inscrire un nouvel élève.
                        </DialogDescription>
                    </DialogHeader>

                    <FormSubmitter.Wrapper>
                        <QuickEnrollmentForm
                            ref={formRef}
                            initialValues={{ schoolId, yearId, ...initialValues }}
                            onSubmit={onSubmit}
                            classrooms={classroomsOptions}
                        />
                    </FormSubmitter.Wrapper>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button id="close-dialog-button" variant="outline">Annuler</Button>
                        </DialogClose>
                        <FormSubmitter.Trigger asChild>
                            <ButtonLoader isLoading={isSubmitting} isLoadingText="Enregistrement...">
                                Enregistrer
                            </ButtonLoader>
                        </FormSubmitter.Trigger>
                    </DialogFooter>
                </FormSubmitter>
            </DialogContent>
        </Dialog>
    );
};