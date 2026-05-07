"use client";

import { useMemo } from "react";
import { Link } from "react-router";
import { ChevronsUpDown, Check, PlusCircle, CalendarDays } from "lucide-react";

import { cn } from "@/renderer/utils";
import { formatDate } from "@/packages/times";
import { useConfigActions, useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { useGetStudyYears } from "@/renderer/libs/queries/school";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/renderer/components/ui/dropdown-menu";
import {
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/renderer/components/ui/sidebar";

export const SidebarMenuItemSchoolYear = () => {
    const { isMobile } = useSidebar();
    const configActions = useConfigActions();
    const { schoolId, year: currentYear } = useCurrentConfig();

    const { data: studyYears = [], isLoading } = useGetStudyYears({ 
        where: { schoolId: schoolId! },
    });

    const isDisabled = !schoolId || isLoading;
    
    const labelStatus = useMemo(() => {
        if (isLoading) return "Chargement...";
        if (!schoolId) return "Sélectionnez une école";
        return currentYear?.yearName || "Aucune année active";
    }, [isLoading, schoolId, currentYear]);

    if (!schoolId) return null;

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        disabled={isDisabled}
                        className="data-[state=open]:bg-sidebar-accent group"
                    >
                        <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                            <CalendarDays className={cn("size-5", isLoading && "animate-pulse")} />
                        </div>

                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">Année scolaire</span>
                            <span className="truncate text-xs text-muted-foreground">
                                {labelStatus}
                            </span>
                        </div>
                        
                        <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px]"
                    side={isMobile ? "bottom" : "right"}
                    align="start"
                    sideOffset={4}
                >
                    <HeaderSection currentYear={currentYear} />
                    
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            Choisir une période
                        </DropdownMenuLabel>
                        
                        {isLoading ? (
                            <div className="p-2 text-sm text-muted-foreground animate-pulse">
                                Recherche des sessions...
                            </div>
                        ) : studyYears.length > 0 ? (
                            studyYears.map((year) => (
                                <DropdownMenuItem
                                    key={year.yearId}
                                    onSelect={() => configActions.setCurrentStudyYear(year)}
                                    className="flex items-center justify-between cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span>{year.yearName}</span>
                                        <span className="text-[10px] text-muted-foreground">
                                            {formatDate(year.startDate)} - {formatDate(year.endDate)}
                                        </span>
                                    </div>
                                    {currentYear?.yearId === year.yearId && (
                                        <Check className="size-4 text-primary" />
                                    )}
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-muted-foreground italic">
                                Aucune année enregistrée
                            </div>
                        )}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                        <Link to="/school-years" className="cursor-pointer text-primary focus:text-primary">
                            <PlusCircle className="mr-2 size-4" />
                            <span className="font-medium">Gérer les années</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};

/**
 * Sous-composant pour alléger le menu principal
 */
const HeaderSection = ({ currentYear }: { currentYear: any }) => (
    <DropdownMenuLabel className="p-2 font-normal">
        <div className="flex items-center gap-3 px-1 py-1.5 text-left text-sm">
            <div className="grid flex-1 leading-tight">
                {currentYear ? (
                    <>
                        <span className="truncate font-semibold">{currentYear.yearName}</span>
                        <span className="truncate text-xs text-muted-foreground">
                            Session : {formatDate(currentYear.startDate)} au {formatDate(currentYear.endDate)}
                        </span>
                    </>
                ) : (
                    <span className="italic text-muted-foreground">Aucune sélectionnée</span>
                )}
            </div>
        </div>
    </DropdownMenuLabel>
);