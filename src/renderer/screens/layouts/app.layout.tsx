import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/renderer/components/ui/sidebar";
import {
  ApplicationSidebar,
  ApplicationSidebarProps,
} from "@/renderer/components/app-sidebar/app-sidebar";
import { Outlet } from "react-router";
import { Separator } from "@/renderer/components/ui/separator";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";

type AppLayoutProps = ApplicationSidebarProps;

export function AppLayout({ menus = [] }: AppLayoutProps) {
  const { schoolId, yearId } = useCurrentConfig();

  return (
    <SidebarProvider>
      <ApplicationSidebar menus={menus} />
      <SidebarInset className="flex flex-col h-svh overflow-hidden">
        <header className="bg-background/95 backdrop-blur-sm sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors" />
          <Separator orientation="vertical" className="mr-4" />
        </header>

        <main className="flex-1 min-h-0 w-full overflow-y-auto">
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
  );
}
