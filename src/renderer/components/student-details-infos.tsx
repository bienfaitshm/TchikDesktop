import { useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { formatDate } from "@/commons/libs/times";
import type { TEnrolement, TWithUser, TWithClassroom } from "@/commons/types/models"
import { Button } from '@/renderer/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { GenderBadge } from "./user-gender";
import { StudentStatusBadge } from "./student-status";

import { SECTION_TRANSLATIONS } from '@/commons/constants/enum';
import { AnimatedFrameSwitcherProvider, AnimatedFrame, useChangeAnimatedFrame } from "@/renderer/components/animated-frame-switcher";
import { BaseUserSchemaForm, type BaseUserSchemaFormData } from "./form/user-base-form";
import { type EnrollmentFormData, EnrollmentForm } from "./form/enrollment-form"
import { FormSubmitter } from "./form/form-submiter";
import { ButtonLoader } from "./form/button-loader";

// --- 1. Définition des types ---
export type StudentDetails = TWithClassroom<TWithUser<TEnrolement>>


interface StudentDetailsCardProps {
    data: StudentDetails;
    schoolId: string;
    yearId: string;
}

// --- 2. Composants atomiques réutilisables ---
const TextInfo = ({ title, value }: { title: string; value: string | number }) => (
    <div className="space-y-1">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="font-medium">{value}</p>
    </div>
);

// --- 3. Composants "Frames" pour l'animation ---
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
    const sectionTranslation = SECTION_TRANSLATIONS[enrollment.ClassRoom.section];

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

const EditStudentInfos = ({ user, schoolId }: { user: StudentDetails['User']; schoolId: string }) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    const onSubmit = useCallback((value: BaseUserSchemaFormData) => {
        console.log("Submit Student:", schoolId, value);
    }, [schoolId]);

    return (
        <FormSubmitter>
            <FormSubmitter.Wrapper>
                <BaseUserSchemaForm initialValues={user} onSubmit={onSubmit} />
            </FormSubmitter.Wrapper>
            <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
                <Button size="sm" className="h-8" onClick={() => handleChangeFrame("student-infos")} variant="secondary">
                    Annuler
                </Button>
                <FormSubmitter.Trigger asChild>
                    <ButtonLoader size="sm" className="h-8" isLoadingText="Enregistrement...">
                        Enregistrer
                    </ButtonLoader>
                </FormSubmitter.Trigger>
            </div>
        </FormSubmitter>
    );
};

const EditEnrollmentInfos = ({ enrollment }: { enrollment: Omit<StudentDetails, 'User'> }) => {
    const handleChangeFrame = useChangeAnimatedFrame();
    const onSubmit = useCallback((value: EnrollmentFormData) => {
        console.log("Submit Enrollment:", enrollment.enrolementId, value);
    }, [enrollment.enrolementId]);

    const initialValues = {
        classroomId: enrollment.classroomId,
        schoolId: enrollment.schoolId,
        yearId: enrollment.ClassRoom.yearId,
        studentId: enrollment.studentId,
    }

    return (
        <FormSubmitter>
            <FormSubmitter.Wrapper>
                <EnrollmentForm initialValues={initialValues} onSubmit={onSubmit} />
            </FormSubmitter.Wrapper>
            <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
                <Button size="sm" className="h-8" onClick={() => handleChangeFrame("inscription-infos")} variant="secondary">
                    Annuler
                </Button>
                <FormSubmitter.Trigger asChild>
                    <ButtonLoader size="sm" className="h-8" isLoadingText="Enregistrement...">
                        Enregistrer
                    </ButtonLoader>
                </FormSubmitter.Trigger>
            </div>
        </FormSubmitter>
    );
};

export const StudentDetailsCard = ({ schoolId, data }: StudentDetailsCardProps) => {
    return (
        <div className="space-y-6">
            {/* Informations Personnelles */}
            <Card className="relative h-full">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">{data.User.fullname}</CardTitle>
                        <GenderBadge withIcon gender={data.User.gender} />
                    </div>
                    <CardDescription>Détails personnels de l'élève.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AnimatedFrameSwitcherProvider defaultActiveFrame="student-infos">
                        <AnimatedFrame name="student-infos">
                            <StudentPersonalInfos user={data.User} />
                        </AnimatedFrame>
                        <AnimatedFrame name="edit-student-infos">
                            <EditStudentInfos user={data.User} schoolId={schoolId} />
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
                            <StudentStatusBadge status={data.status} />
                            <p className="text-sm text-muted-foreground">Statut de l'élève</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <AnimatedFrameSwitcherProvider defaultActiveFrame="inscription-infos">
                        <AnimatedFrame name="inscription-infos">
                            <StudentInscriptionInfos enrollment={data} />
                        </AnimatedFrame>
                        <AnimatedFrame name="edit-enrollment-infos">
                            <EditEnrollmentInfos enrollment={data} />
                        </AnimatedFrame>
                    </AnimatedFrameSwitcherProvider>
                </CardContent>
            </Card>
        </div>
    );
};