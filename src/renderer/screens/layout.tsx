
import { SidebarProvider, SidebarTrigger, } from "@/renderer/components/ui/sidebar"
import { ApplicationSidebar } from "@/renderer/components/app-sidebar"
import { Outlet, Navigate } from "react-router"
import { useAppStore } from "@/renderer/libs/stores/app-store"

export default function Layout() {
    const isConfigured = useAppStore(store => !!store.currentSchool && !!store.currentYearSchool)
    if (!isConfigured) {
        return <Navigate to="config" replace />
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