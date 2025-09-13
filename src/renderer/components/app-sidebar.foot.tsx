"use client"
import {
    SidebarMenu,

} from "@/renderer/components/ui/sidebar"
import { ThemeMenuItem } from "./app-sidebar.theme"
import { SidebarMenuItemSchoolYear } from "./app-sidebar.years"

export function SidebarFoot() {

    return (
        <SidebarMenu>
            <ThemeMenuItem />
            <SidebarMenuItemSchoolYear />
        </SidebarMenu>
    )
}
