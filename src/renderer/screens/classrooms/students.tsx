import { useParams } from "react-router"
import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store";
import { DataTableMenu } from "@/renderer/components/button-menus";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { DataContentBody, DataContentHead, DataTable, DataTableColumnFilter, DataTableContent, DataTablePagination } from "@/renderer/components/tables";
import { enhanceColumnsWithMenu } from "@/renderer/components/tables/columns";
import { Button } from "@/renderer/components/ui/button";
import { StudentColumns } from "@/renderer/components/tables/columns.students"
import { Card, CardContent, CardHeader, CardTitle } from "@/renderer/components/ui/card";
import { Badge } from "@/renderer/components/ui/badge";
import { TypographyH4, TypographyP } from "@/renderer/components/ui/typography";

const tableMenus: DataTableMenu[] = [
    { key: "edit", label: "Modifier", icon: <Pencil className="size-3" /> },
    { key: "delete", label: "Supprimer", separator: true, icon: <Trash2 className="size-3" /> },
];

interface HeaderProps {
    roomName: string;
    totalStudents: number;
    activeStudents: number;
    droppedStudents: number;
    maleStudents: number;
    femaleStudents: number;
}

const Header: React.FC<HeaderProps> = ({
    roomName,
    totalStudents,
    activeStudents,
    droppedStudents,
    maleStudents,
    femaleStudents,
}) => {
    return (
        <header className="bg-background p-4 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
                {/* Section du titre */}
                <div className="flex-shrink-0">
                    <h1 className="text-3xl font-bold tracking-tight">{roomName}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Informations détaillées sur les élèves
                    </p>
                    <div className="mt-5">
                        <div className="flex flex-row gap-4 items-baseline">
                            <TypographyH4 className="text-sm font-medium">
                                Total
                            </TypographyH4>
                            <TypographyP className="text-md font-bold">{totalStudents}</TypographyP>
                        </div>
                        <div className="flex flex-row gap-4 items-baseline">
                            <TypographyH4 className="text-sm font-medium">
                                En cours
                            </TypographyH4>
                            <TypographyP className="text-md font-bold">{activeStudents}</TypographyP>
                            <Badge className="mt-1 bg-green-500 text-white hover:bg-green-600">
                                {((activeStudents / totalStudents) * 100).toFixed(0)}%
                            </Badge>
                        </div>
                        <div className="flex flex-row gap-4 items-baseline">
                            <TypographyH4 className="text-sm font-medium">
                                Abandonnés
                            </TypographyH4>
                            <TypographyP className="text-md font-bold text-destructive">{droppedStudents}</TypographyP>
                            <Badge className="mt-1 bg-red-500 text-white hover:bg-red-600">
                                {((droppedStudents / totalStudents) * 100).toFixed(0)}%
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Section des statistiques */}
                <div className="grid grid-cols-3 gap-4 w-full md:w-auto">

                    {/* Hommes */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{maleStudents}</div>
                        </CardContent>
                    </Card>

                    {/* Femmes */}
                    <Card>
                        <CardHeader className="space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-center">Encours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-center mb-2">{maleStudents}</div>
                            <div className="grid grid-cols-2 text-muted-foreground text-sm">
                                <small className="block">Homme:</small>
                                <small className="block"><b>{maleStudents}</b> soit 56%</small>
                            </div>
                            <div className="grid grid-cols-2 text-muted-foreground text-sm">
                                <small className="block">Femme:</small>
                                <small className="block"><b>{maleStudents}</b> soit 56%</small>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Autres */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Autres</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalStudents - activeStudents - droppedStudents}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </header>
    );
};


const roomData = {
    roomName: "Classe de Terminale A",
    totalStudents: 45,
    activeStudents: 38,
    droppedStudents: 4,
    maleStudents: 22,
    femaleStudents: 23,
};
const StudentList: React.FC = () => {
    const params = useParams()
    return (
        <div className="mx-auto container max-w-screen-lg mt-10">
            <Header
                roomName={roomData.roomName}
                totalStudents={roomData.totalStudents}
                activeStudents={roomData.activeStudents}
                droppedStudents={roomData.droppedStudents}
                maleStudents={roomData.maleStudents}
                femaleStudents={roomData.femaleStudents}
            />

            <b>{JSON.stringify(params, null, 4)}</b>
            <DataTable
                data={[]}
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
                        <Button size="sm">
                            <Plus className="size-4" />
                            <span>Ajouter un eleves</span>
                        </Button>
                    </div>
                </div>

                <DataTableContent>
                    <DataContentHead />
                    <DataContentBody />
                </DataTableContent>
                <DataTablePagination />
            </DataTable>
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
            <StudentList />
        </div>
    )
}