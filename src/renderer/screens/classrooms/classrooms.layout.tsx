import { TypographyH3 } from "@/renderer/components/ui/typography";
import { Tabs, TabsList, TabsTrigger } from "@/renderer/components/ui/tabs";
import { Outlet, NavLink, useParams } from "react-router";

import { SECTION, SECTION_TRANSLATIONS } from "@/commons/constants/enum";
import { getEnumKeyValueList } from "@/commons/utils";
import { withCurrentConfig } from "@/renderer/hooks/with-application-config";
import { WithSchoolAndYearId } from "@/commons/types/services";
import { ButtonNewClassroom } from "./classrooms.create";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";


const SECTIONS_LISTS = getEnumKeyValueList(SECTION, SECTION_TRANSLATIONS);


export const Layout: React.FC<WithSchoolAndYearId> = ({ schoolId, yearId }) => {
    const { section } = useParams<{ section: SECTION }>()
    return (
        <div className="h-[calc(100vh-64px)]">
            <ScrollArea className="h-full bg-background">
                <div className="container max-w-screen-lg space-y-8 py-8">
                    <TypographyH3>Les salles de classe</TypographyH3>
                    <Tabs defaultValue={section || "all"} className="w-full">
                        <div className="flex justify-between items-center">
                            <TabsList className="rounded-full">
                                <TabsTrigger className="rounded-full" value="all" asChild>
                                    <NavLink to={`/classrooms/`}>
                                        Tous
                                    </NavLink>
                                </TabsTrigger>
                                {SECTIONS_LISTS.map((section) => (
                                    <TabsTrigger className="rounded-full" key={section.key} value={section.value} asChild>
                                        <NavLink to={`/classrooms/${section.value}`}>
                                            {section.label}
                                        </NavLink>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <ButtonNewClassroom schoolId={schoolId} yearId={yearId} />

                        </div>
                    </Tabs>

                    {/* L'Outlet rend le contenu de la route enfant */}
                    <div>
                        <Outlet />
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
};


export const ClassroomLayout = withCurrentConfig(Layout)