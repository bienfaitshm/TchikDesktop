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
import { Avatar, AvatarFallback, AvatarImage } from "@/renderer/components/ui/avatar";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/renderer/components/ui/sidebar";
import { ChevronsUpDown, Check, PlusCircle } from "lucide-react";

import IconImage from "@/renderer/assets/icon.svg";
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store";
import { useGetSchools } from "@/renderer/libs/queries/school";
import { Link } from "react-router";

/**
 * Composant d'en-tête de la barre latérale pour la sélection de l'école.
 * Affiche l'école actuellement sélectionnée et permet à l'utilisateur de la changer
 * via un menu déroulant, affichant la liste des écoles disponibles.
 */
export function SidebarHead() {
    const { isMobile } = useSidebar();
    const currentSchool = useApplicationConfigurationStore(store => store.currentSchool)
    const changeCurrentSchool = useApplicationConfigurationStore(store => store.setCurrentSchool)
    const { data: schools = [] } = useGetSchools();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group"
                        >
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <img alt="logo application" src={IconImage} height={32} width={32} />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">Tchik</span>
                                {currentSchool ? (
                                    <span className="truncate text-xs text-muted-foreground">
                                        {currentSchool.name}
                                    </span>
                                ) : (
                                    <span className="truncate text-xs text-muted-foreground italic">
                                        Aucune école sélectionnée
                                    </span>
                                )}
                            </div>
                            <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-lg shadow-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="start"
                        sideOffset={8}
                    >
                        <DropdownMenuLabel className="p-2 font-normal">
                            {currentSchool ? (
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        {currentSchool.logo && (
                                            <AvatarImage src={currentSchool.logo} alt={currentSchool.name} />
                                        )}
                                        <AvatarFallback className="rounded-lg">
                                            {currentSchool.name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-medium">{currentSchool.name}</span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            {currentSchool?.adress || "Adresse non spécifiée"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Avatar className="h-8 w-8 rounded-lg bg-accent">
                                        <AvatarFallback className="rounded-lg text-accent-foreground">?</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm italic">Aucune école sélectionnée</span>
                                </div>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                Changer d'école
                            </DropdownMenuLabel>
                            {schools.length > 0 ? (
                                schools.map((school) => (
                                    <DropdownMenuItem
                                        key={school.schoolId}
                                        onSelect={() => changeCurrentSchool(school)}
                                        className="flex items-center justify-between"
                                        disabled={currentSchool?.schoolId === school.schoolId}
                                    >
                                        {school.name}
                                        {currentSchool?.schoolId === school.schoolId && (
                                            <Check className="ml-2 size-4 text-primary" />
                                        )}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <DropdownMenuItem disabled className="text-muted-foreground italic">
                                    Aucune autre école disponible
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-primary text-xs" asChild>
                            <Link to={"/schools"}>
                                <PlusCircle className="mr-2 size-4" />
                                <span>Ajouter une nouvelle année scolaire</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
