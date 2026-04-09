import React from 'react';
import { Button } from '@/renderer/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/renderer/components/ui/dialog';

import {
    QuickEnrollmentForm,
    QuickEnrollmentFormData,
    useFormHandleRef,
} from '@/renderer/components/form/quick-enrolement-form';
import { ButtonLoader } from '@/renderer/components/form/button-loader';
import { FormSubmitter } from '@/renderer/components/form/form-submiter';

import { useGetClassroomAsOptions } from '@/renderer/hooks/data-as-options';
import { useQuickEnrollement } from '@/renderer/hooks/query.actions';
import { TypographySmall } from '../ui/typography';
import { TEnrolementAttributes } from '@/packages/@core/data-access/schema-validations';


export type EnrollmentDialogProps = React.PropsWithChildren<{
    initialValues?: Partial<QuickEnrollmentFormData>,
    onSuccess?(): void,
    dialogTitle?: string;
    dialogDescription?: string;
}>

/**
 * @description A dialog component containing the form for a new enrollment.
 * It manages the form submission logic and its state.
 */
export const EnrollmentDialog: React.FC<EnrollmentDialogProps> = ({
    initialValues,
    children,
    dialogTitle = "Nouvelle Inscription",
    dialogDescription = "Remplissez les informations ci-dessous pour inscrire un nouvel élève.",
    onSuccess,
}) => {
    const formRef = useFormHandleRef<QuickEnrollmentFormData>();
    const classroomsOptions = useGetClassroomAsOptions({ where: { schoolId: initialValues?.schoolId, yearId: initialValues?.yearId } }, { labelFormat: "short" });

    const [prevEnrollement, setPrevEnrollement] = React.useState<TEnrolementAttributes | undefined>(undefined)

    const { onSubmit, quickEnrolementMutation } = useQuickEnrollement({
        onSuccess: (enrolement) => {
            formRef.current?.reset();
            onSuccess?.()
            setPrevEnrollement(enrolement)
        },
    });

    const isSubmitting = quickEnrolementMutation.isPending;

    return (
        <Dialog modal={false}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="min-w-max max-w-2xl" aria-disabled>
                <FormSubmitter>
                    <DialogHeader>
                        <DialogTitle>{dialogTitle}</DialogTitle>
                        <DialogDescription>
                            {dialogDescription}
                        </DialogDescription>
                    </DialogHeader>
                    {prevEnrollement && (
                        <div>
                            <TypographySmall>Dernier enregistrement: {prevEnrollement.code}</TypographySmall>
                        </div>
                    )}
                    <FormSubmitter.Wrapper>
                        <QuickEnrollmentForm
                            ref={formRef}
                            initialValues={initialValues}
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