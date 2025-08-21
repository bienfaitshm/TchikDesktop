import React from "react";
import { ClassroomForm, type ClassroomFormData as FormValueType } from "@/renderer/components/form/classroom-form";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/renderer/components/ui/dialog";
import { Button } from "@/renderer/components/ui/button";
import { ButtonLoader } from "@/renderer/components/form/button-loader";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { FormSubmitter } from "@/renderer/components/form/form-submiter"

import { WithSchoolAndYearId } from "@/commons/types/services";
import { useCreateClassroom } from "@/renderer/libs/queries/classroom";
import { useGetOptionAsOptions } from "@/renderer/hooks/data-as-options";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";


const FormLoadOption: React.FC<React.PropsWithChildren<WithSchoolAndYearId<{ onSubmit(value: FormValueType): void }>>> = ({ schoolId, yearId, ...props }) => {
    const options = useGetOptionAsOptions(schoolId)
    return (
        <ClassroomForm
            options={options}
            initialValues={{ schoolId, yearId }}
            {...props}
        />
    )
}

export const ButtonNewClassroom: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const navigation = useNavigate()
    const createMutation = useCreateClassroom();
    const handleCreate = React.useCallback((values: FormValueType) => {
        createMutation.mutate(values, createMutationCallbacksWithNotifications({
            successMessageTitle: "La classe créé !",
            successMessageDescription: `La classe '${values.identifier}' a été ajoutée avec succès.`,
            errorMessageTitle: "Échec de la création de la classe.",
            onSuccess: (data) => {
                navigation(`/classrooms/${data.classId}/students`)
            },
        }));
    }, [createMutation]);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="rounded-full">
                    <Plus className="size-4 mr-1" />
                    <span>Ajouter une classe</span>
                </Button>
            </DialogTrigger>
            <FormSubmitter>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Création de la classe</DialogTitle>
                        <DialogDescription>Remplissez les informations ci-dessous pour créer une nouvelle classe.</DialogDescription>
                    </DialogHeader>
                    <Suspense>
                        <FormSubmitter.Wrapper>
                            <FormLoadOption schoolId={schoolId} yearId={yearId} onSubmit={handleCreate} />
                        </FormSubmitter.Wrapper>
                    </Suspense>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" size="sm" disabled={createMutation.isPending}>Annuler</Button>
                        </DialogClose>
                        <FormSubmitter.Trigger asChild>
                            <ButtonLoader
                                size="sm"
                                isLoading={createMutation.isPending}
                                disabled={createMutation.isPending}
                                isLoadingText="Enregistrement ..."
                            >
                                Enregistrer
                            </ButtonLoader>
                        </FormSubmitter.Trigger>
                    </DialogFooter>
                </DialogContent>
            </FormSubmitter>
        </Dialog>
    )
} 