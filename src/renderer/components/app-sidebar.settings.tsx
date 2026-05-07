"use client";

import { 
    Settings, 
    User, 
    ShieldCheck, 
    Bell, 
    LogOut, 
    ChevronRight,
    CreditCard
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

/**
 * Configuration des entrées de paramètres
 * Permet de modifier le menu sans toucher à la structure JSX
 */
const SETTINGS_OPTIONS = [
    { label: "Mon Profil", href: "/settings/profile", icon: User },
    { label: "Sécurité", href: "/settings/security", icon: ShieldCheck },
    { label: "Notifications", href: "/settings/notifications", icon: Bell },
    { label: "Facturation", href: "/settings/billing", icon: CreditCard },
];

export const SidebarSettingsButton = () => {
    const { isMobile } = useSidebar();

    // Fonction de déconnexion (à adapter selon ton auth store)
    const handleLogout = () => {
        console.log("Logging out...");
    };

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
                                Gestion du compte
                            </span>
                        </div>

                        <ChevronRight className="ml-auto size-4 shrink-0 opacity-50 group-hover:translate-x-0.5 transition-all" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-[220px]"
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={8}
                >
                    <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Préférences
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        {SETTINGS_OPTIONS.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                                <Link to={item.href} className="flex items-center gap-2 cursor-pointer">
                                    <item.icon className="size-4 opacity-70" />
                                    <span className="flex-1">{item.label}</span>
                                </Link>
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem 
                        onSelect={handleLogout}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                    >
                        <LogOut className="mr-2 size-4" />
                        <span className="font-medium">Déconnexion</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};