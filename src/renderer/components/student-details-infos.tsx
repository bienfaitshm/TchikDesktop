import { useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { formatDate } from "@/commons/libs/times";
import type { TEnrolement, TWithUser, TWithClassroom } from "@/commons/types/models"
import { Button } from '@/renderer/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { GenderBadge } from "./user-gender";
import { StudentStatusBadge } from "./student-status";
import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { SECTION_TRANSLATIONS } from '@/commons/constants/enum';
import { AnimatedFrameSwitcherProvider, AnimatedFrame, useChangeAnimatedFrame } from "@/renderer/components/animated-frame-switcher";
import { BaseUserSchemaForm, type BaseUserSchemaFormData } from "./form/user-base-form";
import { type EnrollmentFormData, EnrollmentForm } from "./form/enrollment-form"
import { FormSubmitter } from "./form/form-submiter";
import { ButtonLoader } from "./form/button-loader";
import { useUpdateUser } from "@/renderer/libs/queries/account";
import { useGetEnrollment, useUpdateEnrollment } from "@/renderer/libs/queries/enrolement";
import { useGetClassroomAsOption } from "@/renderer/hooks/data-as-options";
import { Suspense } from "@/renderer/libs/queries/suspense";

export type StudentDetails = TWithClassroom<TWithUser<TEnrolement>>


interface StudentDetailsCardProps {
    data: StudentDetails;
    schoolId: string;
    yearId: string;
}

const TextInfo = ({ title, value }: { title: string; value: string | number }) => (
    <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-medium">{value}</p>
    </div>
);

const StudentPersonalInfos = ({ user }: { user: StudentDetails['User'] }) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    const formattedBirthDate = user.birthDate ? formatDate(user.birthDate) : "-";

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <TextInfo title="Nom d'utilisateur" value={user.username} />
                <TextInfo title="Identifiant Élève" value={user.userId} />
                <TextInfo title="Date de naissance" value={formattedBirthDate} />
                <TextInfo title="Lieu de naissance" value={user.birthPlace || "-"} />
            </div>
            <div className="mt-6 pt-4 border-t">
                <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleChangeFrame("edit-student-infos")}
                    variant="secondary"
                >
                    <PencilIcon className="size-4 mr-2" />
                    Modifier les informations
                </Button>
            </div>
        </>
    );
};

const StudentInscriptionInfos = ({ enrollment }: { enrollment: StudentDetails }) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    const sectionTranslation = useMemo(() => SECTION_TRANSLATIONS[enrollment.ClassRoom.section], [enrollment])

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <TextInfo title="Classe" value={enrollment.ClassRoom.identifier} />
                <TextInfo title="Section" value={sectionTranslation} />
                <TextInfo title="Code d'inscription" value={enrollment.code} />
                <TextInfo title="Nouvel élève" value={enrollment.isNewStudent ? 'Oui' : 'Non'} />
            </div>
            <div className="mt-6 pt-4 border-t">
                <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleChangeFrame("edit-enrollment-infos")}
                    variant="secondary"
                >
                    <PencilIcon className="size-4 mr-2" />
                    Modifier les informations sur l'inscription
                </Button>
            </div>
        </>
    );
};

const EditStudentInfos = ({ user, schoolId, onRefress }: { user: StudentDetails['User']; schoolId: string, onRefress?(): void }) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    const updateMutation = useUpdateUser()
    const handlerGoBack = useCallback(() => handleChangeFrame("student-infos"), [])
    const onSubmit = useCallback((data: BaseUserSchemaFormData) => {
        updateMutation.mutate({ userId: user.userId, data }, createMutationCallbacksWithNotifications({
            onSuccess() {
                handlerGoBack()
                onRefress?.()
            }
        }))
    }, [schoolId]);

    return (
        <FormSubmitter>
            <FormSubmitter.Wrapper>
                <BaseUserSchemaForm initialValues={user} onSubmit={onSubmit} />
            </FormSubmitter.Wrapper>
            <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
                <Button size="sm" className="h-8" onClick={handlerGoBack} variant="secondary">
                    Annuler
                </Button>
                <FormSubmitter.Trigger asChild>
                    <ButtonLoader size="sm" className="h-8" isLoading={updateMutation.isPending} isLoadingText="Enregistrement...">
                        Enregistrer
                    </ButtonLoader>
                </FormSubmitter.Trigger>
            </div>
        </FormSubmitter>
    );
};

