import {
    Home,
    LayoutDashboard,
    GraduationCap,
    School,
    Clipboard,
    List,
    type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/renderer/components/ui/sidebar";
import { SidebarHead } from "./app-sidebar.head";
import { SidebarFoot } from "./app-sidebar.foot";
import { Suspense } from "../libs/queries/suspense";


interface NavItem {
    name: string;
    url: string;
    icon: LucideIcon;
}

interface NavSection {
    label: string;
    items: NavItem[];
}


const NAVIGATION_GROUPS: NavSection[] = [
    {
        label: "Application",
        items: [
            { name: "Accueil", url: "/", icon: Home },
            { name: "Inscriptions", url: "/inscriptions", icon: Clipboard },
            { name: "Mise en place", url: "/seating", icon: LayoutDashboard },
        ],
    },
    {
        label: "Écoles",
        items: [
            { name: "Classes", url: "/classrooms", icon: School },
            { name: "Locaux", url: "/locals", icon: List },
            { name: "Options", url: "/options", icon: GraduationCap },
        ],
    },
];


const NavGroup = ({ section }: { section: NavSection }) => (
    <SidebarGroup>
        <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
        <SidebarGroupContent>
            <SidebarMenu>
                {section.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild tooltip={item.name}>
                            <NavLink 
                                to={item.url}
                                className={({ isActive }) => isActive ? "bg-sidebar-accent" : ""}
                            >
                                <item.icon />
                                <span>{item.name}</span>
                            </NavLink>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroupContent>
    </SidebarGroup>
);


export function ApplicationSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarHead />
            </SidebarHeader>

            <SidebarContent>
                {NAVIGATION_GROUPS.map((section) => (
                    <NavGroup key={section.label} section={section} />
                ))}
            </SidebarContent>

            <SidebarFooter>
                <Suspense>
                    <SidebarFoot />
                </Suspense>
            </SidebarFooter>
        </Sidebar>
    );
}