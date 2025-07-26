"use client"

// import { ChevronsUpDown, } from "lucide-react"
import IconImage from "@/renderer/assets/icon.svg";


import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/renderer/components/ui/sidebar"

export function SidebarHead() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <img alt="logo" src={IconImage} height={49} />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">Tchik</span>
                        <span className="truncate text-xs">Ecole l'allegresse</span>
                    </div>
                    {/* <ChevronsUpDown className="ml-auto" /> */}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
