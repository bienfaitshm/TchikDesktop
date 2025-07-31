import {
    Frame,
    Map,
    PieChart,
    Home
} from "lucide-react"
import { NavLink } from "react-router"

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
} from "@/renderer/components/ui/sidebar"
import { SidebarHead } from "./app-sidebar.head"
import { SidebarFoot } from "./app-sidebar.foot"

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    applications: [
        {
            name: "Acceuil",
            url: "/",
            icon: Home,
        },
        {
            name: "Inscriptions",
            url: "/inscriptions",
            icon: Frame,
        },
        {
            name: "Mise en place",
            url: "/mise-en-places",
            icon: Map,
        },
    ],

    school: [
        {
            name: "Eleves",
            url: "/students",
            icon: Frame,
        },
        {
            name: "Options",
            url: "/options",
            icon: PieChart,
        },
        {
            name: "Classes",
            url: "/classrooms",
            icon: Map,
        },
        {
            name: "Locals",
            url: "/locals",
            icon: Map,
        },
    ],

    others: [
        {
            name: "Annees scolaire",
            url: "/school-years",
            icon: Frame,
        },
    ],
}


export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarHead />
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.applications.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Ecoles</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.school.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Autres</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {data.others.map((item) => (
                                <SidebarMenuItem key={item.name}>
                                    <SidebarMenuButton asChild>
                                        <NavLink to={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarFoot user={data.user} />
            </SidebarFooter>
        </Sidebar>
    )
}