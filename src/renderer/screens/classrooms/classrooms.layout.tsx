import { TypographyH3 } from "@/renderer/components/ui/typography";
import { Tabs, TabsList, TabsTrigger } from "@/renderer/components/ui/tabs";
import { Outlet, NavLink } from "react-router";

import { SECTION, SECTION_TRANSLATIONS } from "@/commons/constants/enum";
import { getEnumKeyValueList } from "@/commons/utils";
import { Button } from "@/renderer/components/ui/button";
import { Plus } from "lucide-react";

const SECTIONS_LISTS = getEnumKeyValueList(SECTION, SECTION_TRANSLATIONS);

export const ClassroomLayout = () => {
    return (
        <div className="container max-w-screen-lg space-y-8 py-8">
            <TypographyH3>Les Salles de classe</TypographyH3>
            <Tabs defaultValue="all" className="w-full">
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
                    <Button className="rounded-full">
                        <Plus className="size-4 mr-1" />
                        <span>Ajouter une classe</span>
                    </Button>
                </div>
            </Tabs>

            {/* L'Outlet rend le contenu de la route enfant */}
            <div>
                <Outlet />
            </div>
        </div>
    );
};