"use client"

import {
    SidebarMenu,
    SidebarSeparator
} from "@/renderer/components/ui/sidebar"
import { ThemeMenuItem } from "./app-sidebar.theme"
import { SidebarMenuItemSchoolYear } from "./app-sidebar.years"
import { SidebarSettingsButton } from "./app-sidebar.settings";

export function SidebarFoot() {
    return (
        <SidebarMenu>
            <SidebarMenuItemSchoolYear />

            <div className="my-1 px-2">
                <SidebarSeparator />
            </div>

            <ThemeMenuItem />

            <SidebarSettingsButton />
        </SidebarMenu>
    )
}