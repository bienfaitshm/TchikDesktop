import React, { useCallback, useMemo } from "react";
import { useParams } from "react-router";
import { PencilIcon, CheckCircle2Icon } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Button } from '@/renderer/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/renderer/components/ui/alert";
import { GenderBadge } from "./user-gender";
import { StudentStatusBadge } from "./student-status";
import { BaseUserSchemaForm, type BaseUserSchemaFormData } from "./form/user-base-form";
import { EnrollmentForm, type EnrollmentFormData } from "./form/enrollment-form";
import { FormSubmitter } from "./form/form-submiter";
import { ButtonLoader } from "./form/button-loader";
import { AnimatedFrame, AnimatedFrameSwitcherProvider, useChangeAnimatedFrame } from "@/renderer/components/animated-frame-switcher";

import { createMutationCallbacksWithNotifications } from "@/renderer/utils/mutation-toast";
import { SECTION_TRANSLATIONS } from '@/commons/constants/enum';
import { formatDate } from "@/commons/libs/times";
import { useGetEnrollmentById, useUpdateEnrollment } from "@/renderer/libs/queries/enrolement";
import { useUserManagement } from "@/renderer/hooks/query.mangements";
import { useGetClassroomAsOptions } from "@/renderer/hooks/data-as-options";
import { Suspense } from "@/renderer/libs/queries/suspense";
import type { TEnrolement, TWithUser, TWithClassroom } from "@/commons/types/models";

// Types
export type StudentDetails = TWithClassroom<TWithUser<TEnrolement>>;
export interface StudentDetailsCardProps {
    data: StudentDetails;
    schoolId: string;
    yearId: string;
    onRefresh?(): void;
}

// Composant pour afficher une ligne d'information
const TextInfo = ({ title, value }: { title: string; value: string | number | null }) => (
    <div className="space-y-1">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="font-medium text-sm">{value ?? "-"}</p>
    </div>
);


const InfoView: React.FC<React.PropsWithChildren<{ title?: string, value: string }>> = ({ children, value, title = "Modifier les informations" }) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {children}
            </div>
            <div className="mt-6 pt-4 border-t">
                <Button
                    size="sm"
                    className="h-8 text-sm"
                    onClick={() => handleChangeFrame(value)}
                    variant="secondary"
                >
                    <PencilIcon className="size-4 mr-2" />
                    <span className="text-xs">{title}</span>
                </Button>
            </div>
        </>
    )
}

// Composant pour afficher les informations personnelles de l'élève
const StudentPersonalInfos = ({ user }: { user: StudentDetails['User'] }) => {
    const formattedBirthDate = user.birthDate ? formatDate(user.birthDate) : null;
    return (
        <InfoView value="edit-personal-infos">
            <TextInfo title="Nom d'utilisateur" value={user.username} />
            <TextInfo title="Identifiant Élève" value={user.userId} />
            <TextInfo title="Date de naissance" value={formattedBirthDate} />
            <TextInfo title="Lieu de naissance" value={user.birthPlace} />
        </InfoView>
    )
};

// Composant pour afficher les informations d'inscription
const StudentEnrollmentInfos = ({ enrollment }: { enrollment: StudentDetails }) => {
    const sectionTranslation = useMemo(() => SECTION_TRANSLATIONS[enrollment.ClassRoom.section], [enrollment]);
    return (
        <InfoView value="edit-enrollment-infos">
            <TextInfo title="Classe" value={enrollment.ClassRoom.identifier} />
            <TextInfo title="Section" value={sectionTranslation} />
            <TextInfo title="Code d'inscription" value={enrollment.code} />
            <TextInfo title="Nouvel élève" value={enrollment.isNewStudent ? 'Oui' : 'Non'} />
        </InfoView>
    )
};


const InfoEdit: React.FC<React.PropsWithChildren<{ value: string, isLoading?: boolean }>> = ({ children, value, isLoading }) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    return (
        <FormSubmitter>
            <FormSubmitter.Wrapper>
                {children}
            </FormSubmitter.Wrapper>
            <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
                <Button
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => handleChangeFrame(value)}
                    variant="secondary"
                    disabled={isLoading}
                >
                    Annuler
                </Button>
                <FormSubmitter.Trigger asChild>
                    <ButtonLoader
                        size="sm"
                        className="h-8 text-xs"
                        isLoading={isLoading}
                        isLoadingText="Enregistrement..."
                    >
                        Enregistrer
                    </ButtonLoader>
                </FormSubmitter.Trigger>
            </div>
        </FormSubmitter>
    )
}
// Composant pour le formulaire d'édition des informations personnelles
const EditStudentInfos = ({ user, onRefresh }: { user: StudentDetails['User']; onRefresh?: () => void }) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    const { handleUpdate, updateMutation } = useUserManagement();

    const onSubmit = useCallback((data: BaseUserSchemaFormData) => {
        handleUpdate(user.userId, data, data.lastName, () => {
            handleChangeFrame("personal-infos");
            onRefresh?.();
        });
    }, [handleUpdate, handleChangeFrame, onRefresh, user.userId, user.lastName]);

    return (
        <InfoEdit value="personal-infos" isLoading={updateMutation.isPending}>
            <BaseUserSchemaForm initialValues={user} onSubmit={onSubmit} />
        </InfoEdit>
    )
};

