"use client";

import { NavLink, useNavigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { useClassroomSidebar } from "@/renderer/components/classroom-sidebar.hooks";
import { ClassroomSidebarHeader } from "@/renderer/components/classroom-sidebar.header";
import { SidebarSectionList } from "@/renderer/components/sidebar-section-menus";
import {
  SidebarItem,
  SidebarItemMedia,
  SidebarItemContent,
  SidebarItemTitle,
} from "@/renderer/components/sidebar-menus";
import { APP_ROUTES } from "@/renderer/constants";
import type { Classroom } from "@/packages/@core/data-access/db/schemas";

interface ClassroomSidebarProps {
  classrooms: Classroom[];
}

export const ClassroomSidebar = ({ classrooms }: ClassroomSidebarProps) => {
  const navigate = useNavigate();
  const { classroomId } = useParams();

  const {
    currentSectionLabel,
    filteredGroups,
    handleClearSearch,
    searchTerm,
    selectedSection,
    setSearchTerm,
    setSelectedSection,
  } = useClassroomSidebar(classrooms);

  return (
    <SidebarSectionList
      sections={filteredGroups}
      className="border-none"
      listHeaderComponent={
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-md hover:bg-accent border border-border/40 shadow-xs"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ChevronLeft className="size-4 text-muted-foreground" />
            </Button>
            <h2 className="text-sm font-semibold tracking-tight truncate leading-none">
              Classes
            </h2>
          </div>

          <ClassroomSidebarHeader
            searchTerm={searchTerm}
            selectedSection={selectedSection}
            currentSectionLabel={currentSectionLabel}
            onSearchChange={setSearchTerm}
            onClearSearch={handleClearSearch}
            onSectionChange={setSelectedSection}
          />
        </div>
      }
      renderItem={(classroom) => {
        const isActive = classroom.classId === classroomId;

        return (
          <SidebarItem key={classroom.classId} isActive={isActive} asChild>
            <NavLink to={APP_ROUTES.CLASSROOMS.STUDENTS(classroom.classId)}>
              {/* Le point indicateur passe dans le Media */}
              <SidebarItemMedia className="justify-start size-3">
                <div className="size-1.5 rounded-full bg-current opacity-20 group-aria-[current=page]:opacity-100 transition-opacity" />
              </SidebarItemMedia>

              {/* Le texte est enveloppé proprement */}
              <SidebarItemContent>
                <SidebarItemTitle>{classroom.identifier}</SidebarItemTitle>
              </SidebarItemContent>
            </NavLink>
          </SidebarItem>
        );
      }}
    />
  );
};

ClassroomSidebar.displayName = "ClassroomSidebar";
