import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/renderer/components/ui/sheet";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { TypographyH3 } from "@/renderer/components/ui/typography";
import { StudentDetailsCard } from "@/renderer/components/student-details-infos";

export type Student = any

type StudentDetailSheetState = {
    open: boolean;
    student?: Student;
};

type StudentDetailSheetProps = {
    schoolId: string;
    yearId?: string;
};

type StudentDetailSheetRef = {
    showInfos(student: Student): void;
};

export const StudentDetailSheet = React.forwardRef<
    StudentDetailSheetRef,
    StudentDetailSheetProps
>(({ schoolId, yearId }, ref) => {
    const [state, setState] = React.useState<StudentDetailSheetState>({
        open: false,
        student: undefined,
    });

    const handleCloseSheet = React.useCallback(
        () => setState({ open: false, student: undefined }),
        []
    );

    const handleOpenSheet = React.useCallback((student: Student) => {
        setState({ student, open: true });
    }, []);

    const handleOpenChange = React.useCallback(
        (open: boolean) => {
            if (!open) {
                handleCloseSheet();
            }
        },
        [handleCloseSheet]
    );

    React.useImperativeHandle(
        ref,
        () => ({
            showInfos: (student) => {
                handleOpenSheet(student);
            },
        }),
        [handleOpenSheet]
    );

    // Utiliser les props schoolId et yearId (exemple)
    console.log('School ID:', schoolId, 'Year ID:', yearId);

    // 4. Amélioration du rendu et du contenu
    return (
        <Sheet open={state.open} onOpenChange={handleOpenChange}>
            <SheetContent className="sm:max-w-xl p-0">
                <ScrollArea className="h-full">
                    <SheetHeader className="p-6">
                        <SheetTitle>Informations de l'élève</SheetTitle>
                        <SheetDescription>
                            Détails complets concernant l'élève.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="p-6 mb-10">
                        {state.student && (
                            <>

                                <StudentDetailsCard data={state.student} />

                            </>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
});

export function useStudentDetailSheet() {
    const sheetRef = React.useRef<StudentDetailSheetRef>(null);
    const showStudentInfos = React.useCallback((student: Student) => {
        sheetRef.current?.showInfos(student);
    }, []);
    return { sheetRef, showStudentInfos };
}