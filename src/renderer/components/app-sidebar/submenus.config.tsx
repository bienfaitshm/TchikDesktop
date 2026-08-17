"use client";
import { School, CalendarCheck2 } from "lucide-react";
import { useCallback } from "react";
import {
  useConfigActions,
  useCurrentConfig,
} from "@/renderer/libs/stores/app-store";
import {
  SelectSubMenu,
  SelectSubMenuContent,
  SelectSubMenuItem,
  SelectSubMenuTrigger,
} from "./submenu-select";
import { useGetSchools } from "@/renderer/libs/queries/schools";
import { useGetStudyYears } from "@/renderer/libs/queries/study-years";

export function SchoolSubMenus() {
  const { schoolId } = useCurrentConfig();
  const { data: schools = [] } = useGetSchools();
  const configActions = useConfigActions();

  const handleSelectSchool = useCallback(
    (schoolId: string) => {
      const school = schools.find((school) => school.schoolId === schoolId);
      if (school) {
        configActions.setCurrentSchool(school);
      }
    },
    [configActions, schools],
  );

  return (
    <SelectSubMenu value={schoolId!} onValueChange={handleSelectSchool}>
      <SelectSubMenuTrigger icon={School}>Changer d’école</SelectSubMenuTrigger>
      <SelectSubMenuContent>
        {schools.map((school) => (
          <SelectSubMenuItem key={school.schoolId} value={school.schoolId}>
            {school.name}
          </SelectSubMenuItem>
        ))}
      </SelectSubMenuContent>
    </SelectSubMenu>
  );
}

export function YearSubMenus() {
  const { yearId } = useCurrentConfig();
  const configActions = useConfigActions();

  const { data: studyYears = [] } = useGetStudyYears();

  const handleSelectSchool = useCallback(
    (yearId: string) => {
      const school = studyYears.find((school) => school.yearId === yearId);
      if (school) {
        configActions.setCurrentStudyYear(school);
      }
    },
    [configActions, studyYears],
  );

  return (
    <SelectSubMenu value={yearId!} onValueChange={handleSelectSchool}>
      <SelectSubMenuTrigger icon={CalendarCheck2}>
        Changer l'année
      </SelectSubMenuTrigger>
      <SelectSubMenuContent>
        {studyYears.map((school) => (
          <SelectSubMenuItem key={school.yearId} value={school.yearId}>
            {school.yearName}
          </SelectSubMenuItem>
        ))}
      </SelectSubMenuContent>
    </SelectSubMenu>
  );
}
