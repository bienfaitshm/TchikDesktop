"use client";

import { useMemo } from "react";
import { UserPlus, Zap } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { useGetClassroomById } from "@/renderer/libs/queries/classroom";
import { Skeleton } from "@/renderer/components/ui/skeleton";
import {
    CreateEnrollmentDialog,
    QuickCreateEnrollmentDialog,
} from "@/renderer/dialog-actions/enrolement.dialog-actions";
import { Separator } from "@/renderer/components/ui/separator";
// import { Badge } from "@/renderer/components/ui/badge";
import { ButtonSheetStudentStat } from "@/renderer/components/sheets/students.stat";
import { ButtonDialogDocumentExport } from "@/renderer/dialog-actions/dialog-document-expoter-actions";



export const ClassroomHeader = ({ classId, schoolId, yearId, studentsCount = 0 }: { classId: string, schoolId: string, yearId: string, studentsCount?: number }) => {
    const { data: classroom, isLoading } = useGetClassroomById(classId);
    const defaultValues = useMemo(() => ({ schoolId, yearId, classroomId: classId }), [schoolId, yearId, classId]);

    if (isLoading) return <HeaderSkeleton />;

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold tracking-tight">{classroom?.identifier}</h1>
                        {/* <Badge variant="secondary" className="font-mono">
                            {studentsCount} Élèves
                        </Badge> */}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1 uppercase tracking-wider font-medium">
                        Liste des élèves inscrits dans cette classe.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <QuickCreateEnrollmentDialog schoolId={schoolId} yearId={yearId} defaultValues={defaultValues}>
                        <Button variant="ghost" size="sm" className="gap-2 hover:bg-background shadow-none">
                            <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                            <span>Ajout rapide d’élève</span>
                        </Button>
                    </QuickCreateEnrollmentDialog>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <CreateEnrollmentDialog schoolId={schoolId} yearId={yearId} defaultValues={defaultValues}>
                        <Button size="sm" className="gap-2 shadow-sm">
                            <UserPlus className="h-4 w-4" />
                            <span>Nouvelle Inscription</span>
                        </Button>
                    </CreateEnrollmentDialog>
                </div>
            </div>
            {/* Statistics & Export Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-1.5">
                <div className="md:col-span-2 flex items-center gap-4">
                    <ButtonSheetStudentStat students={[]} />
                    <ButtonDialogDocumentExport schoolId={schoolId} yearId={yearId} classId={classId} />
                </div>
            </div>
            <Separator />
        </div>
    );
};


const HeaderSkeleton = () => (
    <div className="space-y-4 py-4">
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-40" />
            </div>
        </div>
    </div>
);