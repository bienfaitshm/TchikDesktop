"use client";

import { Outlet } from "react-router";
import {
  SubNavContentFallback,
  SidebarLayout,
  SidebarPanel,
  SubNavigationSkeleton,
  SidebarHandle,
  SidebarMain,
} from "@/components/sidebars";
import { Suspense } from "@/renderer/libs/queries/suspense";
import { LocalroomNavItems } from "@/renderer/containers/localroom-side";
import { useGetSessionRoomsStatus } from "@/renderer/libs/queries/seatings";

export type LayoutProps = {
  navigateTo(id: string): string;
  sessionId: string;
  schoolId: string;
};

export function LocalRoomsLayout({
  navigateTo,
  sessionId,
  schoolId,
}: React.PropsWithChildren<LayoutProps>) {
  return (
    <SidebarLayout className="h-full">
      {/* Panneau latéral de navigation secondaire */}
      <SidebarPanel fallback={<SubNavigationSkeleton />}>
        <Suspense fallback={<SubNavigationSkeleton />}>
          <SidebarContent
            sessionId={sessionId}
            schoolId={schoolId}
            navigateTo={navigateTo}
          />
        </Suspense>
      </SidebarPanel>

      {/* Poignée de redimensionnement avec gestionnaire de focus */}
      <SidebarHandle />

      {/* Zone de contenu principale */}
      <SidebarMain>
        <Suspense fallback={<SubNavContentFallback />}>
          <Outlet />
        </Suspense>
      </SidebarMain>
    </SidebarLayout>
  );
}

/**
 * Composant de sous-navigation isolé pour permettre l'accrochage
 * optimal du fallback Suspense lors du chargement des données.
 */
function SidebarContent({ sessionId, navigateTo }: LayoutProps) {
  const { data: localrooms = [] } = useGetSessionRoomsStatus(sessionId!);
  console.log("localrooms", localrooms);
  return (
    <nav aria-label="Navigation des classes" className="h-full w-full">
      <LocalroomNavItems localrooms={localrooms} to={navigateTo} />
    </nav>
  );
}
