import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/renderer/components/ui/sidebar";
import { ApplicationSidebar } from "@/renderer/components/app-sidebar";
import { Outlet } from "react-router";
import { Separator } from "@/renderer/components/ui/separator";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";
// import { TaskBar } from "../components/task-bar";

export default function MainLayout() {
  const { schoolId, yearId } = useCurrentConfig();
  return (
    <div>
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
          <main className="h-[calc(100vh-64px)] w-full overflow-hidden">
            <Suspense
              fallback={
                <div className="flex justify-center items-center h-full">
                  <LoadingSpinner />
                </div>
              }
            >
              <Outlet context={{ schoolId, yearId }} />
            </Suspense>
          </main>
        </SidebarInset>
      </SidebarProvider>
      {/* <TaskBar /> */}
    </div>
  );
}
