import React from "react";
import { useParams } from "react-router"
import { DataTableMenu } from "@/renderer/components/button-menus";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/renderer/components/ui/accordion"
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataContentBody, DataContentHead, DataTable, DataTableColumnFilter, DataTableContent, DataTablePagination } from "@/renderer/components/tables";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import { Button } from "@/renderer/components/ui/button";
import { StudentColumns } from "@/renderer/components/tables/columns.students"
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { TypographyH2, TypographySmall } from "@/renderer/components/ui/typography";
import { useGetEnrollments } from "@/renderer/libs/queries/enrolement";
import { TEnrolement, TUser, TWithUser, WithSchoolAndYearId } from "@/commons/types/services";
import { useGetClassroom } from "@/renderer/libs/queries/classroom";
import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store";
import { STUDENT_STATUS, USER_GENDER } from "@/commons/constants/enum";
import { cn } from "@/renderer/utils";
import { QuickEnrollmentDialogForm } from "./students.dialog-form";
import { useQueryClient } from "@tanstack/react-query";
import { StudentDetailSheet, useStudentDetailSheet } from "./students.detail-sheet";

const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];


const InformationCard: React.FC<{ title: string, students?: TUser[], variant?: "DESTRUCTIVE" | "DEFAULT" }> = ({ title, variant = "DEFAULT", students = [] }) => {
    const totalStudents = students.length
    const { femaleStudents, maleStudents } = React.useMemo(() => ({
        maleStudents: students.filter(student => student.gender === USER_GENDER.MALE).length,
        femaleStudents: students.filter(student => student.gender !== USER_GENDER.MALE).length
    }), [students])

    return (
        <Card>
            <CardHeader className="space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-center">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={cn("text-2xl font-bold text-center mb-2", variant !== "DEFAULT" && "text-destructive")}>{totalStudents}</div>
                <div className="grid grid-cols-2 gap-5 text-muted-foreground text-sm">
                    <div className="flex flex-col gap-2 justify-center items-center">
                        <TypographySmall className="text-xs">Homme</TypographySmall>
                        <TypographySmall className={cn(variant !== "DEFAULT" && "text-destructive-foreground")}>{maleStudents}</TypographySmall>
                        <TypographySmall className={cn("block text-xs", variant !== "DEFAULT" && "text-destructive")}>Soit {totalStudents > 0 ? ((maleStudents / totalStudents) * 100).toFixed(0) : totalStudents} %</TypographySmall>
                    </div>
                    <div className="flex flex-col gap-2 justify-center items-center">
                        <TypographySmall className="text-xs">Femme</TypographySmall>
                        <TypographySmall>{femaleStudents}</TypographySmall>
                        <TypographySmall className="block text-xs">Soit {totalStudents > 0 ? ((femaleStudents / totalStudents) * 100).toFixed(0) : totalStudents} %</TypographySmall>
                    </div>
                </div>
            </CardContent>
        </Card>

    )
}
interface HeaderProps {
    roomName: string;
    students?: TWithUser<TEnrolement>[]
}

const Header: React.FC<HeaderProps> = ({
    roomName,
    students = []
}) => {

    const totalStudents = React.useMemo(() => students.map(enrol => enrol.User), [students])
    const actifStudents = React.useMemo(() => students.filter(st => st.status === STUDENT_STATUS.EN_COURS).map(enrol => enrol.User), [students])
    const dropStudents = React.useMemo(() => students.filter(st => st.status !== STUDENT_STATUS.EN_COURS).map(enrol => enrol.User), [students])
    return (
        <header className="bg-background p-4 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
                {/* Section du titre */}
                <div className="flex-shrink-0 w-full">
                    <TypographyH2 className="uppercase font-bold mb-0">{roomName}</TypographyH2>
                    <Accordion className="w-full" type="single" collapsible >
                        <AccordionItem className="border-b-0" value="item-1">
                            <AccordionTrigger className="text-sm text-muted-foreground mt-1 justify-start items-center gap-2">Informations détaillées sur les élèves</AccordionTrigger>
                            <AccordionContent>
                                <div className="grid grid-cols-3 gap-2">
                                    <InformationCard title="Total" students={totalStudents} />
                                    <InformationCard title="Actifs" students={actifStudents} />
                                    <InformationCard title="Abandonnees" variant="DESTRUCTIVE" students={dropStudents} />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </header>
    );
};




const RoomHeader: React.FC<Pick<HeaderProps, "students"> & { classId: string, }> = ({ classId, students }) => {
    const { data: classroom } = useGetClassroom(classId)
    return (
        <Header
            roomName={classroom.identifier}
            students={students}
        />
    )
}

const StudentList: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const { classroomId } = useParams<{ classroomId: string }>()
    const queryClient = useQueryClient()
    const params = React.useMemo(() => ({ schoolId, yearId, params: { classroomId } }), [schoolId, yearId, classroomId])
    const { sheetRef, showStudentInfos } = useStudentDetailSheet()

    const { data: students = [] } = useGetEnrollments(params)

    const onValidateData = React.useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["GET_ENROLEMENTS", params] })
    }, [params])
    return (
        <div className="mx-auto container max-w-screen-lg mt-10">
            <RoomHeader classId={classroomId as string} students={students} />
            <DataTable
                data={students}
                columns={enhanceColumnsWithMenu({
                    onPressMenu: () => console.log(),
                    columns: StudentColumns,
                    menus: tableMenus,
                })}
                keyExtractor={(student: any) => `${student.enrolementId}`}
            >
                <div className="flex items-center justify-end my-5">
                    <div className="flex items-center gap-5">
                        <DataTableColumnFilter />
                        <QuickEnrollmentDialogForm
                            classId={classroomId as string}
                            schoolId={schoolId}
                            yearId={yearId}
                            onValidateData={onValidateData}
                        >

                            <Button size="sm">
                                <Plus className="size-4" />
                                <span>Ajouter un eleves</span>
                            </Button>
                        </QuickEnrollmentDialogForm>
                    </div>
                </div>

                <DataTableContent>
                    <DataContentHead />
                    <DataContentBody onClick={(row) => {
                        showStudentInfos(row.original)
                        console.log(row.original)
                    }} />
                </DataTableContent>
                <DataTablePagination />
            </DataTable>
            <StudentDetailSheet ref={sheetRef} schoolId={schoolId} yearId={yearId} />
        </div>
    )
}

export function ClassroomStudentsPage() {
    const { schoolId, yearId } = useGetCurrentYearSchool()
    if (!schoolId && !yearId) {
        return null;
    }
    return (
        <div>
            <StudentList schoolId={schoolId} yearId={yearId} />
        </div>
    )
}