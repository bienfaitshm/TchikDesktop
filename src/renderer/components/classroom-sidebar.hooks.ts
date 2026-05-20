"use client";

import * as React from "react";
import { SECTION_OPTIONS } from "@/packages/@core/data-access/db/options";
import type { TClassroom } from "@/packages/@core/data-access/db/schemas/types";
import { convertGroupedObjectToArray, groupBy } from "@/renderer/utils";
import type { Section } from "@/renderer/components/sidebar-section-menus";

interface ClassroomSidebar<TData> {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedSection: string;
  setSelectedSection: React.Dispatch<React.SetStateAction<string>>;
  currentSectionLabel: string;
  filteredGroups: Section<TData>[];
  handleClearSearch: () => void;
}

export function useClassroomSidebar<TData extends TClassroom>(
  data: TData[],
): ClassroomSidebar<TData> {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSection, setSelectedSection] = React.useState("all");

  const deferredSearch = React.useDeferredValue(
    searchTerm.trim().toLowerCase(),
  );

  const classGrouped: Section<TData>[] = React.useMemo(() => {
    return convertGroupedObjectToArray(groupBy(data, "section")).map(
      (item) => ({ title: item.section, data: item.data }),
    );
  }, [data]);

  const currentSectionLabel = React.useMemo(() => {
    if (selectedSection === "all") return "Toutes les sections";
    return (
      SECTION_OPTIONS.find((opt) => opt.value === selectedSection)?.label ||
      "Section"
    );
  }, [selectedSection]);

  const filteredGroups = React.useMemo(() => {
    if (!deferredSearch && selectedSection === "all") return classGrouped;

    return classGrouped
      .filter((g) => selectedSection === "all" || g.title === selectedSection)
      .map((g) => ({
        ...g,
        data: g.data.filter((c) =>
          c.identifier
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .includes(deferredSearch),
        ),
      }))
      .filter((g) => g.data.length > 0);
  }, [classGrouped, deferredSearch, selectedSection]);

  const handleClearSearch = React.useCallback(() => setSearchTerm(""), []);

  return {
    searchTerm,
    setSearchTerm,
    selectedSection,
    setSelectedSection,
    currentSectionLabel,
    filteredGroups,
    handleClearSearch,
  };
}
