"use client";

import React from "react";
import { NavLink, useNavigate, useParams } from "react-router";
import { ChevronLeft } from "lucide-react";

import {
  SidebarFlatList,
  SidebarItem,
} from "@/renderer/components/sidebar-menus";
import { Button } from "@/renderer/components/ui/button";
import { useGetSessionRoomsStatus } from "@/renderer/libs/queries/seating";
import { cn } from "@/renderer/utils";

interface LocalRoomStatus {
  localRoomId: string;
  roomName: string;
  assignedCount: number;
  maxCapacity: number;
  occupancyRate: number;
}

export const LocalroomSidebar: React.FC = () => {
  const { sessionId, localroomId } = useParams<{
    sessionId: string;
    localroomId: string;
  }>();
  const navigate = useNavigate();

  const { data: localrooms = [] } = useGetSessionRoomsStatus(sessionId!);

  return (
    <SidebarFlatList
      data={localrooms as LocalRoomStatus[]}
      listHeaderComponent={
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 rounded-md hover:bg-accent border border-border/40 shadow-sm"
              onClick={() => navigate(-1)}
              aria-label="Retour"
            >
              <ChevronLeft className="size-4 text-muted-foreground" />
            </Button>
            <h2 className="text-sm font-semibold tracking-tight truncate leading-none">
              Salles & Locaux
            </h2>
          </div>
        </div>
      }
      renderItem={(room) => {
        const isCritical = room.occupancyRate >= 90;
        const isFull = room.occupancyRate >= 100;

        return (
          <SidebarItem
            key={room.localRoomId}
            isActive={room.localRoomId === localroomId}
            asChild
            className="h-auto py-2"
          >
            <NavLink
              to={`/seating/${sessionId}/${room.localRoomId}`}
              className="flex flex-col gap-1.5 items-start w-full"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      isFull
                        ? "bg-red-500"
                        : isCritical
                          ? "bg-amber-500"
                          : "bg-emerald-500",
                    )}
                  />
                  <span className="truncate font-medium">{room.roomName}</span>
                </div>
                <span className="text-[10px] tabular-nums text-muted-foreground/70">
                  {room.assignedCount}/{room.maxCapacity}
                </span>
              </div>

              <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    isFull
                      ? "bg-red-500"
                      : isCritical
                        ? "bg-amber-500"
                        : "bg-primary/60",
                  )}
                  style={{ width: `${Math.min(room.occupancyRate, 100)}%` }}
                />
              </div>
            </NavLink>
          </SidebarItem>
        );
      }}
    />
  );
};

LocalroomSidebar.displayName = "LocalroomSidebar";
