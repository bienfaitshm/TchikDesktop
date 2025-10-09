import React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/renderer/components/ui/sheet";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Suspense } from "@/renderer/libs/queries/suspense";

export type Student = any

type StudentDetailSheetState = {
    open: boolean;
    student?: Student;
};

type StudentDetailSheetProps = { children: (student: Student) => React.ReactNode }
type StudentDetailSheetRef = {
    showInfos(student: Student): void;
};

export const StudentDetailSheet = React.forwardRef<
    StudentDetailSheetRef,
    StudentDetailSheetProps
>(({ children }, ref) => {
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
    return (
        <Sheet modal={false} open={state.open} onOpenChange={handleOpenChange}>
            <SheetContent className="sm:max-w-xl p-0">
                <ScrollArea className="h-full">
                    <SheetHeader className="p-6 space-y-1">
                        <SheetTitle>Informations de l'élève</SheetTitle>
                        <SheetDescription className="text-xs">
                            Détails complets concernant l'élève.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="p-6 mb-10">
                        {state.student && (
                            <Suspense>
                                <>{children(state.student)}</>
                            </Suspense>
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
