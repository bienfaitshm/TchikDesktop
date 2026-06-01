"use client";

// import { AdvancedSearchEngine } from "@/renderer/components/search-engin";
import { DashBoardPage } from "./dashboard";
import { ScrollArea } from "../components/ui/scroll-area";
import { ChartBarDefault } from "../components/charts/chart-container";

export const HomePage = () => {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      <ScrollArea className="h-full w-full">
        <ChartBarDefault />
        <DashBoardPage />
      </ScrollArea>
    </div>
  );
};
