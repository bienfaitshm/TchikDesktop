import type { TWithOption, TClassroom } from "@/commons/types/services";
import { useMemo } from "react";
import { SECTION_TRANSLATIONS } from "@/commons/constants/enum";
import { NavLink, useLocation } from "react-router";
import { groupBy, convertGroupedObjectToArray } from "@/commons/utils";
import { cn } from "@/renderer/utils";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/renderer/components/ui/accordion";
import { buttonVariants } from "@/renderer/components/ui/button";

interface ClassroomGroup {
    section: string;
    data: TWithOption<Required<TClassroom>>[];
}

type ClassroomSideListProps = {
    classrooms?: TWithOption<Required<TClassroom>>[];
};

export const ClassroomSideList = ({ classrooms = [] }: ClassroomSideListProps) => {
    const location = useLocation();

    const classGrouped = useMemo<ClassroomGroup[]>(() => {
        const groupedData = groupBy(classrooms, "section");
        return convertGroupedObjectToArray(groupedData);
    }, [classrooms]);

    return (
        <div className="flex-1 overflow-y-auto p-2">
            {classGrouped.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune classe disponible.</p>
            ) : (
                <Accordion type="multiple" defaultValue={classGrouped.map((group) => group.section)}>
                    {classGrouped.map((group) => (
                        <AccordionItem key={group.section} value={group.section} className="border-b-0">
                            <AccordionTrigger className="text-sm font-semibold text-muted-foreground hover:no-underline px-2 py-2">
                                {SECTION_TRANSLATIONS[group.section]}
                            </AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <div className="flex flex-col space-y-1">
                                    {group.data.map((classroom) => {
                                        const isActive = location.pathname === `/classrooms/${classroom.classId}`;
                                        return (
                                            <NavLink
                                                key={classroom.classId}
                                                to={`/classrooms/${classroom.classId}`}
                                                className={cn(
                                                    buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                                                    "justify-start text-sm font-normal py-2 px-2",
                                                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                                                )}
                                            >
                                                {classroom.identifier}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
};