import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/renderer/components/ui/sidebar";
import { ApplicationSidebar } from "@/renderer/components/app-sidebar/app-sidebar";
import { Outlet } from "react-router";
import { Separator } from "@/renderer/components/ui/separator";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { useCurrentConfig } from "@/renderer/libs/stores/app-store";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";

export function AppLayout() {
  const { schoolId, yearId } = useCurrentConfig();
  return (
    <SidebarProvider>
      <ApplicationSidebar />
      <SidebarInset>
        <header className="bg-background/95 backdrop-blur sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-4 transition-all">
          {/* Partie Gauche : Navigation */}
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4 bg-border"
          />

          {/* Optionnel : Tu peux glisser un titre de page ou un Breadcrumb ici */}
          {/* <span className="text-sm font-medium tracking-tight hidden sm:inline-block">
            Vue d'ensemble
          </span> */}

          {/* Partie Droite : Actions poussées grâce à ml-auto */}
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
  );
}
