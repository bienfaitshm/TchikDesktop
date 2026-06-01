"use client";
import { NavLink, useNavigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/renderer/components/ui/button";
import { useClassroomSidebar } from "@/renderer/components/classroom-sidebar.hooks";
import { ClassroomSidebarHeader } from "@/renderer/components/classroom-sidebar.header";
import { SidebarSectionList } from "@/renderer/components/sidebar-section-menus";
import { SidebarItem } from "@/renderer/components/sidebar-menus";
import type { TClassroom } from "@/packages/@core/data-access/db/schemas/types";

interface ClassroomSidebarProps {
  classrooms: TClassroom[];
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
      renderItem={(classroom) => (
        <SidebarItem
          isActive={classroom.classId === classroomId}
          key={classroom.classId}
          asChild
        >
          <NavLink to={`/classrooms/${classroom.classId}/students`}>
            <div className="size-1.5 shrink-0 rounded-full bg-current opacity-20" />
            <span className="truncate">{classroom.identifier}</span>
          </NavLink>
        </SidebarItem>
      )}
    />
  );
};

ClassroomSidebar.displayName = "ClassroomSidebar";
