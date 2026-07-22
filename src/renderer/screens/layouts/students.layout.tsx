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
import {
  PageContainer,
  PageHeader,
  PageHeaderTextContent,
  PageHeadTitle,
  PageHeadDescription,
  PageContent,
} from "@/renderer/containers/page-container";

interface ClassroomSideNavProps {
  schoolId: string;
}

/**
 * @component ClassroomSideNav
 * @description Nav latérale isolée pour optimiser les cycles de re-rendering de la liste.
 */
const ClassroomSideNav = React.memo(({ schoolId }: ClassroomSideNavProps) => {
  const { data: classrooms = [] } = useGetClassrooms({
    where: { classrooms: { schoolId: { $eq: schoolId } } },
  });

  return <ClassroomSidebar classrooms={classrooms} />;
});
ClassroomSideNav.displayName = "ClassroomSideNav";

/**
 * @component StudentLayout
 * @description Orchestrateur de la vue structurelle des élèves par classe.
 */
export const StudentLayout = () => {
  const { classroomId } = useParams<{ classroomId?: string }>();
  const { schoolId, yearId } = useSchoolContext();

  const { data: classroom, isLoading } = useGetClassroomById(classroomId ?? "");
  return (
    <div className="h-full w-full overflow-hidden bg-background">
      <SidebarContainer sidebar={<ClassroomSideNav schoolId={schoolId} />}>
        <PageContainer>
          <PageHeader className="mt-10">
            <PageHeaderTextContent>
              <PageHeadTitle>{classroom.identifier}</PageHeadTitle>
              <PageHeadDescription>
                Liste des élèves inscrits dans cette classe.
              </PageHeadDescription>
            </PageHeaderTextContent>
          </PageHeader>
          <PageContent>
            {!classroom && classroomId && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-[40vh] text-center p-6 border border-dashed rounded-xl border-border/60 bg-muted/5">
                <p className="text-sm font-medium text-muted-foreground">
                  Impossible d'afficher les élèves pour cette sélection.
                </p>
              </div>
            ) : (
              <Outlet context={{ schoolId, yearId, classroomId, classroom }} />
            )}
          </PageContent>
        </PageContainer>
      </SidebarContainer>
    </div>
  );
};

StudentLayout.displayName = "StudentLayout";
