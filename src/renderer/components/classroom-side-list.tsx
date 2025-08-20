import type { TWithOption, TClassroom } from "@/commons/types/services";
import { useMemo } from "react";
import { SECTION_TRANSLATIONS } from "@/commons/constants/enum";
import { NavLink } from "react-router";
import { groupBy, convertGroupedObjectToArray } from "@/commons/utils";
import { cn } from "@/renderer/utils";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/renderer/components/ui/accordion";
import { buttonVariants } from "@/renderer/components/ui/button";
import { Frown } from "lucide-react";

/**
 * Interface pour un groupe de classes par section.
 */
interface ClassroomGroup {
    section: string;
    data: TWithOption<Required<TClassroom>>[];
}

/**
 * Propriétés pour le composant ClassroomSideList.
 */
type ClassroomSideListProps = {
    classrooms?: TWithOption<Required<TClassroom>>[];
};

/**
 * Composant de liste latérale affichant les classes regroupées par section.
 * Utilise l'Accordion de Shadcn UI pour une navigation structurée et interactive.
 */
export const ClassroomSideList = ({ classrooms = [] }: ClassroomSideListProps) => {
    const classGrouped = useMemo<ClassroomGroup[]>(() => {
        const groupedData = groupBy(classrooms, "section");
        return convertGroupedObjectToArray(groupedData);
    }, [classrooms]);

    return (
        <div className="flex-1">
            {classGrouped.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                    <Frown className="size-10 mb-3 text-gray-400" />
                    <p className="text-base font-medium">Aucune classe trouvée.</p>
                    <p className="text-sm mt-1">Vérifiez les configurations ou ajoutez de nouvelles classes.</p>
                </div>
            ) : (
                // Accordion pour afficher les classes regroupées
                <Accordion type="multiple" defaultValue={classGrouped.map((group) => group.section)} className="w-full">
                    {classGrouped.map((group) => (
                        <AccordionItem key={group.section} value={group.section} className="border-b-0">
                            <AccordionTrigger className="text-xs font-semibold text-muted-foreground/70 hover:no-underline px-3 py-2 data-[state=open]:text-muted-foreground">
                                {SECTION_TRANSLATIONS[group.section]}
                            </AccordionTrigger>
                            <AccordionContent className="pb-0">
                                <div className="flex flex-col space-y-1 pl-2">
                                    {group.data.map((classroom) => (
                                        <NavLink
                                            key={classroom.classId}
                                            to={`/classrooms/${classroom.classId}/students`}
                                            className={({ isActive }) =>
                                                cn(
                                                    buttonVariants({ variant: "ghost" }),
                                                    "justify-start text-sm font-normal py-2 px-3 rounded-md",
                                                    "hover:bg-accent hover:text-accent-foreground",
                                                    isActive
                                                        ? "bg-secondary text-secondary-foreground font-medium"
                                                        : "text-muted-foreground"
                                                )
                                            }
                                        >
                                            {classroom.identifier}
                                        </NavLink>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
};
