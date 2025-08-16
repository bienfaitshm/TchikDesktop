import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/renderer/components/ui/card";
import { Button } from '@/renderer/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/renderer/components/ui/dropdown-menu';
import { PencilIcon, ChevronDownIcon } from 'lucide-react';
import { GenderBadge } from "./user-gender";
import { StudentStatusBadge } from "./student-status";
import { formatDate } from "@/commons/libs/times";
import { STUDENT_STATUS, STUDENT_STATUS_TRANSLATIONS, USER_GENDER, SECTION_TRANSLATIONS } from '@/commons/constants/enum';
import { AnimatedFrameSwitcherProvider, AnimatedFrameSwitcherContent, AnimatedFrame, useChangeAnimatedFrame } from "@/renderer/components/animated-frame-switcher";
import { TypographyH1 } from "./ui/typography";


export type StudentDetails = {
    User: {
        fullname: string;
        gender: USER_GENDER;
        birthDate: string;
        birthPlace: string;
        userId: string;
        username: string
    };
    ClassRoom: {
        identifier: string;
        section: string;
    };
    enrolementId: string;
    status: STUDENT_STATUS;
    isNewStudent: boolean;
    code: string;
};


type TextInfoProps = { title: string, value: string | number }

const TextInfo: React.FC<TextInfoProps> = ({ title, value }) => {
    return (
        <div className="space-y-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="font-medium">{value}</p>
        </div>
    )
}

type StudentPersonalInfosProps = {
    identifier: string;
    section: string;
    status: STUDENT_STATUS;
    code: string;
    isNewStudent: boolean
}

const StudentInscriptionInfos: React.FC<StudentPersonalInfosProps> = ({ identifier, section, status, code, isNewStudent }) => {
    const availableStatus = Object.values(STUDENT_STATUS).filter(s => s !== status);
    const handleChangeFrame = useChangeAnimatedFrame()

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <TextInfo title="Classe" value={identifier} />
                <TextInfo title="Section" value={SECTION_TRANSLATIONS[section]} />
                <TextInfo title="Code d'inscription" value={code} />
                <TextInfo title="Nouvel élève" value={isNewStudent ? 'Oui' : 'Non'} />
                <div className="space-y-1 flex items-center justify-between gap-2">
                    <div>
                        <p className="text-sm text-gray-500">Statut</p>
                        <div className="flex items-center gap-2">
                            <StudentStatusBadge status={status} />
                            {/* Dropdown pour changer le statut */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="ml-auto h-8">
                                        Changer le statut
                                        <ChevronDownIcon className="size-4 ml-2" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>Statuts disponibles</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {/* {availableStatus.map((s) => (
                                                <DropdownMenuItem
                                                    key={s}
                                                    onClick={() => onChangeStatus(User.userId, s)}
                                                >
                                                    {STUDENT_STATUS_TRANSLATIONS[s]}
                                                </DropdownMenuItem>
                                            ))} */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-6 pt-4 border-t">
                <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleChangeFrame("student-transfert")}
                    variant="secondary"

                >
                    <PencilIcon className="size-4 mr-2" />
                    Tranfert dans une autre classe
                </Button>
                <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleChangeFrame("student-status")}
                    variant="secondary"

                >
                    <PencilIcon className="size-4 mr-2" />
                    Changer Le statut de l'eleve
                </Button>
            </div>
        </>
    )
}


type EditStudentInfosProps = {

}
const EditStudentInfos: React.FC<EditStudentInfosProps> = ({ }) => {
    const handleChangeFrame = useChangeAnimatedFrame()
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <TypographyH1>Edit student Infos</TypographyH1>
            </div>
            <div className="mt-6 pt-4 border-t">
                <Button
                    size="sm"
                    className="h-8"
                    onClick={() => handleChangeFrame("student-infos")}
                    variant="secondary"

                >
                    Annuler
                </Button>
            </div>
        </>
    )
}

type StudentPersonnalInfosProps = {
    birthDate: string;
    birthPlace: string;
    username: string;
    userId: string;
}

const StudentPersonnalInfos: React.FC<StudentPersonnalInfosProps> = ({ birthDate, birthPlace, username, userId }) => {
    const handleChangeFrame = useChangeAnimatedFrame()

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <TextInfo title="Date de naissance" value={birthDate} />
                <TextInfo title="Lieu de naissance" value={birthPlace} />
                <TextInfo title="Identifiant Élève" value={userId} />
                <TextInfo title="Nom d'utilisateur de l'Élève" value={username} />
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
    )
}
interface StudentDetailsCardProps {
    data: StudentDetails;
    onEditStudent: (studentId: string) => void;
    onChangeStatus: (enrolementId: string, newStatus: STUDENT_STATUS) => void;
}

export const StudentDetailsCard = ({ data, onEditStudent, onChangeStatus }: StudentDetailsCardProps) => {
    const { User, ClassRoom, status, isNewStudent, code } = data;
    const birthDate = formatDate(User.birthDate);


    return (
        <div className="space-y-6">
            {/* Informations personnelles */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl">
                            {User.fullname}
                        </CardTitle>
                        <GenderBadge withIcon gender={User.gender} />
                    </div>
                    <CardDescription>Détails personnels de l'élève.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <AnimatedFrameSwitcherProvider defaultActiveFrame="student-infos">
                        <AnimatedFrameSwitcherContent>
                            <AnimatedFrame name="student-infos">
                                <StudentPersonnalInfos
                                    birthDate={birthDate}
                                    birthPlace={User.birthPlace}
                                    username={User.username}
                                    userId={User.userId}
                                />
                            </AnimatedFrame>
                            <AnimatedFrame name="edit-student-infos">
                                <EditStudentInfos />
                            </AnimatedFrame>
                        </AnimatedFrameSwitcherContent>
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
                            <StudentStatusBadge status={status} />
                            <p className="text-sm text-muted-foreground">Statut de l'eleve</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <AnimatedFrameSwitcherProvider defaultActiveFrame="inscription-infos">
                        <AnimatedFrameSwitcherContent>
                            <AnimatedFrame name="inscription-infos">
                                <StudentInscriptionInfos
                                    identifier={ClassRoom.identifier}
                                    section={ClassRoom.section}
                                    status={status}
                                    code={code}
                                    isNewStudent={isNewStudent}
                                />
                            </AnimatedFrame>
                            <AnimatedFrame name="student-transfert">
                                <h1>Student tranfert</h1>
                            </AnimatedFrame>
                        </AnimatedFrameSwitcherContent>
                    </AnimatedFrameSwitcherProvider>
                </CardContent>
            </Card>

        </div>
    );
};