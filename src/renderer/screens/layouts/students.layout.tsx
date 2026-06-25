"use client";

import * as React from "react";
import { Outlet, useParams } from "react-router";
import {
  useGetClassrooms,
  useGetClassroomById,
} from "@/renderer/libs/queries/classrooms";
import { useSchoolContext } from "@/renderer/hooks/app-config-router";
import { ClassroomSidebar } from "@/renderer/components/classroom-sidebar";
import { SidebarContainer } from "@/renderer/components/sidebar-container";
import { PageShell } from "./page-shell.layout";

interface ClassroomSideNavProps {
  schoolId: string;
  yearId: string;
}

/**
 * @component ClassroomSideNav
 * @description Nav latérale isolée pour optimiser les cycles de re-rendering de la liste.
 */
const ClassroomSideNav = React.memo(
  ({ schoolId, yearId }: ClassroomSideNavProps) => {
    const { data: classrooms = [] } = useGetClassrooms({
      where: { schoolId, yearId },
    });

    return <ClassroomSidebar classrooms={classrooms} />;
  },
);
ClassroomSideNav.displayName = "ClassroomSideNav";

/**
 * @component StudentLayout
 * @description Orchestrateur de la vue structurelle des élèves par classe.
 */
export const StudentLayout = () => {
  const { classroomId } = useParams<{ classroomId?: string }>();
  const { schoolId, yearId } = useSchoolContext();

  const { data: classroom, isLoading } = useGetClassroomById(classroomId ?? "");

  const renderHeader = () => {
    if (!classroomId) {
      return (
        <div className="flex h-14 items-center px-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground/70 animate-pulse">
            Sélectionnez une classe dans le menu latéral...
          </p>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="space-y-2 py-2 animate-pulse">
          <div className="h-6 w-24 rounded bg-muted" />
          <div className="h-4 w-48 rounded bg-muted" />
        </div>
      );
    }

    if (!classroom) {
      return (
        <div className="py-2">
          <h1 className="text-xl font-bold tracking-tight text-destructive">
            Aucune classe trouvée
          </h1>
          <p className="text-xs font-medium text-muted-foreground">
            L'identifiant spécifié est introuvable ou a été supprimé.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-1 py-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {classroom.identifier}
          </h1>
          <p className="text-xs font-medium text-muted-foreground">
            Liste des élèves inscrits dans cette classe.
          </p>
        </div>
        <div className="flex items-center gap-2 empty:hidden" />
      </div>
    );
  };

  return (
    <div className="h-full w-full overflow-hidden bg-background">
      <SidebarContainer
        sidebar={<ClassroomSideNav schoolId={schoolId} yearId={yearId} />}
      >
        <PageShell maxWidth="xl" header={renderHeader()}>
          {!classroom && classroomId && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-[40vh] text-center p-6 border border-dashed rounded-xl border-border/60 bg-muted/5">
              <p className="text-sm font-medium text-muted-foreground">
                Impossible d'afficher les élèves pour cette sélection.
              </p>
            </div>
          ) : (
            <Outlet context={{ schoolId, yearId, classroomId }} />
          )}
        </PageShell>
      </SidebarContainer>
    </div>
  );
};

StudentLayout.displayName = "StudentLayout";
