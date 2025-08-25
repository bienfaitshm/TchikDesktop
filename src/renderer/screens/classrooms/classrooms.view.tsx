import { SECTION, SECTION_TRANSLATIONS } from "@/commons/constants/enum";
import { TClassroom, TWithOption } from "@/commons/types/services";
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
} from "@/renderer/components/ui/accordion";
import { useGetClassroomGroupedBySection } from "@/renderer/hooks/other";
import { CircleFadingPlus, Shapes } from "lucide-react";
import { Link } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "@/renderer/components/ui/alert";



const ClassroomCardGrid: React.FC<{ classrooms: TClassroom[] }> = ({ classrooms }) => {
    return (

        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
    );
};



export const ClassroomListOrGroup: React.FC<{ isGroupedView?: boolean, classrooms: TWithOption<TClassroom>[] }> = ({ isGroupedView, classrooms }) => {

    const groupedClassrooms = useGetClassroomGroupedBySection(classrooms);


    if (classrooms.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center text-center">
                <CircleFadingPlus className="size-12 text-primary/70 mb-4" />
                <Alert className="max-w-md">
                    <AlertTitle className="text-xl font-bold">Aucune classe trouvée</AlertTitle>
                    <AlertDescription>
                        Il semble qu'aucune classe n'ait été enregistrée pour l'instant. Commencez par créer une nouvelle classe.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (!isGroupedView) {
        return <ClassroomCardGrid classrooms={classrooms} />;
    }

    const defaultValue = groupedClassrooms[0]?.section || SECTION.SECONDARY

    return (
        <Accordion
            type="single"
            collapsible
            className="w-full"
            defaultValue={defaultValue}
        >
            {groupedClassrooms.map((item) => (
                <AccordionItem key={item.section} value={item.section}>
                    <AccordionTrigger>{SECTION_TRANSLATIONS[item.section]}</AccordionTrigger>
                    <AccordionContent>
                        <ClassroomCardGrid classrooms={item.data} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};

// 0975929597