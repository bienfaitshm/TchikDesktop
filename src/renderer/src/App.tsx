import { ThemeProvider } from "@/renderer/providers/theme";
import Router from "@/renderer/screens/router";
import QuerieProvider from "@/renderer/libs/queries/providers";
import { Toaster } from "@/renderer/components/ui/toaster";
import { SidebarProvider, SidebarTrigger } from "@/renderer/components/ui/sidebar"
import { AppSidebar } from "@/renderer/components/app-sidebar"

function App(): JSX.Element {
  return (
    <QuerieProvider>
      <ThemeProvider>
        <SidebarProvider>
          <AppSidebar />
          <main>
            <SidebarTrigger />
            <Router />
          </main>
        </SidebarProvider>

        <Toaster />
      </ThemeProvider>
    </QuerieProvider>
  );
}

export default App;
