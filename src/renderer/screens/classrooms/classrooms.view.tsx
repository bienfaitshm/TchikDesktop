import { SECTION } from "@/commons/constants/enum";
import { WithSchoolAndYearId } from "@/commons/types/services";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/renderer/components/ui/card";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { Shapes } from "lucide-react";
import { Link } from "react-router";

export const ClassroomSectionView: React.FC<
    WithSchoolAndYearId<{ section?: SECTION }>
> = ({ schoolId, section, yearId }) => {
    const { data: classrooms = [] } = useGetClassrooms({
        schoolId,
        yearId,
        params: section ? { section } : {},
    });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {classrooms.map((classroom) => (
                <Link
                    key={classroom.classId}
                    to={`/classrooms/${classroom.classId}/students`}
                    className="group"
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