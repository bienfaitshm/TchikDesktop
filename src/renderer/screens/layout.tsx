
import { SidebarProvider, SidebarTrigger, } from "@/renderer/components/ui/sidebar"
import { ApplicationSidebar } from "@/renderer/components/app-sidebar"
import { Outlet, Navigate } from "react-router"
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store"

export default function Layout() {
    const isConfigured = useApplicationConfigurationStore(store => !!store.currentSchool && !!store.currentStudyYear)
    if (!isConfigured) {
        return <Navigate to="configuration" replace />
    }
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