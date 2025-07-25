import { SidebarProvider, SidebarTrigger } from "@/renderer/components/ui/sidebar"
import { AppSidebar } from "@/renderer/components/app-sidebar"
import { Outlet } from "react-router-dom"

export default function Layout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main>
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}