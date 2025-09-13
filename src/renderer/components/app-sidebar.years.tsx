"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/renderer/components/ui/avatar";
import {
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/renderer/components/ui/sidebar";
import { ChevronsUpDown, Check, PlusCircle, CalendarDays } from "lucide-react";
import { cn } from "@/renderer/utils";

import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { useGetStudyYears } from "@/renderer/libs/queries/school";
import { formatDate } from "@/commons/libs/times";
import { Link } from "react-router";

/**
 * Composant de menu latéral pour la sélection de l'année scolaire.
 * Permet à l'utilisateur de voir et de changer l'année scolaire active pour l'école courante.
 * Il affiche également un message si aucune école n'est sélectionnée.
 */
export const SidebarMenuItemSchoolYear = () => {
    const { isMobile } = useSidebar();

    const currentSchoolId = useApplicationConfigurationStore(
        (store) => store.currentSchool?.schoolId as string
    );
    const currentStudyYear =
        useApplicationConfigurationStore((store) => store.currentStudyYear);
    const setCurrentStudyYear =
        useApplicationConfigurationStore((store) => store.setCurrentStudyYear);



    const { data: studyYears = [], isLoading } = useGetStudyYears(currentSchoolId);

    const isDisabled = !currentSchoolId || isLoading;

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                {/* Le bouton qui déclenche l'ouverture du menu déroulant */}
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className={cn(
                            "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group",
                            isDisabled && "opacity-60 cursor-not-allowed"
                        )}
                        disabled={isDisabled}
                    >
                        {/* Icône de l'application ou de l'année scolaire */}
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                            <CalendarDays className="size-5" /> {/* Icône représentant l'année scolaire */}
                        </div>
                        {/* Informations sur l'année scolaire actuelle */}
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">Année scolaire</span>{" "}
                            {/* Libellé fixe */}
                            {currentStudyYear ? (
                                <span className="truncate text-xs text-muted-foreground">
                                    {currentStudyYear.yearName}
                                </span>
                            ) : (currentSchoolId && !isLoading) ? (
                                <span className="truncate text-xs text-muted-foreground italic">
                                    Aucune année sélectionnée
                                </span>
                            ) : (
                                <span className="truncate text-xs text-muted-foreground italic">
                                    Sélectionnez une école...
                                </span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                {/* Contenu du menu déroulant */}
                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-lg shadow-lg"
                    side={isMobile ? "bottom" : "right"}
                    align="start"
                    sideOffset={8}
                >
                    {/* Label affichant les détails de l'année scolaire actuellement sélectionnée */}
                    <DropdownMenuLabel className="p-2 font-normal">
                        {currentStudyYear ? (
                            <div className="flex items-center gap-2">
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {currentStudyYear.yearName}
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        {formatDate(currentStudyYear.startDate)} -{" "}
                                        {formatDate(currentStudyYear.endDate)}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Avatar className="h-8 w-8 rounded-lg bg-accent">
                                    <AvatarFallback className="rounded-lg text-accent-foreground">
                                        <CalendarDays className="size-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm italic">Aucune année sélectionnée</span>
                            </div>
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {/* Groupe d'éléments pour la sélection d'année scolaire */}
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            Changer d'année scolaire
                        </DropdownMenuLabel>
                        {isLoading ? (
                            <DropdownMenuItem disabled className="text-muted-foreground italic">
                                Chargement des années...
                            </DropdownMenuItem>
                        ) : studyYears.length > 0 ? (
                            studyYears.map((year) => (
                                <DropdownMenuItem
                                    key={year.yearId}
                                    onSelect={() => setCurrentStudyYear(year)}
                                    className="flex items-center justify-between"
                                    disabled={currentStudyYear?.yearId === year.yearId}
                                >
                                    {year.yearName}
                                    {currentStudyYear?.yearId === year.yearId && (
                                        <Check className="ml-2 size-4 text-primary" />
                                    )}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem disabled className="text-muted-foreground italic">
                                Aucune année disponible pour cette école
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem className="text-primary text-xs" asChild>
                        <Link to={"/school-years"}>
                            <PlusCircle className="mr-2 size-4" />
                            <span>Ajouter une nouvelle année scolaire</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};

