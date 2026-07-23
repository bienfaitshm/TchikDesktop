"use client";

import type { NavItem } from "@/renderer/components/app-sidebar/app-sidebar";
import { Outlet, useLocation, Link } from "react-router";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { SidebarContainer } from "@/renderer/components/sidebar-container";
import { PageShell } from "./page-shell.layout";
import { cn } from "@/renderer/utils";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LoadingSpinner } from "@/renderer/components/loaders/loading-spinner";

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
    <SidebarContainer
      sidebarProps={{
        defaultSize: "17%",
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
      <PageShell maxWidth="2xl">
        <Suspense
          fallback={
            <div className="flex flex-1 w-full justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          }
        >
          <main className="py-6 flex-1 h-full w-full">
            <Outlet context={{ schoolId, yearId }} />
          </main>
        </Suspense>
      </PageShell>
    </SidebarContainer>
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
