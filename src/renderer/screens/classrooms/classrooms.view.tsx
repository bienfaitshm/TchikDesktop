import { SECTION, SECTION_TRANSLATIONS } from "@/commons/constants/enum";
import { TClassroom, WithSchoolAndYearId } from "@/commons/types/services";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/renderer/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/renderer/components/ui/accordion"
import { useGetClassroomGroupedBySection } from "@/renderer/hooks/other";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { Shapes } from "lucide-react";
import { Link } from "react-router";



const ClassroomGridView: React.FC<{ classrooms: TClassroom[] }> = ({ classrooms }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 goupe">
            {classrooms.map((classroom) => (
                <Link
                    to={`/classrooms/${classroom.classId}/students`}
                    key={classroom.classId}
                >
                    <Card className="hover:bg-accent hover:border-primary transition-colors h-full">
                        <CardHeader className="flex flex-row items-center space-x-4 p-4">
                            <div className="bg-primary/20 rounded-full p-2">
                                <Shapes className="text-primary size-6" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">
                                    {classroom.shortIdentifier}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {classroom.identifier}
                                </CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

export const ClassroomSectionView: React.FC<
    WithSchoolAndYearId<{ section?: SECTION, groupe?: boolean }>
> = ({ schoolId, section, yearId, groupe }) => {
    const { data: classrooms = [] } = useGetClassrooms({
        schoolId,
        yearId,
        params: section ? { section } : {},
    });

    const classGrouped = useGetClassroomGroupedBySection(classrooms)
    if (!groupe) {
        return <ClassroomGridView classrooms={classrooms} />
    }

    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue="item-1"
        >
            {classGrouped.map(item => (
                <AccordionItem key={item.section} value={item.section}>
                    <AccordionTrigger>{SECTION_TRANSLATIONS[item.section]}</AccordionTrigger>
                    <AccordionContent>
                        <ClassroomGridView classrooms={item.data} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}