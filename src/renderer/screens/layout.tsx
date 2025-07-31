import { SidebarProvider, SidebarTrigger, } from "@/renderer/components/ui/sidebar"
import { ApplicationSidebar } from "@/renderer/components/app-sidebar"
import { Outlet } from "react-router"

export default function Layout() {
    return (
        <SidebarProvider>
            <ApplicationSidebar />
            <main className="w-full h-full flex-1">
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    )
}