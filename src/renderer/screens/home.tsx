"use client";

// import { AdvancedSearchEngine } from "@/renderer/components/search-engin";
import { DashBoardPage } from "./dashboard";
import { ScrollArea } from "../components/ui/scroll-area";

export const HomePage = () => {
  return (
    <ScrollArea className="h-full w-full">
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-background container max-w-7xl">
        <DashBoardPage />
      </div>
    </ScrollArea>
  );
};
