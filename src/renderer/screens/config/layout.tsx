import React from "react";
import { Outlet } from "react-router";
import { Cog } from "lucide-react";
import { TypographyH2 } from "@/renderer/components/ui/typography";
import { WindowTitleBar } from "@/renderer/components/win-title-bar";
import { SidebarProvider } from "@/renderer/components/ui/sidebar";

/**
 * Layout component providing a dedicated wrapper and title bar for configuration screens.
 * @returns A React functional component rendering the configuration template layout.
 */
export const ConfigurationLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="relative flex min-h-screen flex-col bg-background">
        <WindowTitleBar />

        <main className="flex flex-1 items-center justify-center p-4">
          <div className="container mx-auto max-w-md space-y-8 p-6">
            <header className="flex items-center gap-4 border-b border-border pb-4">
              <Cog className="size-10 animate-spin-slow text-muted-foreground" />
              <TypographyH2 className="mb-0 pb-0 text-foreground">
                Configuration Requise
              </TypographyH2>
            </header>

            <section className="py-4">
              <Outlet />
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
