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
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { ClassroomNavItems } from "../containers/classroom-side";
import { useGetClassrooms } from "../libs/queries/classrooms";
import { APP_ROUTES } from "../constants";

export type ClassroomsLayoutProps = {};

export function ClassroomsLayout({}: ClassroomsLayoutProps) {
  const { schoolId, yearId } = useSchoolContext();

  return (
    <SidebarLayout className="h-full">
      {/* Panneau latéral de navigation secondaire */}
      <SidebarPanel fallback={<SubNavigationSkeleton />}>
        <Suspense fallback={<SubNavigationSkeleton />}>
          <ClassroomsSidebarContent schoolId={schoolId} />
        </Suspense>
      </SidebarPanel>

      {/* Poignée de redimensionnement avec gestionnaire de focus */}
      <SidebarHandle />

      {/* Zone de contenu principale */}
      <SidebarMain>
        <Suspense fallback={<SubNavContentFallback />}>
          <Outlet context={{ schoolId, yearId }} />
        </Suspense>
      </SidebarMain>
    </SidebarLayout>
  );
}

/**
 * Composant de sous-navigation isolé pour permettre l'accrochage
 * optimal du fallback Suspense lors du chargement des données.
 */
function ClassroomsSidebarContent({ schoolId }: { schoolId: string }) {
  const { data: classrooms = [] } = useGetClassrooms({
    where: { classrooms: { schoolId } },
  });

  return (
    <nav aria-label="Navigation des classes" className="h-full w-full">
      <ClassroomNavItems
        classrooms={classrooms}
        to={(classId) => APP_ROUTES.FIN.CLASSROOMS.DETAIL(classId)}
      />
    </nav>
  );
}