// Composant pour le formulaire d'édition des informations d'inscription
const EditEnrollmentInfos = ({
    enrollment,
    schoolId,
    yearId,
    onRefresh
}: {
    enrollment: Omit<StudentDetails, 'User'>;
    yearId: string;
    schoolId: string;
    onRefresh?: () => void;
}) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    const updateMutation = useUpdateEnrollment();
    const classroomsOptions = useGetClassroomAsOptions({ schoolId, yearId, params: {} }, { labelFormat: "short" });

    const onSubmit = useCallback((data: EnrollmentFormData) => {
        updateMutation.mutate({ id: enrollment.enrolementId, data }, createMutationCallbacksWithNotifications({
            onSuccess() {
                handleChangeFrame("enrollment-infos");
                onRefresh?.();
            }
        }));
    }, [enrollment.enrolementId, updateMutation, handleChangeFrame, onRefresh]);

    const initialValues = useMemo(() => ({
        classroomId: enrollment.classroomId,
        schoolId: enrollment.schoolId,
        yearId: enrollment.ClassRoom.yearId,
        studentId: enrollment.studentId,
        status: enrollment.status,
        isNewStudent: enrollment.isNewStudent
    }), [enrollment]);

    return (
        <InfoEdit isLoading={updateMutation.isPending} value="enrollment-infos">
            <EnrollmentForm
                classrooms={classroomsOptions}
                initialValues={initialValues}
                onSubmit={onSubmit}
            />
        </InfoEdit>
    );
};

export const StudentDetailsCard = ({ schoolId, yearId, data, onRefresh: globalRefesh }: StudentDetailsCardProps) => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const { data: enrollment, refetch } = useGetEnrollmentById(data.enrolementId, { initialData: data });

    const onRefresh = useCallback(() => {
        refetch();
        globalRefesh?.();
    }, [refetch, globalRefesh]);

    return (
        <div className="space-y-6">
            {/* Informations Personnelles */}
            <Card className="relative h-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{enrollment.User.fullname}</CardTitle>
                        <GenderBadge withIcon gender={enrollment.User.gender} />
                    </div>
                    <CardDescription className="text-xs">Détails personnels de l'élève.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatedFrameSwitcherProvider defaultActiveFrame="personal-infos">
                        <AnimatedFrame name="personal-infos">
                            <StudentPersonalInfos user={enrollment.User} />
                        </AnimatedFrame>
                        <AnimatedFrame name="edit-personal-infos">
                            <Suspense>
                                <EditStudentInfos user={enrollment.User} onRefresh={onRefresh} />
                            </Suspense>
                        </AnimatedFrame>
                    </AnimatedFrameSwitcherProvider>
                </CardContent>
            </Card>

            {/* Alerte de transfert d'élève */}
            {enrollment.classroomId !== classroomId && (
                <Alert>
                    <CheckCircle2Icon className="size-4" />
                    <AlertTitle className="text-sm">Élève transféré</AlertTitle>
                    <AlertDescription className="text-xs">
                        Cet élève ne fait plus partie de cette classe. Il a peut-être été transféré.
                    </AlertDescription>
                </Alert>
            )}

            {/* Détails de la classe et de l'inscription */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-sm">Classe et Inscription</CardTitle>
                            <CardDescription className="text-xs">Informations sur la scolarité actuelle de l'élève.</CardDescription>
                        </div>
                        <div className="flex flex-col items-end">
                            <StudentStatusBadge status={enrollment.status} />
                            <p className="text-xs text-muted-foreground">Statut de l'élève</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <AnimatedFrameSwitcherProvider defaultActiveFrame="enrollment-infos">
                        <AnimatedFrame name="enrollment-infos">
                            <StudentEnrollmentInfos enrollment={enrollment} />
                        </AnimatedFrame>
                        <AnimatedFrame name="edit-enrollment-infos">
                            <Suspense>
                                <EditEnrollmentInfos
                                    onRefresh={onRefresh}
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