import { TypographyH2, TypographyH3, TypographyP, TypographySmall } from "@/renderer/components/ui/typography"
import { Shapes } from "lucide-react"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/renderer/components/ui/tabs"
import { useGetCurrentYearSchool } from "@/renderer/libs/stores/app-store"
import { useGetClassrooms } from "@/renderer/libs/queries/classroom"

import { Badge } from "@/renderer/components/ui/badge"
import { Link } from "react-router"
import { SECTION_ENUM } from "@/packages/@core/data-access/db/enum"
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options"


type CurrentYearSchoolProps<T extends {} = {}> = Required<any>



const ClassroomSection: React.FC<CurrentYearSchoolProps<{ section: SECTION_ENUM }>> = ({ schoolId, section, yearId }) => {
    const { data: classrooms = [] } = useGetClassrooms({ where: { section, schoolId, yearId } })
    console.log({ classrooms })
    return (
        <div className="grid grid-cols-3 gap-5 mt-5">
            {classrooms.map(classroom => (
                <Link key={classroom.classId} to={`/classrooms/${classroom.classId}`} className="rounded-xl cursor-pointer p-4 bg-accent-foreground/5 hover:bg-accent-foreground/10 transition-colors">
                    <div className="bg-primary rounded-full p-2 w-fit">
                        <Shapes className="text-white size-8" />
                    </div>
                    <TypographyH3 className="mb-0 text-lg">{classroom.shortIdentifier}</TypographyH3>
                    <TypographyP className="text-sm text-muted-foreground">{classroom.identifier}</TypographyP>
                </Link>
            ))}
        </div>
    )
}

const ClassroomGrid: React.FC<CurrentYearSchoolProps> = ({ schoolId, yearId }) => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-screen-lg space-y-10">
            <div>
                <Badge className="mb-2">Élèves</Badge>
                <TypographyH2 className="mb-2">Listes des classes disponibles</TypographyH2>
                <TypographySmall>
                    Total des élèves inscrits pour cette année est <b className="font-semibold">1000</b>{" "}
                </TypographySmall>
            </div>
            <div>
                <Tabs defaultValue={SECTION_ENUM.SECONDARY}>
                    <TabsList className="rounded-full mb-4">
                        {SECTION_OPTIONS.map(section => (
                            <TabsTrigger className="rounded-full" key={section.key} value={section.value}>{section.label}</TabsTrigger>
                        ))}
                    </TabsList>
                    {SECTION_OPTIONS.map(section => (
                        <TabsContent key={section.key} value={section.value}>
                            <ClassroomSection section={section.value} schoolId={schoolId} yearId={yearId} />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    )
}


const StudentScreen = () => {
    const { schoolId, yearId } = useGetCurrentYearSchool()
    if (!schoolId && !yearId) {
        return null;
    }
    return <ClassroomGrid schoolId={schoolId} yearId={yearId} />
}

export default StudentScreen