
import { SidebarInset, SidebarProvider, SidebarTrigger, } from "@/renderer/components/ui/sidebar"
import { ApplicationSidebar } from "@/renderer/components/app-sidebar"
import { Outlet, Navigate } from "react-router"
import { useApplicationConfigurationStore } from "@/renderer/libs/stores/app-store"
import { Separator } from "@/renderer/components/ui/separator"
import { Suspense } from "@/renderer/libs/queries/suspense"

export default function Layout() {
    const isConfigured = useApplicationConfigurationStore(store => !!store.currentSchool && !!store.currentStudyYear)
    if (!isConfigured) {
        return <Navigate to="configuration" replace />
    }
    return (
        <SidebarProvider>
            <ApplicationSidebar />
            <SidebarInset>
                <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4 z-30">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                </header>
                <main className="w-full h-full flex-1 bg-background">
                    <Suspense>
                        <Outlet />
                    </Suspense>
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}