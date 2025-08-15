import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/renderer/components/ui/card";
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

export type StudentDetails = {
    User: {
        fullname: string;
        gender: USER_GENDER;
        birthDate: string;
        birthPlace: string;
        userId: string;
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

interface StudentDetailsCardProps {
    data: StudentDetails;
    onEditStudent: (studentId: string) => void;
    onChangeStatus: (enrolementId: string, newStatus: STUDENT_STATUS) => void;
}

export const StudentDetailsCard = ({ data, onEditStudent, onChangeStatus }: StudentDetailsCardProps) => {
    const { User, ClassRoom, status, isNewStudent, code } = data;
    const birthDate = formatDate(User.birthDate);

    const availableStatus = Object.values(STUDENT_STATUS).filter(s => s !== status);

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
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Date de naissance</p>
                            <p className="font-medium">{birthDate}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Lieu de naissance</p>
                            <p className="font-medium">{User.birthPlace}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Identifiant Élève</p>
                            <p className="font-medium">{User.userId}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Nouvel élève</p>
                            <p className="font-medium">{isNewStudent ? 'Oui' : 'Non'}</p>
                        </div>
                    </div>
                    {/* Bouton d'action pour modifier les informations */}
                    <div className="mt-6 pt-4 border-t">
                        <Button
                            size="sm"
                            className="h-8"
                            onClick={() => onEditStudent(User.userId)}
                            variant="secondary"

                        >
                            <PencilIcon className="size-4 mr-2" />
                            Modifier les informations
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Détails de la classe et de l'inscription */}
            <Card>
                <CardHeader>
                    <CardTitle>Classe et Inscription</CardTitle>
                    <CardDescription>Informations sur la scolarité actuelle de l'élève.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Classe</p>
                            <p className="font-medium">{ClassRoom.identifier}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Section</p>
                            <p className="font-medium">{SECTION_TRANSLATIONS[ClassRoom.section]}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Code d'inscription</p>
                            <p className="font-medium">{code}</p>
                        </div>
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
                                            {availableStatus.map((s) => (
                                                <DropdownMenuItem
                                                    key={s}
                                                    onClick={() => onChangeStatus(User.userId, s)}
                                                >
                                                    {STUDENT_STATUS_TRANSLATIONS[s]}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};