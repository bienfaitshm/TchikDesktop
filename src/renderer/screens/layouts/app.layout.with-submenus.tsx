"use client";

import type { NavItem } from "@/renderer/components/app-sidebar/app-sidebar";
import { Outlet, useLocation, Link } from "react-router";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { SidebarContainer } from "@/renderer/components/sidebar-container";
import { PageShell } from "./page-shell.layout";
import { cn } from "@/renderer/utils";

interface SubNavigationLayoutProps {
  /** Liste des éléments de la sous-navigation */
  items?: NavItem[];
}

export const SubNavigationLayout = ({
  items = [],
}: SubNavigationLayoutProps) => {
  const { schoolId, yearId } = useSchoolContext();
  const { pathname } = useLocation();

  return (
    <div className="flex w-full flex-1 overflow-hidden bg-background">
      <SidebarContainer
        sidebarProps={{
          defaultSize: "15%",
        }}
        sidebar={
          <div className="flex h-full flex-col py-6">
            <nav className="flex-1 space-y-1 px-4">
              {items.map((item) => {
                const isActive = pathname === item.url;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={cn(
                      // Styles de base
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      // Focus a11y
                      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                      // Survol
                      "hover:bg-accent hover:text-accent-foreground",
                      // État Actif vs Inactif
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground transparent",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        }
      >
        {/* Contenu principal injecté via Outlet */}
        <PageShell maxWidth="xl">
          <main className="py-6">
            <Outlet context={{ schoolId, yearId }} />
          </main>
        </PageShell>
      </SidebarContainer>
    </div>
  );
};

/**
 * Skeleton agnostique pour le chargement des sous-menus
 */
export const SubNavigationSkeleton = () => (
  <div className="space-y-2 px-4 py-6">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="h-9 w-full animate-pulse rounded-md bg-muted/60"
      />
    ))}
  </div>
);
