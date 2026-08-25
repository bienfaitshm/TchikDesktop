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
import { ClassroomNavItems } from "@/renderer/containers/classroom-side";
import { useGetClassrooms } from "@/renderer/libs/queries/classrooms";

/**
 * Props for the ClassroomsLayout component.
 */
export interface ClassroomsLayoutProps {
  /** Function resolving the target navigation route for a given classroom ID. */
  navigateToDetail: (classId: string) => string;
}

/**
 * Interface defining internal props for the ClassroomsSidebarContent component.
 */
interface ClassroomsSidebarContentProps extends ClassroomsLayoutProps {
  /** Identifier of the target school context. */
  schoolId: string;
}

/**
 * Renders the main classrooms layout structure with a collapsible sidebar and outlet view.
 * @param props - Component options containing navigation handlers.
 * @returns The structured React layout element.
 */
export function ClassroomsLayout({ navigateToDetail }: ClassroomsLayoutProps) {
  const { schoolId, yearId } = useSchoolContext();

  return (
    <SidebarLayout className="h-full">
      <SidebarPanel fallback={<SubNavigationSkeleton />}>
        <Suspense fallback={<SubNavigationSkeleton />}>
          <ClassroomsSidebarContent
            schoolId={schoolId}
            navigateToDetail={navigateToDetail}
          />
        </Suspense>
      </SidebarPanel>

      <SidebarHandle />

      <SidebarMain>
        <Suspense fallback={<SubNavContentFallback />}>
          <Outlet context={{ schoolId, yearId }} />
        </Suspense>
      </SidebarMain>
    </SidebarLayout>
  );
}

/**
 * Sub-navigation content component responsible for retrieving and displaying classroom links.
 * @param props - Contains the active school ID and navigation callback.
 * @returns Rendered navigation list.
 */
function ClassroomsSidebarContent({
  schoolId,
  navigateToDetail,
}: ClassroomsSidebarContentProps) {
  const { data: classrooms = [] } = useGetClassrooms({
    where: { classrooms: { schoolId } },
  });

  return (
    <nav aria-label="Classrooms navigation" className="h-full w-full">
      <ClassroomNavItems classrooms={classrooms} to={navigateToDetail} />
    </nav>
  );
}
