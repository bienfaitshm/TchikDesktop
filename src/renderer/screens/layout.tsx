import { SidebarProvider, SidebarTrigger, } from "@/renderer/components/ui/sidebar"
import { AppSidebar } from "@/renderer/components/app-sidebar"
import { Outlet } from "react-router-dom"

export default function Layout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full h-full flex-1">
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}