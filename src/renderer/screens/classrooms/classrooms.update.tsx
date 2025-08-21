import React from "react";
import { ClassroomForm, type ClassroomFormData as FormValueType } from "@/renderer/components/form/classroom-form";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { FormSubmitter } from "@/renderer/components/form/form-submiter"
import { useUpdateClassroom } from "@/renderer/libs/queries/classroom";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";


const FormLoadOption: React.FC<React.PropsWithChildren<{ initialValues: Partial<FormValueType>, onSubmit(value: FormValueType): void }>> = ({ initialValues, ...props }) => {
    const options = useGetOptionAsOptions(initialValues.schoolId as string)
    return (
        <ClassroomForm
            options={options}
            initialValues={initialValues}
            {...props}
        />
    )
}

export const ButtonEditClassroom: React.FC<{ initialValues: Partial<FormValueType>, classId: string }> = ({ initialValues, classId }) => {
    const navigation = useNavigate()
    const updateMutation = useUpdateClassroom();
    const handleCreate = React.useCallback((values: FormValueType) => {
        updateMutation.mutate({ classId, data: values }, createMutationCallbacksWithNotifications({
            successMessageTitle: "La classe mis à jour !",
            successMessageDescription: `La classe '${values.identifier}' a été modifié avec succès.`,
            errorMessageTitle: "Échec de la mise à jour de la classe.",
            onSuccess: (data) => {
                navigation(`/classrooms/${data.classId}/students`, { relative: "route" })
            },
        }));
    }, [updateMutation]);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="rounded-full">
                    <Plus className="size-4 mr-1" />
                    <span>Modifiez</span>
                </Button>
            </DialogTrigger>
            <FormSubmitter>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modification de la classe</DialogTitle>
                        <DialogDescription>Modifiez les informations de la classe sélectionnée.</DialogDescription>
                    </DialogHeader>
                    <Suspense>
                        <FormSubmitter.Wrapper>
                            <FormLoadOption initialValues={initialValues} onSubmit={handleCreate} />
                        </FormSubmitter.Wrapper>
                    </Suspense>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" disabled={updateMutation.isPending}>Annuler</Button>
                        </DialogClose>
                        <FormSubmitter.Trigger asChild>
                            <ButtonLoader
                                size="sm"
                                isLoading={updateMutation.isPending}
                                disabled={updateMutation.isPending}
                                isLoadingText="Enregistrement ..."
                            >
                                Modifier
                            </ButtonLoader>
                        </FormSubmitter.Trigger>
                    </DialogFooter>
                </DialogContent>
            </FormSubmitter>
        </Dialog>
    )
} 