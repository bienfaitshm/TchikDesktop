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
import { useGetSchools } from "@/renderer/libs/queries/schools";
import { APP_ROUTES } from "@/renderer/constants";
import { MenuSelect, MenubarLinkAction, SubMenuSelect } from "./submenu-select";

export function SchoolSubMenus() {
  const { currentSchool } = useConfigStore();
  const { data: schools = [] } = useGetSchools();
  const configActions = useConfigActions();

  const handleSelectSchool = useCallback(
    (school: any) => {
      configActions.setCurrentSchool(school);
    },
    [configActions],
  );

  return (
    <SubMenuSelect
      title="Changer d’école"
      ariaLabel="Changer d’école"
      subTitle={currentSchool?.name}
    >
      <MenubarLabel className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Écoles disponibles
      </MenubarLabel>
      <MenubarSeparator />
      <MenuSelect
        items={schools}
        getItemProps={(school) => ({
          id: school.schoolId,
          label: school.name,
          subLabel: school.address,
        })}
        selectedValue={currentSchool?.schoolId}
        emptyMessage="Aucune école enregistrée"
        onSelectItem={handleSelectSchool}
      />
      <MenubarSeparator />
      <MenubarLinkAction to={APP_ROUTES.SCHOOLS}>
        Gérer les écoles
      </MenubarLinkAction>
    </SubMenuSelect>
  );
}