const EditEnrollmentInfos = ({
    enrollment,
    schoolId,
    yearId,
    onRefress
}: {
    enrollment: Omit<StudentDetails, 'User'>,
    yearId: string,
    schoolId: string,
    onRefress?(): void
}) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    const updateMutation = useUpdateEnrollment();
    const classroomsOptions = useGetClassroomAsOption({ schoolId, yearId, params: {} }, { label: "short" })
    const handlerGoBack = useCallback(() => handleChangeFrame("inscription-infos"), [])

    const onSubmit = useCallback((data: EnrollmentFormData) => {
        updateMutation.mutate({ enrolementId: enrollment.enrolementId, data }, createMutationCallbacksWithNotifications({
            onSuccess() {
                handlerGoBack()
                onRefress?.()
            }
        }))
    }, [enrollment.enrolementId]);

    const initialValues = {
        classroomId: enrollment.classroomId,
        schoolId: enrollment.schoolId,
        yearId: enrollment.ClassRoom.yearId,
        studentId: enrollment.studentId,
        status: enrollment.status,
        isNewStudent: enrollment.isNewStudent
    }

    return (
        <FormSubmitter>
            <FormSubmitter.Wrapper>
                <EnrollmentForm
                    classrooms={classroomsOptions}
                    initialValues={initialValues}
                    onSubmit={onSubmit}
                />
            </FormSubmitter.Wrapper>
            <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
                <Button
                    size="sm"
                    className="h-8"
                    onClick={handlerGoBack}
                    variant="secondary"
                >
                    Annuler
                </Button>
                <FormSubmitter.Trigger asChild>
                    <ButtonLoader
                        size="sm"
                        className="h-8"
                        isLoading={updateMutation.isPending}
                        isLoadingText="Enregistrement..."
                    >
                        Enregistrer
                    </ButtonLoader>
                </FormSubmitter.Trigger>
            </div>
        </FormSubmitter>
    );
};

export const StudentDetailsCard = ({ schoolId, yearId, data }: StudentDetailsCardProps) => {
    const { data: enrollment, refetch } = useGetEnrollment(data.enrolementId, { initialData: data })
    console.log("StudentDetailsCard", { enrollment })
    const onRefress = useCallback(() => {
        refetch()
    }, [])
    return (
        <div className="space-y-6">
            {/* Informations Personnelles */}
            <Card className="relative h-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{enrollment.User.fullname}</CardTitle>
                        <GenderBadge withIcon gender={enrollment.User.gender} />
                    </div>
                    <CardDescription>Détails personnels de l'élève.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatedFrameSwitcherProvider defaultActiveFrame="student-infos">
                        <AnimatedFrame name="student-infos">
                            <StudentPersonalInfos user={enrollment.User} />
                        </AnimatedFrame>
                        <AnimatedFrame name="edit-student-infos">
                            <Suspense>
                                <EditStudentInfos
                                    schoolId={schoolId}
                                    user={enrollment.User}
                                    onRefress={onRefress}
                                />
                            </Suspense>
                        </AnimatedFrame>
                    </AnimatedFrameSwitcherProvider>
                </CardContent>
            </Card>

            {/* Détails de la classe et de l'inscription */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Classe et Inscription</CardTitle>
                            <CardDescription>Informations sur la scolarité actuelle de l'élève.</CardDescription>
                        </div>
                        <div className="flex flex-col items-end">
                            <StudentStatusBadge status={enrollment.status} />
                            <p className="text-sm text-muted-foreground">Statut de l'élève</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <AnimatedFrameSwitcherProvider defaultActiveFrame="inscription-infos">
                        <AnimatedFrame name="inscription-infos">
                            <StudentInscriptionInfos enrollment={enrollment} />
                        </AnimatedFrame>
                        <AnimatedFrame name="edit-enrollment-infos">
                            <Suspense>
                                <EditEnrollmentInfos
                                    onRefress={onRefress}
                                    schoolId={schoolId}
                                    yearId={yearId}
                                    enrollment={enrollment}
                                />
                            </Suspense>
                        </AnimatedFrame>
                    </AnimatedFrameSwitcherProvider>
                </CardContent>
            </Card>
        </div>
    );
};