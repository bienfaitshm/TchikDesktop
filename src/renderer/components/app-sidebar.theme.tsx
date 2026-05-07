"use client";

import { Check, Sun, Moon, Laptop, ChevronsUpDown, LucideIcon } from "lucide-react";
import { useTheme, Theme } from "@/renderer/providers/theme";
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

const THEME_OPTIONS: Record<Theme, { label: string; icon: LucideIcon }> = {
    light: { label: "Clair", icon: Sun },
    dark: { label: "Sombre", icon: Moon },
    system: { label: "Système", icon: Laptop },
};

export const ThemeMenuItem = () => {
    const { setTheme, theme: currentTheme } = useTheme();
    const { isMobile } = useSidebar();

    const activeConfig = THEME_OPTIONS[currentTheme] || THEME_OPTIONS.system;
    const Icon = activeConfig.icon;

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg" // Changé de "sm" à "lg" pour matcher Settings/SchoolYear
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group"
                    >
                        {/* Conteneur icône uniformisé (size-8) */}
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-5" />
                        </div>
                        
                        {/* Structure de texte à deux niveaux pour la consistance */}
                        <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                            <span className="truncate font-semibold">
                                Apparence
                            </span>
                            <span className="truncate text-xs text-muted-foreground">
                                Mode {activeConfig.label.toLowerCase()}
                            </span>
                        </div>
                        
                        <ChevronsUpDown className="ml-auto size-4 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px]"
                    side={isMobile ? "bottom" : "right"}
                    align="start"
                    sideOffset={8}
                >
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Thème de l'interface
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        {(Object.entries(THEME_OPTIONS) as [Theme, typeof activeConfig][]).map(
                            ([value, { label, icon: ItemIcon }]) => {
                                const isSelected = currentTheme === value;
                                
                                return (
                                    <DropdownMenuItem
                                        key={value}
                                        onSelect={() => setTheme(value)}
                                        className="flex items-center gap-2 cursor-pointer"
                                    >
                                        <ItemIcon className="size-4 opacity-70" />
                                        <span className="flex-1">{label}</span>
                                        {isSelected && (
                                            <Check className="size-4 text-primary animate-in zoom-in-50 duration-200" />
                                        )}
                                    </DropdownMenuItem>
                                );
                            }
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};