import {
    Frame,
    Map,
    PieChart,
} from "lucide-react"

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
            name: "Inscriptions",
            url: "#",
            icon: Frame,
        },
        {
            name: "Payements",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Eleves",
            url: "#",
            icon: Map,
        },
    ],

    school: [
        {
            name: "Sections",
            url: "#",
            icon: Frame,
        },
        {
            name: "Options",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Classes",
            url: "#",
            icon: Map,
        },
    ],

    others: [
        {
            name: "Annees scolaire",
            url: "#",
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
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </a>
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
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </a>
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
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.name}</span>
                                        </a>
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