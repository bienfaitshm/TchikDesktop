"use client";

import { useCallback } from "react";
import {
  MenubarLabel,
  MenubarSeparator,
} from "@/renderer/components/ui/menubar";

import {
  useConfigActions,
  useConfigStore,
} from "@/renderer/libs/stores/app-store";
import { useGetStudyYears } from "@/renderer/libs/queries/study-years";
import { formatDate } from "@/packages/times";
import { MenubarLinkAction, MenuSelect, SubMenuSelect } from "./submenu-select";
import { APP_ROUTES } from "@/renderer/constants";

export function YearSubMenus() {
  const { currentSchool, currentStudyYear } = useConfigStore();
  const configActions = useConfigActions();

  const { data: studyYears = [] } = useGetStudyYears({
    where: { schoolId: currentSchool?.schoolId! },
  });

  const handleSelectYear = useCallback(
    (year: any) => {
      configActions.setCurrentStudyYear(year);
    },
    [configActions],
  );

  return (
    <SubMenuSelect
      title="Changer l'année"
      ariaLabel="Changer l'année"
      subTitle={currentStudyYear?.yearName}
    >
      <MenubarLabel className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Années académiques
      </MenubarLabel>
      <MenubarSeparator />
      <MenuSelect
        items={studyYears}
        getItemProps={(year) => ({
          id: year.yearId,
          label: year.yearName,
          subLabel: `${formatDate(year.startDate)} - ${formatDate(year.endDate)}`,
        })}
        selectedValue={currentStudyYear?.yearId}
        emptyMessage="Aucune année enregistrée"
        onSelectItem={handleSelectYear}
      />
      <MenubarSeparator />
      <MenubarLinkAction to={APP_ROUTES.SCHOOL_YEARS}>
        <span>Gérer les années</span>
      </MenubarLinkAction>
    </SubMenuSelect>
  );
}
