"use client";

import * as React from "react";
import { Outlet, useParams } from "react-router";
import { useGetClassrooms } from "@/renderer/libs/queries/classroom";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { ClassroomSidebar } from "@/renderer/components/classroom-sidebar";
import { PageShell } from "./page-shell.layout";
import { ClassroomHeader } from "@/renderer/components/classroom-student-header";
import { SidebarContainer } from "@/renderer/components/sidebar-container";

/**
 * Gestionnaire de données pour la liste latérale.
 * Isolé pour permettre une gestion fine du cache et du suspense local.
 */
const ClassroomSideNav = React.memo(
  ({ schoolId, yearId }: { schoolId: string; yearId: string }) => {
    const { data: classrooms = [] } = useGetClassrooms({
      where: { schoolId, yearId },
    });

    return <ClassroomSidebar classrooms={classrooms} />;
  },
);
ClassroomSideNav.displayName = "ClassroomSideNav";

/**
 * StudentLayout - Orchestrateur de la vue "Élèves par classe"
 */
export const StudentLayout = () => {
  const { classroomId } = useParams();
  const { schoolId, yearId } = useSchoolContext();

  const sidebarContent = React.useMemo(
    () => <ClassroomSideNav schoolId={schoolId} yearId={yearId} />,
    [schoolId, yearId],
  );

  return (
    <div className="h-full w-full overflow-hidden bg-background">
      <SidebarContainer
        direction="horizontal"
        sidebar={sidebarContent}
        sidebarProps={{
          defaultSize: 20,
          minSize: 15,
        }}
      >
        <PageShell
          maxWidth="2xl"
          header={
            classroomId ? (
              <ClassroomHeader
                schoolId={schoolId}
                yearId={yearId}
                classId={classroomId}
              />
            ) : (
              <div className="h-14 border-b flex items-center px-6">
                <span className="text-xs text-muted-foreground animate-pulse">
                  Sélectionnez une classe...
                </span>
              </div>
            )
          }
        >
          <Outlet context={{ schoolId, yearId, classroomId }} />
        </PageShell>
      </SidebarContainer>
    </div>
  );
};

StudentLayout.displayName = "StudentLayout";
