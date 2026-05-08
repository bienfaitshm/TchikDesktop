"use client";

import { 
    Settings, 
    User, 
    Settings2, 
    Bell, 
    ChevronRight,
    LifeBuoy,
    Info,
    Code2
} from "lucide-react";
import { Link } from "react-router";

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


const SETTINGS_OPTIONS = [
    { label: "Mon compte", href: "/settings/account", icon: User },
    { label: "Paramètres généraux", href: "/settings", icon: Settings2 },
    { label: "Notifications", href: "/settings/notifications", icon: Bell },
    { label: "Aide & Support", href: "/settings/help", icon: LifeBuoy },
    { label: "À propos", href: "/settings/about", icon: Info },
    { label: "Mode développeur", href: "/settings/developer", icon: Code2 },
];

export const SidebarSettingsButton = () => {
    const { isMobile } = useSidebar();

    return (
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent group transition-all"
                        tooltip="Paramètres"
                    >
                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            <Settings className="size-5" />
                        </div>
                        
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">Paramètres</span>
                            <span className="truncate text-xs text-muted-foreground">
                                Configuration & profil
                            </span>
                        </div>

                        <ChevronRight className="ml-auto size-4 shrink-0 opacity-50 group-hover:translate-x-1 transition-all" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px]"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={8}
                >
                    <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Préférences système
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        {SETTINGS_OPTIONS.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                                <Link to={item.href} className="flex items-center gap-3 cursor-pointer py-2">
                                    <item.icon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    <span className="flex-1 text-sm">{item.label}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};